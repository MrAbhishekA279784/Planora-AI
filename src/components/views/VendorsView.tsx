import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Star,
  MapPin,
  MessageSquare,
  ArrowRight,
  Heart,
  Scale,
  X,
  Compass,
  Plus,
  Minus,
  Sparkles,
  Send,
  Loader2,
  Bookmark,
  BookmarkCheck,
  Map as MapIcon,
  LayoutGrid,
  Trash2,
  Edit,
} from 'lucide-react';
import { AppRoute, VendorItem, EventItem } from '../../types';
import { filterVendors, sortVendors } from '../../utils/calculations';
import { VendorGoogleMap } from './VendorGoogleMap';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAuth } from '../../context/AuthContext';
import { AddCustomVendorModal } from '../modals/AddCustomVendorModal';

interface VendorsViewProps {
  vendors: VendorItem[];
  onSelectVendor: (vendor: VendorItem) => void;
  onToggleFavorite: (vendorId: string) => void;
  onToggleCompare: (vendorId: string) => void;
  onOpenCompareModal: () => void;
  onOpenInquiryModal: (vendor: VendorItem) => void;
  onRouteChange: (route: AppRoute) => void;
  activeEvent?: EventItem | null;
}

export const VendorsView: React.FC<VendorsViewProps> = ({
  vendors,
  onSelectVendor,
  onToggleFavorite,
  onToggleCompare,
  onOpenCompareModal,
  onOpenInquiryModal,
  onRouteChange,
  activeEvent,
}) => {
  const { getIdToken } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All Vendors');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Best Match');
  const [locationInput, setLocationInput] = useState(activeEvent?.location || '');
  const [budgetRange, setBudgetRange] = useState(500000);
  const [minRating, setMinRating] = useState(0);
  const [availabilityDate, setAvailabilityDate] = useState(activeEvent?.date || '');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Active Vendors Collection (Initial Mock Data + Live Supabase DB + Live Google Places)
  const [allVendors, setAllVendors] = useState<VendorItem[]>(vendors);
  const [selectedVendorForMap, setSelectedVendorForMap] = useState<VendorItem | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesAttribution, setPlacesAttribution] = useState('Powered by Google Places API');
  const [viewMode, setViewMode] = useState<'split' | 'full-map'>('split');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleDeleteCustomVendor = async (vendorId: string) => {
    try {
      const token = await getIdToken();
      await fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      setAllVendors((prev) => prev.filter((v) => v.id !== vendorId));
    } catch (err) {
      console.warn('Failed to delete vendor:', err);
    }
  };

  const categories = [
    'All Vendors',
    'Venue',
    'Catering',
    'Decoration',
    'Photography',
    'Entertainment',
    'Makeup & Styling',
    'Invitations',
  ];

  const categoryCounts: Record<string, number> = {
    'All Categories': allVendors.length,
    Venue: allVendors.filter((v) => v.category.toLowerCase().includes('venue')).length || 24,
    Catering: allVendors.filter((v) => v.category.toLowerCase().includes('cater')).length || 18,
    Decoration: allVendors.filter((v) => v.category.toLowerCase().includes('decor')).length || 16,
    Photography: allVendors.filter((v) => v.category.toLowerCase().includes('photo')).length || 20,
    Entertainment: allVendors.filter((v) => v.category.toLowerCase().includes('entertain')).length || 12,
    'Makeup & Styling': allVendors.filter((v) => v.category.toLowerCase().includes('makeup')).length || 10,
    Invitations: allVendors.filter((v) => v.category.toLowerCase().includes('invit')).length || 8,
    Others: 12,
  };

  // Sync initial vendors prop when updated
  useEffect(() => {
    setAllVendors((prev) => {
      const liveIds = new Set(prev.map((v) => v.id));
      const newlyAdded = vendors.filter((v) => !liveIds.has(v.id));
      return [...prev, ...newlyAdded];
    });
  }, [vendors]);

  // Fetch real Google Places and Supabase vendors on search / category filter
  useEffect(() => {
    let isCancelled = false;

    const fetchLiveVendors = async () => {
      setIsLoadingPlaces(true);
      try {
        const queryParams = new URLSearchParams();
        if (locationInput) queryParams.set('location', locationInput);
        if (selectedCategory && selectedCategory !== 'All Vendors') {
          queryParams.set('category', selectedCategory);
        }
        if (searchQuery) queryParams.set('query', searchQuery);

        const res = await fetch(`/api/vendors/search?${queryParams.toString()}`);
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (data && data.vendors && Array.isArray(data.vendors) && !isCancelled) {
            const transformed: VendorItem[] = data.vendors.map((v: any) => ({
              id: v.id || `vendor_${Math.random().toString(36).substring(2, 8)}`,
              name: v.name || 'Vendor Partner',
              category: v.category
                ? ((v.category.charAt(0).toUpperCase() + v.category.slice(1)) as any)
                : 'Venue',
              location: v.locationName || v.address || locationInput || 'Goa',
              distance: 'Nearby',
              rating: v.rawRating || 4.8,
              reviewCount: v.reviewCount || 110,
              priceDisplay: v.priceMin > 0 ? `₹${v.priceMin.toLocaleString('en-IN')}` : 'Custom Quote',
              priceMin: v.priceMin || 0,
              priceMax: v.priceMax || 0,
              image: v.images?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
              badge: v.isVerified ? 'Top Rated' : undefined,
              verified: Boolean(v.isVerified),
              capacity: '200 – 600 Guests',
              features: ['Verified', 'Event Service', 'Direct Booking'],
              description: v.description,
              gallery: v.images || [],
              latitude: typeof v.latitude === 'number' ? v.latitude : undefined,
              longitude: typeof v.longitude === 'number' ? v.longitude : undefined,
              address: v.address,
              phone: v.phone,
              website: v.website,
              placeId: v.googlePlaceId,
              source: v.source,
            }));

            setAllVendors((prev) => {
              const safePrev = Array.isArray(prev) ? prev : [];
              const prevMap = new Map(safePrev.map((item) => [item.id, item]));
              transformed.forEach((item) => {
                const existing = prevMap.get(item.id) || {};
                prevMap.set(item.id, { ...existing, ...item });
              });
              return Array.from(prevMap.values());
            });

            if (data.attribution) {
              setPlacesAttribution(data.attribution);
            }
          }
        }
      } catch (err) {
        console.warn('Live vendor search notice:', err);
      } finally {
        if (!isCancelled) setIsLoadingPlaces(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchLiveVendors();
    }, 450);

    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [locationInput, selectedCategory, searchQuery]);

  // Persist Vendor to Supabase / LocalDB
  const handleSaveVendor = async (vendor: VendorItem) => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: vendor.name,
          category: vendor.category,
          address: vendor.address || vendor.location,
          locationName: vendor.location,
          latitude: vendor.latitude,
          longitude: vendor.longitude,
          phone: vendor.phone,
          website: vendor.website,
          rating: vendor.rating,
          placeId: vendor.placeId,
          description: vendor.description,
          images: vendor.gallery,
          priceMin: vendor.priceMin,
          priceMax: vendor.priceMax,
          source: 'user_saved',
        }),
      });

      if (res.ok) {
        setAllVendors((prev) =>
          prev.map((v) =>
            v.id === vendor.id ? { ...v, isFavorite: true, source: 'user_saved' } : v
          )
        );
      }
    } catch (err) {
      console.warn('Save vendor notice:', err);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('All Vendors');
    setSearchQuery('');
    setSortBy('Best Match');
    setLocationInput(activeEvent?.location || 'Goa, India');
    setBudgetRange(500000);
    setMinRating(0);
    setAvailabilityDate('15 Feb 2026');
  };

  // Filter and sort vendors
  const filtered = filterVendors(allVendors, {
    category: selectedCategory,
    query: searchQuery,
    maxBudget: budgetRange,
    minRating: minRating,
    location: locationInput,
  });
  const displayedVendors = sortVendors(filtered, sortBy);

  const comparisonVendors = allVendors.filter((v) => v.inComparison);

  return (
    <div className="space-y-8 pb-16">
      {/* 8.1 Vendors Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FBF7EF] via-[#F8F0E4] to-[#F5E7D3] p-6 sm:p-8 border border-[#EDE2D3] text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-4">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#171412] tracking-tight">
              Find the <span className="italic font-serif text-[#B86B2A]">Perfect</span> Vendors
            </h1>
            <p className="text-xs sm:text-sm text-[#6D6A66] max-w-lg">
              Compare, plan and book trusted vendors with interactive Google Maps & verified directory.
            </p>

            {/* Benefit Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#7A3D19] font-medium">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFCF6] border border-[#EDE2D3] shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A66A]" /> Verified Vendors
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFCF6] border border-[#EDE2D3] shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-[#B86B2A]" /> Real Google Maps
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFCF6] border border-[#EDE2D3] shadow-2xs">
                <Scale className="w-3.5 h-3.5 text-[#B86B2A]" /> Compare Easily
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFCF6] border border-[#EDE2D3] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#B86B2A]" /> AI Recommendations
              </span>
            </div>

            <div className="font-serif text-xs sm:text-sm italic text-[#B86B2A] pt-1">
              Great events happen with great people
            </div>
          </div>

          {/* Right Fast Search Card */}
          <div className="lg:col-span-5 bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-5 shadow-sm space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D3]">
              <h3 className="font-serif font-bold text-base text-[#171412]">
                Fast Search
              </h3>
              <div className="flex items-center gap-1 bg-[#F8F0E4] p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === 'split' ? 'bg-[#7A3D19] text-white shadow-2xs' : 'text-[#6D6A66]'
                  }`}
                  title="Grid & Map Split View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid & Map</span>
                </button>
                <button
                  onClick={() => setViewMode('full-map')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === 'full-map' ? 'bg-[#7A3D19] text-white shadow-2xs' : 'text-[#6D6A66]'
                  }`}
                  title="Expanded Map Explorer View"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map Focus</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#171412] block mb-1">
                  Location (City or Area)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#928B83] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="e.g. Goa, Mumbai, Udaipur..."
                    className="w-full pl-9 pr-3 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none focus:border-[#B86B2A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#171412] block mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8.2 Category Pills Navigation */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-[#7A3D19] text-white shadow-xs'
                  : 'bg-[#FFFCF6] border border-[#EDE2D3] text-[#6D6A66] hover:bg-[#F8F0E4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Vendor</span>
          </button>

          {comparisonVendors.length > 0 && (
            <button
              onClick={onOpenCompareModal}
              className="px-4 py-2 rounded-xl bg-[#B86B2A] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({comparisonVendors.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* FULL MAP EXPLORER VIEW (If Selected) */}
      {viewMode === 'full-map' && (
        <div className="space-y-4">
          <ErrorBoundary name="FullVendorMap">
            <VendorGoogleMap
              vendors={displayedVendors}
              selectedVendor={selectedVendorForMap}
              onSelectVendor={(v) => setSelectedVendorForMap(v)}
              activeEvent={activeEvent}
              onSaveVendor={handleSaveVendor}
              onOpenInquiryModal={onOpenInquiryModal}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isLoadingPlaces={isLoadingPlaces}
              placesAttribution={placesAttribution}
              isExpanded={true}
            />
          </ErrorBoundary>

          {/* Horizontal scroll cards underneath full map */}
          <div className="space-y-2 text-left">
            <h4 className="font-serif font-bold text-sm text-[#171412]">
              Showing {displayedVendors.length} Vendors Plotted Near {locationInput}
            </h4>
            <div className="flex items-center gap-4 overflow-x-auto pb-3 no-scrollbar">
              {displayedVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedVendorForMap(vendor)}
                  className={`w-72 shrink-0 bg-[#FFFCF6] border rounded-2xl p-3 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center gap-3 ${
                    selectedVendorForMap?.id === vendor.id
                      ? 'border-[#7A3D19] ring-2 ring-[#B86B2A]/40'
                      : 'border-[#EDE2D3]'
                  }`}
                >
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A3D19]">
                      {vendor.category}
                    </span>
                    <h5 className="font-serif font-bold text-xs text-[#171412] truncate mt-0.5">
                      {vendor.name}
                    </h5>
                    <div className="text-[11px] text-[#6D6A66] truncate">{vendor.location}</div>
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span className="font-bold text-[#171412]">★ {vendor.rating}</span>
                      <span className="text-[#B86B2A] font-semibold">{vendor.priceDisplay.split('–')[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8.3 Three-Column Marketplace Layout (Default Split Mode) */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Filter Panel (~250px) */}
          <aside className="hidden lg:block lg:col-span-3 bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-5 text-left space-y-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D3]">
              <h3 className="font-serif font-bold text-base text-[#171412] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#B86B2A]" />
                Filters
              </h3>
              <button
                onClick={handleClearFilters}
                className="text-xs text-[#B86B2A] hover:underline font-semibold"
              >
                Clear All
              </button>
            </div>

            {/* Event Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171412] block">Event Location</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-[#928B83] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Enter city or area"
                  className="w-full pl-8 pr-7 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none focus:border-[#B86B2A]"
                />
                {locationInput && (
                  <button
                    onClick={() => setLocationInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#928B83] hover:text-[#171412]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Vendor Category Checkbox List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#171412] block">Vendor Category</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {Object.entries(categoryCounts).map(([catName, count]) => {
                  const isChecked =
                    (catName === 'All Categories' && selectedCategory === 'All Vendors') ||
                    selectedCategory === catName;
                  return (
                    <label
                      key={catName}
                      className="flex items-center justify-between text-xs text-[#6D6A66] hover:text-[#171412] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setSelectedCategory(catName === 'All Categories' ? 'All Vendors' : catName)
                          }
                          className="rounded accent-[#7A3D19]"
                        />
                        <span>{catName}</span>
                      </div>
                      <span className="text-[11px] text-[#928B83]">{count}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Budget Range (₹) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#171412]">Budget Range (₹)</span>
                <span className="font-semibold text-[#7A3D19]">
                  ₹{budgetRange >= 500000 ? '5,00,000+' : budgetRange.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={500000}
                step={10000}
                value={budgetRange}
                onChange={(e) => setBudgetRange(parseInt(e.target.value, 10))}
                className="w-full accent-[#7A3D19]"
              />
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#171412] block">Minimum Rating</label>
              <div className="flex items-center gap-1.5">
                {[0, 4, 4.5, 4.8].map((rt) => (
                  <button
                    key={rt}
                    onClick={() => setMinRating(rt)}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      minRating === rt
                        ? 'bg-[#7A3D19] border-[#7A3D19] text-white shadow-2xs'
                        : 'bg-[#FBF7EF] border-[#EDE2D3] text-[#6D6A66] hover:bg-[#F8F0E4]'
                    }`}
                  >
                    {rt === 0 ? 'All' : `${rt}★+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171412] block">Availability</label>
              <input
                type="text"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
                className="w-full p-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none"
              />
            </div>
          </aside>

          {/* Center Results: Search, Sort and Vendor Grid */}
          <div className="lg:col-span-5 space-y-5">
            {/* Search and Sort Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#928B83] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search vendors, e.g. "beach venue", "caterer", "photographer"...'
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FFFCF6] border border-[#EDE2D3] rounded-xl text-xs sm:text-sm text-[#171412] placeholder:text-[#928B83] focus:outline-none focus:border-[#B86B2A]"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <span className="text-xs text-[#928B83]">Sort by</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-[#FFFCF6] border border-[#EDE2D3] rounded-xl px-3.5 py-2 pr-8 text-xs font-medium text-[#171412] focus:outline-none cursor-pointer"
                  >
                    <option value="Best Match">Best Match</option>
                    <option value="Top Rated">Top Rated</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    <option value="Nearest">Nearest</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6D6A66] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Vendor Cards in 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {displayedVendors.map((vendor) => {
                const isSelectedOnMap = selectedVendorForMap?.id === vendor.id;
                const isGooglePlace = vendor.source === 'google_places';

                return (
                  <div
                    key={vendor.id}
                    onClick={() => setSelectedVendorForMap(vendor)}
                    className={`bg-[#FFFCF6] border rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer ${
                      isSelectedOnMap
                        ? 'border-[#7A3D19] ring-2 ring-[#B86B2A]/40'
                        : 'border-[#EDE2D3]'
                    }`}
                  >
                    {/* Image Area */}
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={vendor.image}
                        alt={vendor.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                      {/* Top-left Badge */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                        {vendor.source === 'user_saved' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#16A66A] text-[10px] font-bold text-white shadow-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Saved in Account
                          </span>
                        ) : isGooglePlace ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#1E40AF] text-[10px] font-bold text-white shadow-xs">
                            Google Places
                          </span>
                        ) : vendor.badge ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-[10px] font-bold text-[#7A3D19] shadow-xs">
                            {vendor.badge === 'Popular' && '🔥 '}
                            {vendor.badge === 'Top Rated' && '👑 '}
                            {vendor.badge === 'Trending' && '📈 '}
                            {vendor.badge}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#7A3D19] text-[10px] font-bold text-white shadow-xs">
                            Planora Verified
                          </span>
                        )}
                      </div>

                      {/* Top-right Actions */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        {vendor.source === 'user_saved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Remove ${vendor.name} from your account?`)) {
                                handleDeleteCustomVendor(vendor.id);
                              }
                            }}
                            className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center transition-colors shadow-2xs"
                            title="Delete custom vendor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(vendor.id);
                          }}
                          className="w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors shadow-2xs"
                          aria-label="Add to favorites"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              vendor.isFavorite ? 'fill-[#E94C45] text-[#E94C45]' : 'text-[#6D6A66]'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A3D19]">
                            {vendor.category}
                          </span>
                          {vendor.verified && (
                            <span className="text-[10px] font-bold text-[#16A66A] flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif font-bold text-sm text-[#171412] group-hover:text-[#7A3D19] transition-colors leading-snug line-clamp-1">
                          {vendor.name}
                        </h4>

                        {/* Rating row */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <Star className="w-3.5 h-3.5 text-[#D7A34B] fill-current" />
                          <span className="font-bold text-[#171412]">{vendor.rating}</span>
                          <span className="text-[11px] text-[#928B83]">
                            ({vendor.reviewCount} reviews)
                          </span>
                        </div>

                        {/* Location & Distance */}
                        <div className="flex items-center gap-1 text-[11px] text-[#6D6A66]">
                          <MapPin className="w-3 h-3 text-[#B86B2A] shrink-0" />
                          <span className="line-clamp-1">{vendor.location}</span>
                        </div>

                        {/* Price */}
                        <div className="text-xs font-semibold text-[#7A3D19] pt-1">
                          {vendor.priceDisplay}
                        </div>
                      </div>

                      {/* Action Row */}
                      <div className="pt-2 flex items-center gap-1.5 border-t border-[#EDE2D3]/60">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectVendor(vendor);
                          }}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVendorForMap(vendor);
                          }}
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                            isSelectedOnMap
                              ? 'bg-[#7A3D19] border-[#7A3D19] text-white shadow-2xs'
                              : 'bg-[#F8F0E4] hover:bg-[#FBE8D3] border-[#EDE2D3] text-[#7A3D19]'
                          }`}
                          title="Show on Google Map"
                          aria-label={`Show ${vendor.name} on map`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenInquiryModal(vendor);
                          }}
                          className="w-8 h-8 rounded-xl bg-[#F8F0E4] hover:bg-[#FBE8D3] text-[#7A3D19] flex items-center justify-center shrink-0"
                          aria-label="Message vendor"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar: Vendor Comparison, Live Google Map, AI Vendor Assistant (~380px) */}
          <div className="lg:col-span-4 space-y-5 text-left">
            {/* Panel 2: REAL GOOGLE MAPS PANEL */}
            <div className="space-y-2">
              <ErrorBoundary name="SidebarVendorMap">
                <VendorGoogleMap
                  vendors={displayedVendors}
                  selectedVendor={selectedVendorForMap}
                  onSelectVendor={(v) => setSelectedVendorForMap(v)}
                  activeEvent={activeEvent}
                  onSaveVendor={handleSaveVendor}
                  onOpenInquiryModal={onOpenInquiryModal}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  isLoadingPlaces={isLoadingPlaces}
                  placesAttribution={placesAttribution}
                  isExpanded={isMapExpanded}
                  onToggleExpand={() => setIsMapExpanded((prev) => !prev)}
                />
              </ErrorBoundary>
            </div>

            {/* Panel 1: Vendor Comparison */}
            <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#EDE2D3]">
                <h3 className="font-serif font-bold text-sm text-[#171412] flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#B86B2A]" />
                  Vendor Comparison
                </h3>
                <button
                  onClick={onOpenCompareModal}
                  className="text-xs font-semibold text-[#7A3D19] hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Selected Vendors List */}
              <div className="space-y-2">
                {comparisonVendors.slice(0, 3).map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-2 bg-[#F8F0E4]/60 rounded-xl border border-[#EDE2D3]/60"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={v.image}
                        alt={v.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="text-[11px] leading-tight">
                        <div className="font-bold text-[#171412] line-clamp-1">{v.name}</div>
                        <div className="text-[#928B83] flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-[#D7A34B] fill-current" />
                          <span>{v.rating}</span>
                          <span>•</span>
                          <span>{v.priceDisplay.split('–')[0]}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleCompare(v.id)}
                      className="w-5 h-5 rounded-full hover:bg-black/10 flex items-center justify-center text-[#928B83]"
                      aria-label={`Remove ${v.name} from comparison`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={onOpenCompareModal}
                disabled={comparisonVendors.length === 0}
                className="w-full py-2 px-3 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] disabled:bg-[#EDE2D3] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>Compare Selected ({comparisonVendors.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center">
          <div className="bg-[#FFFCF6] border-t border-[#EDE2D3] rounded-t-3xl p-6 w-full max-h-[85vh] overflow-y-auto space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D3]">
              <h3 className="font-serif font-bold text-lg text-[#171412]">
                Filter Vendors
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F8F0E4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-bold block mb-1">Location</label>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full p-2.5 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="text-xs font-bold block mb-1">
                Max Budget: ₹{budgetRange.toLocaleString('en-IN')}
              </label>
              <input
                type="range"
                min={20000}
                max={500000}
                step={10000}
                value={budgetRange}
                onChange={(e) => setBudgetRange(parseInt(e.target.value, 10))}
                className="w-full accent-[#7A3D19]"
              />
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => {
                  handleClearFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#F8F0E4] text-xs font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#7A3D19] text-white text-xs font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Vendor Modal */}
      <AddCustomVendorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onVendorAdded={(newVendor) => {
          setAllVendors((prev) => [newVendor, ...prev]);
        }}
        activeEvent={activeEvent}
      />
    </div>
  );
};
