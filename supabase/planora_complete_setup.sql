-- ============================================================================
-- Planora AI: Complete Production Supabase Database Setup & RLS Script
-- Version: 1.0.0
-- Target: Supabase PostgreSQL (Standard & Enterprise Editions)
-- ============================================================================

-- 1. Enable UUID Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLE DEFINITIONS
-- ============================================================================

-- Table 1: users (Profiles mapped from Firebase Auth / Supabase Auth UIDs)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  photo_url TEXT,
  phone TEXT,
  city TEXT,
  preferred_language TEXT DEFAULT 'English',
  bio TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: events (User event plans: weddings, birthdays, etc.)
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('wedding', 'birthday', 'community', 'other')),
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  location_name TEXT,
  location_address TEXT,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  expected_guests INTEGER DEFAULT 100,
  total_budget NUMERIC(12, 2) DEFAULT 0,
  selected_theme_id TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'planning', 'completed')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: tasks (Milestones and actionable tasks per event)
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  deadline DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: budgets (Financial allocations and expense categories)
CREATE TABLE IF NOT EXISTS public.budgets (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  category TEXT NOT NULL,
  planned_amount NUMERIC(12, 2) DEFAULT 0,
  actual_amount NUMERIC(12, 2) DEFAULT 0,
  vendor_id TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 5: guests (Guest lists and RSVP tracking)
CREATE TABLE IF NOT EXISTS public.guests (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  email TEXT,
  invitation_status TEXT DEFAULT 'not_sent' CHECK (invitation_status IN ('not_sent', 'sent', 'opened')),
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'accepted', 'declined')),
  plus_ones INTEGER DEFAULT 0,
  dietary_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 6: vendors (Platform verified vendors, Google Places, and user saved vendors)
CREATE TABLE IF NOT EXISTS public.vendors (
  id TEXT PRIMARY KEY,
  user_id TEXT, -- NULL for global platform vendors, populated for user-saved/custom vendors
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT,
  location_name TEXT,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  phone TEXT,
  website TEXT,
  rating NUMERIC(3, 2) DEFAULT 4.8,
  review_count INTEGER DEFAULT 100,
  place_id TEXT,
  price_min NUMERIC(12, 2) DEFAULT 0,
  price_max NUMERIC(12, 2) DEFAULT 0,
  price_unit TEXT DEFAULT 'per_event',
  description TEXT,
  images TEXT[],
  is_verified BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'platform' CHECK (source IN ('platform', 'google_places', 'user_saved', 'planora_db')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 7: ai_usage_logs (Token accounting, cost tracking, and quota limits)
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_id TEXT REFERENCES public.events(id) ON DELETE SET NULL,
  request_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  cached_tokens INTEGER DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 6) DEFAULT 0,
  status_code INTEGER DEFAULT 200,
  latency_ms INTEGER DEFAULT 0,
  error_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 8: calendar_connections (Google Calendar OAuth tokens and sync state)
CREATE TABLE IF NOT EXISTS public.calendar_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  google_account_id TEXT NOT NULL,
  calendar_id TEXT DEFAULT 'primary',
  connection_status TEXT DEFAULT 'connected' CHECK (connection_status IN ('connected', 'disconnected', 'revoked')),
  encrypted_refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ,
  scopes_granted TEXT[],
  last_synced_at TIMESTAMPTZ,
  last_error_log TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 9: platform_reviews (Platform reviews and Bayesian ratings)
CREATE TABLE IF NOT EXISTS public.platform_reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE & QUERY OPTIMIZATION
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_events_owner_id ON public.events(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON public.tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_budgets_event_id ON public.budgets(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_event_id ON public.guests(event_id);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_location ON public.vendors(location_name);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON public.ai_usage_logs(user_id, created_at);

-- ============================================================================
-- 4. AUTOMATIC updated_at TIMESTAMP TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_budgets_updated_at ON public.budgets;
CREATE TRIGGER set_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_vendors_updated_at ON public.vendors;
CREATE TRIGGER set_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Users Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = firebase_uid OR auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = firebase_uid OR auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = firebase_uid OR auth.uid()::text = id);

-- Events Policies
DROP POLICY IF EXISTS "Users can manage their own events" ON public.events;
CREATE POLICY "Users can manage their own events" ON public.events
  FOR ALL USING (auth.uid()::text = owner_id);

-- Tasks Policies
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;
CREATE POLICY "Users can manage their own tasks" ON public.tasks
  FOR ALL USING (auth.uid()::text = owner_id);

-- Budgets Policies
DROP POLICY IF EXISTS "Users can manage their own budgets" ON public.budgets;
CREATE POLICY "Users can manage their own budgets" ON public.budgets
  FOR ALL USING (auth.uid()::text = owner_id);

-- Guests Policies
DROP POLICY IF EXISTS "Users can manage their own guests" ON public.guests;
CREATE POLICY "Users can manage their own guests" ON public.guests
  FOR ALL USING (auth.uid()::text = owner_id);

-- Vendors Policies (Platform vendors are public readable; user-saved vendors are private)
DROP POLICY IF EXISTS "Anyone can read platform and google vendors" ON public.vendors;
CREATE POLICY "Anyone can read platform and google vendors" ON public.vendors
  FOR SELECT USING (user_id IS NULL OR source = 'platform' OR source = 'google_places' OR auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can manage their own saved vendors" ON public.vendors;
CREATE POLICY "Users can manage their own saved vendors" ON public.vendors
  FOR ALL USING (auth.uid()::text = user_id);

-- AI Usage Logs Policies
DROP POLICY IF EXISTS "Users can view and log their own AI usage" ON public.ai_usage_logs;
CREATE POLICY "Users can view and log their own AI usage" ON public.ai_usage_logs
  FOR ALL USING (auth.uid()::text = user_id);

-- Calendar Connections Policies
DROP POLICY IF EXISTS "Users can manage their own calendar connections" ON public.calendar_connections;
CREATE POLICY "Users can manage their own calendar connections" ON public.calendar_connections
  FOR ALL USING (auth.uid()::text = user_id);

-- Platform Reviews Policies
DROP POLICY IF EXISTS "Everyone can read approved reviews" ON public.platform_reviews;
CREATE POLICY "Everyone can read approved reviews" ON public.platform_reviews
  FOR SELECT USING (moderation_status = 'approved');

DROP POLICY IF EXISTS "Users can manage their own reviews" ON public.platform_reviews;
CREATE POLICY "Users can manage their own reviews" ON public.platform_reviews
  FOR ALL USING (auth.uid()::text = user_id);

-- ============================================================================
-- 7. SUPABASE STORAGE (AVATARS BUCKET & POLICIES)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public avatar read access
DROP POLICY IF EXISTS "Public can view avatar pictures" ON storage.objects;
CREATE POLICY "Public can view avatar pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated user avatar upload access
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Authenticated user avatar update access
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Authenticated user avatar deletion access
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- End of Complete Planora AI Supabase Setup Script
-- ============================================================================
