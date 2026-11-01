-- ==============================================================================
-- Planora AI — Vendor Map & Places Database Migration
-- File: supabase/vendor_map_setup.sql
-- Description: Sets up vendor management, geographic indexing, constraints,
--              and Row Level Security (RLS) policies for Planora AI.
-- Execution Order: Run this script in the Supabase SQL Editor.
-- ==============================================================================

-- 1. Ensure UUID Extension is Enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE OR UPDATE VENDORS TABLE
-- Stores platform-curated vendors and user-saved/custom vendors.
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(128) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (
    category IN ('venue', 'catering', 'decoration', 'photography', 'entertainment', 'makeup', 'invitations', 'others')
  ),
  address TEXT,
  location_name VARCHAR(150),
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180.0 AND longitude <= 180.0),
  phone VARCHAR(50),
  website TEXT,
  rating NUMERIC(3, 2) DEFAULT 0.00 CHECK (rating >= 0.0 AND rating <= 5.0),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  place_id VARCHAR(255),
  price_min NUMERIC(12, 2) DEFAULT 0.00 CHECK (price_min >= 0),
  price_max NUMERIC(12, 2) DEFAULT 0.00 CHECK (price_max >= 0),
  price_unit VARCHAR(30) DEFAULT 'per_event',
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  source VARCHAR(30) DEFAULT 'planora_db' CHECK (source IN ('platform', 'google_places', 'user_saved', 'planora_db')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add any missing columns if table pre-existed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'user_id') THEN
    ALTER TABLE vendors ADD COLUMN user_id VARCHAR(128) REFERENCES users(firebase_uid) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'address') THEN
    ALTER TABLE vendors ADD COLUMN address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'phone') THEN
    ALTER TABLE vendors ADD COLUMN phone VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'website') THEN
    ALTER TABLE vendors ADD COLUMN website TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'place_id') THEN
    ALTER TABLE vendors ADD COLUMN place_id VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'updated_at') THEN
    ALTER TABLE vendors ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 3. INDEXES FOR PERFORMANCE & GEOGRAPHIC LOOKUPS
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_source ON vendors(source);
CREATE INDEX IF NOT EXISTS idx_vendors_coordinates ON vendors(latitude, longitude);

-- Uniqueness constraint: Prevent duplicate saved Google Places entries per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendors_user_place_unique
  ON vendors(user_id, place_id)
  WHERE user_id IS NOT NULL AND place_id IS NOT NULL;

-- 4. VENDOR ENQUIRIES & COMPARISONS TABLES
CREATE TABLE IF NOT EXISTS vendor_enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(128) NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'responded', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vendor_enquiries_user ON vendor_enquiries(user_id);

CREATE TABLE IF NOT EXISTS vendor_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(128) NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  vendor_ids TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_event_comparison UNIQUE (user_id, event_id)
);
CREATE INDEX IF NOT EXISTS idx_vendor_comparisons_user ON vendor_comparisons(user_id);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_comparisons ENABLE ROW LEVEL SECURITY;

-- Helper function for current authenticated user ID
CREATE OR REPLACE FUNCTION current_app_user() RETURNS VARCHAR AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    NULLIF(current_setting('app.current_user_id', true), ''),
    auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- VENDORS POLICIES:
-- A. SELECT: Public/platform vendors viewable by all; user-saved vendors viewable ONLY by owner.
DROP POLICY IF EXISTS vendors_select_policy ON vendors;
CREATE POLICY vendors_select_policy ON vendors
  FOR SELECT
  USING (
    user_id IS NULL 
    OR source = 'platform' 
    OR user_id = current_app_user()
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
  );

-- B. INSERT: Authenticated users can insert vendors with their user_id.
DROP POLICY IF EXISTS vendors_insert_policy ON vendors;
CREATE POLICY vendors_insert_policy ON vendors
  FOR INSERT
  WITH CHECK (
    user_id IS NOT NULL 
    AND (
      user_id = current_app_user()
      OR (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
    )
  );

-- C. UPDATE: Users can modify ONLY vendors they own.
DROP POLICY IF EXISTS vendors_update_policy ON vendors;
CREATE POLICY vendors_update_policy ON vendors
  FOR UPDATE
  USING (
    user_id IS NOT NULL 
    AND (
      user_id = current_app_user()
      OR (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
    )
  )
  WITH CHECK (
    user_id IS NOT NULL 
    AND (
      user_id = current_app_user()
      OR (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
    )
  );

-- D. DELETE: Users can delete ONLY vendors they own.
DROP POLICY IF EXISTS vendors_delete_policy ON vendors;
CREATE POLICY vendors_delete_policy ON vendors
  FOR DELETE
  USING (
    user_id IS NOT NULL 
    AND (
      user_id = current_app_user()
      OR (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
    )
  );

-- VENDOR ENQUIRIES POLICIES:
DROP POLICY IF EXISTS enquiries_owner_policy ON vendor_enquiries;
CREATE POLICY enquiries_owner_policy ON vendor_enquiries
  FOR ALL
  USING (
    user_id = current_app_user() 
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
  )
  WITH CHECK (
    user_id = current_app_user() 
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
  );

-- VENDOR COMPARISONS POLICIES:
DROP POLICY IF EXISTS comparisons_owner_policy ON vendor_comparisons;
CREATE POLICY comparisons_owner_policy ON vendor_comparisons
  FOR ALL
  USING (
    user_id = current_app_user() 
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
  )
  WITH CHECK (
    user_id = current_app_user() 
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
  );

-- ==============================================================================
-- 6. SEED VERIFIED PLATFORM VENDORS
-- Real coordinates in Goa, India for initial map exploration
-- ==============================================================================
INSERT INTO vendors (
  id, user_id, name, category, address, location_name, latitude, longitude,
  phone, website, rating, review_count, is_verified, source, price_min, price_max, price_unit, description, images
) VALUES 
(
  'e2b4f101-7001-4c60-a111-000000000001',
  NULL,
  'Taj Fort Aguada Resort & Spa',
  'venue',
  'Sinquerim, Candolim, Goa 403515, India',
  'Candolim, Goa',
  15.498877,
  73.766324,
  '+91 832 664 5858',
  'https://www.tajhotels.com',
  4.8,
  340,
  TRUE,
  'platform',
  350000,
  800000,
  'per_event',
  'Iconic clifftop luxury heritage resort overlooking the Arabian Sea, featuring sprawling beachside lawns and royal event pavilions.',
  ARRAY['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80']
),
(
  'e2b4f101-7001-4c60-a111-000000000002',
  NULL,
  'SpiceCraft Artisanal Catering',
  'catering',
  'MG Road, Panaji, Goa 403001, India',
  'Panaji, Goa',
  15.498920,
  73.827850,
  '+91 982 211 4455',
  'https://spicecraftgoa.com',
  4.9,
  210,
  TRUE,
  'platform',
  900,
  1800,
  'per_plate',
  'Signature multi-cuisine wedding catering showcasing authentic Goan coastal delicacies, royal Mughal banquets, and modern interactive gourmet stations.',
  ARRAY['https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80']
),
(
  'e2b4f101-7001-4c60-a111-000000000003',
  NULL,
  'Blush & Bloom Floral Design',
  'decoration',
  'Calangute Beach Road, Calangute, Goa 403516, India',
  'Calangute, Goa',
  15.543200,
  73.755400,
  '+91 976 432 1098',
  'https://blushandbloomdecor.in',
  4.7,
  185,
  TRUE,
  'platform',
  80000,
  300000,
  'per_event',
  'Bespoke floral architecture, bohemian beachfront mandaps, and fairy-lit canopy styling designed for romantic coastal celebrations.',
  ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80']
),
(
  'e2b4f101-7001-4c60-a111-000000000004',
  NULL,
  'Moments Cinematography & Photography',
  'photography',
  'Mapusa Market Circle, Mapusa, Goa 403507, India',
  'Mapusa, Goa',
  15.592100,
  73.812300,
  '+91 989 012 3456',
  'https://momentsgoa.photo',
  4.8,
  420,
  TRUE,
  'platform',
  50000,
  150000,
  'per_event',
  'Award-winning cinematic storytelling, candid bridal portraiture, and high-altitude 4K drone cinematography capturing timeless emotions.',
  ARRAY['https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80']
)
ON CONFLICT (id) DO NOTHING;
