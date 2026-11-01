import { supabase, localDb, DbVendor } from '../config/supabase';

export interface VendorSearchParams {
  location?: string;
  category?: string;
  query?: string;
  userId?: string;
  latitude?: number;
  longitude?: number;
}

export interface VendorResult {
  id: string;
  userId?: string | null;
  name: string;
  category: string;
  locationName: string;
  address?: string;
  latitude: number;
  longitude: number;
  priceMin: number;
  priceMax: number;
  priceUnit: string;
  description: string;
  images: string[];
  googlePlaceId?: string;
  phone?: string;
  website?: string;
  rawRating: number;
  reviewCount: number;
  isVerified: boolean;
  source: 'platform' | 'google_places' | 'user_saved' | 'planora_db';
}

function mapGoogleTypeToCategory(primaryType?: string, requestedCategory?: string): string {
  if (requestedCategory && requestedCategory !== 'All Vendors' && requestedCategory !== 'all') {
    return requestedCategory.toLowerCase();
  }
  if (!primaryType) return 'venue';
  const pt = primaryType.toLowerCase();
  if (pt.includes('restaurant') || pt.includes('cater') || pt.includes('food') || pt.includes('bakery')) return 'catering';
  if (pt.includes('photo') || pt.includes('camera') || pt.includes('film')) return 'photography';
  if (pt.includes('florist') || pt.includes('decor') || pt.includes('interior')) return 'decoration';
  if (pt.includes('beauty') || pt.includes('spa') || pt.includes('salon') || pt.includes('hair')) return 'makeup';
  if (pt.includes('hotel') || pt.includes('resort') || pt.includes('banquet') || pt.includes('hall') || pt.includes('event_venue')) return 'venue';
  if (pt.includes('entertainment') || pt.includes('dj') || pt.includes('music')) return 'entertainment';
  return 'venue';
}

// 1. Fetch saved vendors from Supabase (with LocalDB fallback)
export async function getSavedVendors(params: VendorSearchParams): Promise<VendorResult[]> {
  let dbVendors: any[] = [];

  if (supabase) {
    try {
      let query = supabase.from('vendors').select('*');
      if (params.category && params.category !== 'all' && params.category !== 'All Vendors') {
        query = query.eq('category', params.category.toLowerCase());
      }
      if (params.userId) {
        // User's own saved vendors or platform vendors
        query = query.or(`user_id.is.null,source.eq.platform,user_id.eq.${params.userId}`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        dbVendors = data;
      }
    } catch (err) {
      console.warn('Supabase getSavedVendors fallback notice:', err);
    }
  }

  if (dbVendors.length === 0) {
    const local = await localDb.getVendors({
      category: params.category,
      location: params.location,
      search: params.query,
      userId: params.userId,
    });
    dbVendors = local;
  }

  return dbVendors.map((v) => ({
    id: v.id,
    userId: v.user_id,
    name: v.name,
    category: v.category,
    locationName: v.location_name || v.address || 'Goa, India',
    address: v.address || v.location_name || '',
    latitude: Number(v.latitude),
    longitude: Number(v.longitude),
    priceMin: Number(v.price_min) || 0,
    priceMax: Number(v.price_max) || 0,
    priceUnit: v.price_unit || 'per_event',
    description: v.description || '',
    images: v.images && v.images.length > 0 ? v.images : ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'],
    googlePlaceId: v.place_id || v.google_place_id,
    phone: v.phone || '',
    website: v.website || '',
    rawRating: Number(v.rating || v.raw_rating) || 0,
    reviewCount: Number(v.review_count) || 0,
    isVerified: Boolean(v.is_verified),
    source: v.source || 'platform',
  }));
}

// 2. Search Real Google Places using Places API (New)
export async function searchGooglePlaces(params: {
  query?: string;
  category?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}): Promise<{ vendors: VendorResult[]; attribution: string }> {
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      vendors: [],
      attribution: 'Google Places API key is unconfigured.',
    };
  }

  // Construct structured search query
  const categoryTerms: Record<string, string> = {
    venue: 'wedding venue resort banquet hall',
    catering: 'wedding catering gourmet caterer',
    decoration: 'wedding flower decoration stage decor',
    photography: 'wedding photographer cinematic photography',
    entertainment: 'wedding DJ live music band',
    makeup: 'bridal makeup artist beauty salon',
    invitations: 'wedding invitation card designer printing',
  };

  const selectedCategory = params.category?.toLowerCase() || 'venue';
  const categoryTerm = categoryTerms[selectedCategory] || selectedCategory;
  const locationTerm = params.location || 'Goa, India';
  const textQuery = params.query ? `${params.query} in ${locationTerm}` : `${categoryTerm} in ${locationTerm}`;

  try {
    const requestBody: Record<string, any> = {
      textQuery,
      maxResultCount: 10,
    };

    if (params.latitude && params.longitude) {
      requestBody.locationBias = {
        circle: {
          center: { latitude: params.latitude, longitude: params.longitude },
          radius: 15000.0, // 15km radius
        },
      };
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.internationalPhoneNumber,places.websiteUri,places.primaryType,places.editorialSummary',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Google Places API notice:', response.status, errText);
      return { vendors: [], attribution: `Google Places API returned status ${response.status}` };
    }

    const data = await response.json();
    const places = data.places || [];

    const mappedVendors: VendorResult[] = places
      .filter((p: any) => p.location && p.location.latitude && p.location.longitude)
      .map((p: any) => ({
        id: `gplace_${p.id}`,
        userId: null,
        name: p.displayName?.text || 'Local Event Specialist',
        category: mapGoogleTypeToCategory(p.primaryType, params.category),
        locationName: p.formattedAddress?.split(',').slice(-3, -1).join(',').trim() || locationTerm,
        address: p.formattedAddress || locationTerm,
        latitude: p.location.latitude,
        longitude: p.location.longitude,
        priceMin: 0,
        priceMax: 0,
        priceUnit: 'Contact for Quote',
        description: p.editorialSummary?.text || `Real business retrieved via Google Places at ${p.formattedAddress}`,
        images: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'],
        googlePlaceId: p.id,
        phone: p.internationalPhoneNumber || '',
        website: p.websiteUri || '',
        rawRating: p.rating || 0,
        reviewCount: p.userRatingCount || 0,
        isVerified: false, // Per Google terms, do not label 3P places as verified unless verified in Planora
        source: 'google_places' as const,
      }));

    return {
      vendors: mappedVendors,
      attribution: 'Powered by Google Places API',
    };
  } catch (err: any) {
    console.error('Error in searchGooglePlaces:', err.message);
    return {
      vendors: [],
      attribution: 'Network or API error while contacting Google Places',
    };
  }
}

// 3. Unified Search: Combines Database Vendors and Google Places Results
export async function searchVendors(params: VendorSearchParams): Promise<VendorResult[]> {
  const dbResults = await getSavedVendors(params);

  // If user searched a location or specific category, enrich with live Google Places
  let googleResults: VendorResult[] = [];
  try {
    const placesResponse = await searchGooglePlaces({
      query: params.query,
      category: params.category,
      location: params.location,
      latitude: params.latitude,
      longitude: params.longitude,
    });
    googleResults = placesResponse.vendors;
  } catch {
    // Non-blocking fallback
  }

  // Combine: prioritize user/platform database vendors, then real Google Places
  const existingPlaceIds = new Set(dbResults.map((v) => v.googlePlaceId).filter(Boolean));
  const uniqueGoogleResults = googleResults.filter((g) => !existingPlaceIds.has(g.googlePlaceId));

  return [...dbResults, ...uniqueGoogleResults];
}
