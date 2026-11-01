import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { searchVendors, searchGooglePlaces, getSavedVendors } from '../services/vendorService';
import { localDb, supabase } from '../config/supabase';

const router = Router();

// GET /api/vendors - Fetch saved database vendors (platform + user-owned)
router.get('/', async (req, res): Promise<void> => {
  try {
    const { category, location, query, userId } = req.query;
    const vendors = await getSavedVendors({
      category: typeof category === 'string' ? category : undefined,
      location: typeof location === 'string' ? location : undefined,
      query: typeof query === 'string' ? query : undefined,
      userId: typeof userId === 'string' ? userId : undefined,
    });
    res.json({ success: true, count: vendors.length, vendors });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve vendors', details: err.message });
  }
});

// GET /api/vendors/search - Unified Search (Platform DB + Live Google Places)
router.get('/search', async (req, res): Promise<void> => {
  try {
    const { location, category, query, lat, lng } = req.query;
    const latitude = lat ? parseFloat(lat as string) : undefined;
    const longitude = lng ? parseFloat(lng as string) : undefined;

    const results = await searchVendors({
      location: typeof location === 'string' ? location : undefined,
      category: typeof category === 'string' ? category : undefined,
      query: typeof query === 'string' ? query : undefined,
      latitude: !isNaN(latitude!) ? latitude : undefined,
      longitude: !isNaN(longitude!) ? longitude : undefined,
    });

    res.json({ success: true, count: results.length, vendors: results });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to search vendors', details: err.message });
  }
});

// GET /api/vendors/google-places - Real-time Google Places API search
router.get('/google-places', async (req, res): Promise<void> => {
  try {
    const { location, category, query, lat, lng } = req.query;
    const latitude = lat ? parseFloat(lat as string) : undefined;
    const longitude = lng ? parseFloat(lng as string) : undefined;

    const result = await searchGooglePlaces({
      location: typeof location === 'string' ? location : undefined,
      category: typeof category === 'string' ? category : undefined,
      query: typeof query === 'string' ? query : undefined,
      latitude: !isNaN(latitude!) ? latitude : undefined,
      longitude: !isNaN(longitude!) ? longitude : undefined,
    });

    res.json({
      success: true,
      count: result.vendors.length,
      vendors: result.vendors,
      attribution: result.attribution,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Google Places search failed', details: err.message });
  }
});

// POST /api/vendors - Save or bookmark a vendor in Supabase (Authenticated)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    const {
      name,
      category,
      address,
      locationName,
      latitude,
      longitude,
      phone,
      website,
      rating,
      placeId,
      description,
      images,
      priceMin,
      priceMax,
      priceUnit,
      source,
    } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: 'Vendor name, latitude, and longitude are required' });
      return;
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      res.status(400).json({ error: 'Invalid latitude or longitude range' });
      return;
    }

    const vendorPayload = {
      user_id: userId,
      name,
      category: (category || 'venue').toLowerCase(),
      address: address || locationName || '',
      location_name: locationName || address || '',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      phone: phone || '',
      website: website || '',
      rating: rating ? parseFloat(rating) : 0,
      place_id: placeId || null,
      description: description || '',
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'],
      price_min: priceMin ? parseFloat(priceMin) : 0,
      price_max: priceMax ? parseFloat(priceMax) : 0,
      price_unit: priceUnit || 'per_event',
      source: source || 'user_saved',
      is_verified: false,
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('vendors')
        .insert(vendorPayload)
        .select()
        .single();

      if (!error && data) {
        res.status(201).json({ success: true, vendor: data });
        return;
      }
      if (error) {
        console.warn('Supabase vendor insert notice:', error);
      }
    }

    const saved = await localDb.saveVendor(vendorPayload as any);
    res.status(201).json({ success: true, vendor: saved });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save vendor', details: err.message });
  }
});

// PUT /api/vendors/:id - Update user-owned vendor (Authenticated)
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.user_id;

    if (supabase) {
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (!error && data) {
        res.json({ success: true, vendor: data });
        return;
      }
    }

    const updated = await localDb.updateVendor(id, userId, updates);
    if (!updated) {
      res.status(404).json({ error: 'Vendor not found or unauthorized' });
      return;
    }
    res.json({ success: true, vendor: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update vendor', details: err.message });
  }
});

// DELETE /api/vendors/:id - Delete user-owned vendor (Authenticated)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;

    if (supabase) {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (!error) {
        res.json({ success: true, message: 'Vendor removed successfully' });
        return;
      }
    }

    const deleted = await localDb.deleteVendor(id, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Vendor not found or unauthorized' });
      return;
    }
    res.json({ success: true, message: 'Vendor removed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete vendor', details: err.message });
  }
});

// POST /api/vendors/enquire - Send vendor enquiry
router.post('/enquire', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    const { vendorId, eventId, message } = req.body;

    if (!vendorId || !message) {
      res.status(400).json({ error: 'vendorId and message are required' });
      return;
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('vendor_enquiries')
        .insert({
          user_id: userId,
          event_id: eventId || null,
          vendor_id: vendorId,
          message,
          status: 'pending',
        })
        .select()
        .single();

      if (!error && data) {
        res.status(201).json({ success: true, enquiry: data });
        return;
      }
    }

    res.status(201).json({
      success: true,
      enquiry: {
        id: `enq_${Date.now()}`,
        userId,
        vendorId,
        message,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit enquiry', details: err.message });
  }
});

// POST /api/vendors/compare - Save vendor comparison
router.post('/compare', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    const { eventId, vendorIds } = req.body;

    if (!Array.isArray(vendorIds)) {
      res.status(400).json({ error: 'vendorIds must be an array' });
      return;
    }

    if (supabase) {
      await supabase.from('vendor_comparisons').upsert({
        user_id: userId,
        event_id: eventId || null,
        vendor_ids: vendorIds,
        updated_at: new Date().toISOString(),
      });
    }

    res.json({ success: true, message: 'Vendor comparison saved successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save comparison', details: err.message });
  }
});

export default router;
