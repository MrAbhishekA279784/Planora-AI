-- Planora AI Version-Controlled SQL Migration 001
-- PostgreSQL Database Schema & Row Level Security Policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  photo_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  locale VARCHAR(10) DEFAULT 'en-US',
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id VARCHAR(128) NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('wedding', 'birthday', 'community', 'corporate', 'other')),
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  location_name VARCHAR(255),
  location_address TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  expected_guests INTEGER DEFAULT 0 CHECK (expected_guests >= 0),
  total_budget NUMERIC(12, 2) DEFAULT 0.00 CHECK (total_budget >= 0),
  selected_theme_id UUID,
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('draft', 'planning', 'upcoming', 'completed', 'cancelled')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_owner_id ON events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 3. EVENT TASKS AND TIMELINE TABLE
CREATE TABLE IF NOT EXISTS event_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  owner_id VARCHAR(128) NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  task_name VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_to VARCHAR(100),
  deadline DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_event_owner ON event_tasks(event_id, owner_id);

-- 4. BUDGET MANAGEMENT TABLE
CREATE TABLE IF NOT EXISTS event_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  owner_id VARCHAR(128) NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('venue', 'catering', 'decoration', 'photography', 'entertainment', 'makeup', 'invitations', 'others')),
  planned_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (planned_amount >= 0),
  actual_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (actual_amount >= 0),
  vendor_id UUID,
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_budgets_event_owner ON event_budgets(event_id, owner_id);

-- 5. GUEST MANAGEMENT TABLE
CREATE TABLE IF NOT EXISTS event_guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  owner_id VARCHAR(128) NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  guest_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  invitation_status VARCHAR(20) DEFAULT 'not_sent' CHECK (invitation_status IN ('not_sent', 'sent', 'opened')),
  rsvp_status VARCHAR(20) DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'accepted', 'declined')),
  plus_ones INTEGER DEFAULT 0 CHECK (plus_ones >= 0),
  dietary_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guests_event_owner ON event_guests(event_id, owner_id);

-- 6. THEMES TABLE
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id VARCHAR(128) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  theme_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  color_palette JSONB NOT NULL,
  cover_image_url TEXT,
  decor_elements JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_themes_public_owner ON themes(is_public, owner_id);

-- 7. VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('venue', 'catering', 'decoration', 'photography', 'entertainment', 'makeup', 'invitations', 'others')),
  location_name VARCHAR(150) NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  price_min NUMERIC(12, 2) DEFAULT 0.00,
  price_max NUMERIC(12, 2) DEFAULT 0.00,
  price_unit VARCHAR(30) DEFAULT 'per_event',
  description TEXT,
  images TEXT[] DEFAULT '{}',
  google_place_id VARCHAR(255) UNIQUE,
  raw_rating NUMERIC(3, 2) DEFAULT 0.00 CHECK (raw_rating BETWEEN 0 AND 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  is_verified BOOLEAN DEFAULT FALSE,
  source VARCHAR(20) DEFAULT 'platform' CHECK (source IN ('platform', 'google_places', 'user_submitted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vendors_category_location ON vendors(category, location_name);

-- 8. PLATFORM REVIEWS TABLE
CREATE TABLE IF NOT EXISTS platform_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(128) UNIQUE NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_reviews ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION current_app_user() RETURNS VARCHAR AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claim.sub', true),
    current_setting('app.current_user_id', true)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- User Profiles Policy
DROP POLICY IF EXISTS users_self_policy ON users;
CREATE POLICY users_self_policy ON users
  FOR ALL USING (firebase_uid = current_app_user());

-- Events Policy
DROP POLICY IF EXISTS events_owner_policy ON events;
CREATE POLICY events_owner_policy ON events
  FOR ALL USING (owner_id = current_app_user());

-- Tasks Policy
DROP POLICY IF EXISTS tasks_owner_policy ON event_tasks;
CREATE POLICY tasks_owner_policy ON event_tasks
  FOR ALL USING (owner_id = current_app_user());

-- Budgets Policy
DROP POLICY IF EXISTS budgets_owner_policy ON event_budgets;
CREATE POLICY budgets_owner_policy ON event_budgets
  FOR ALL USING (owner_id = current_app_user());

-- Guests Policy
DROP POLICY IF EXISTS guests_owner_policy ON event_guests;
CREATE POLICY guests_owner_policy ON event_guests
  FOR ALL USING (owner_id = current_app_user());
