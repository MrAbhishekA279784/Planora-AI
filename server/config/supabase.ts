import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } catch (err) {
    console.warn('Supabase initialization warning:', err);
  }
}

// Neutral Default Avatar Data URL (silhouette in Planora palette)
export const DEFAULT_NEUTRAL_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128' fill='none'%3E%3Ccircle cx='64' cy='64' r='64' fill='%23EDE2D3'/%3E%3Ccircle cx='64' cy='46' r='22' fill='%23928B83'/%3E%3Cpath d='M24 106c0-22.091 17.909-40 40-40s40 17.909 40 40H24z' fill='%23928B83'/%3E%3C/svg%3E";

// In-Memory & Local Storage Fallback Adapter for Full-Stack Reliability
export interface DbUser {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string;
  photo_url: string;
  phone?: string;
  city?: string;
  preferred_language?: string;
  bio?: string;
  onboarding_completed?: boolean;
  subscription_tier: string;
  created_at: string;
  last_login_at: string;
  updated_at?: string;
}

export interface DbEvent {
  id: string;
  owner_id: string;
  name: string;
  event_type: string;
  description: string;
  start_date: string;
  end_date?: string;
  location_name?: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  expected_guests?: number;
  total_budget: number;
  selected_theme_id?: string;
  status: string;
  completion_percentage: number;
  created_at: string;
  updated_at?: string;
}

export interface DbTask {
  id: string;
  event_id: string;
  owner_id: string;
  task_name: string;
  description?: string;
  assigned_to?: string;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completed_at?: string;
  created_at: string;
}

export interface DbBudget {
  id: string;
  event_id: string;
  owner_id: string;
  category: string;
  planned_amount: number;
  actual_amount: number;
  vendor_id?: string;
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  updated_at: string;
}

export interface DbGuest {
  id: string;
  event_id: string;
  owner_id: string;
  guest_name: string;
  email?: string;
  invitation_status: 'not_sent' | 'sent' | 'opened';
  rsvp_status: 'pending' | 'accepted' | 'declined';
  plus_ones: number;
  dietary_notes?: string;
  created_at: string;
}

export interface DbAiUsageLog {
  id: string;
  user_id: string;
  event_id?: string;
  request_id: string;
  feature_name: string;
  model_name: string;
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
  estimated_cost_usd: number;
  status_code: number;
  latency_ms: number;
  error_details?: string;
  created_at: string;
}

export interface DbCalendarConnection {
  id: string;
  user_id: string;
  google_account_id: string;
  calendar_id: string;
  connection_status: 'connected' | 'disconnected' | 'revoked';
  encrypted_refresh_token: string;
  token_expiry?: string;
  scopes_granted: string[];
  last_synced_at?: string;
  last_error_log?: string;
  updated_at: string;
}

export interface DbPlatformReview {
  id: string;
  user_id: string;
  rating: number;
  review_text: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface DbVendor {
  id: string;
  user_id?: string | null;
  name: string;
  category: string;
  address?: string;
  location_name?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating?: number;
  review_count?: number;
  place_id?: string;
  price_min?: number;
  price_max?: number;
  price_unit?: string;
  description?: string;
  images?: string[];
  is_verified?: boolean;
  source: 'platform' | 'google_places' | 'user_saved' | 'planora_db';
  created_at: string;
  updated_at: string;
}

class LocalDatabase {
  private users = new Map<string, DbUser>();
  private events = new Map<string, DbEvent>();
  private tasks = new Map<string, DbTask>();
  private budgets = new Map<string, DbBudget>();
  private guests = new Map<string, DbGuest>();
  private aiLogs = new Map<string, DbAiUsageLog>();
  private calendarConnections = new Map<string, DbCalendarConnection>();
  private reviews = new Map<string, DbPlatformReview>();
  private vendors = new Map<string, DbVendor>();

  constructor() {
    // Seed verified platform vendors with real coordinates
    const seedVendors: DbVendor[] = [
      {
        id: 'v_taj_goa',
        user_id: null,
        name: 'Taj Fort Aguada Resort & Spa',
        category: 'venue',
        address: 'Sinquerim, Candolim, Goa 403515, India',
        location_name: 'Candolim, Goa',
        latitude: 15.498877,
        longitude: 73.766324,
        phone: '+91 832 664 5858',
        website: 'https://www.tajhotels.com',
        rating: 4.8,
        review_count: 340,
        is_verified: true,
        source: 'platform',
        price_min: 350000,
        price_max: 800000,
        price_unit: 'per_event',
        description: 'Iconic clifftop luxury heritage resort overlooking the Arabian Sea, featuring sprawling beachside lawns and royal event pavilions.',
        images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'v_spicecraft',
        user_id: null,
        name: 'SpiceCraft Artisanal Catering',
        category: 'catering',
        address: 'MG Road, Panaji, Goa 403001, India',
        location_name: 'Panaji, Goa',
        latitude: 15.498920,
        longitude: 73.827850,
        phone: '+91 982 211 4455',
        website: 'https://spicecraftgoa.com',
        rating: 4.9,
        review_count: 210,
        is_verified: true,
        source: 'platform',
        price_min: 900,
        price_max: 1800,
        price_unit: 'per_plate',
        description: 'Signature multi-cuisine wedding catering showcasing authentic Goan coastal delicacies, royal banquets, and modern interactive gourmet stations.',
        images: ['https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'v_blush_bloom',
        user_id: null,
        name: 'Blush & Bloom Floral Design',
        category: 'decoration',
        address: 'Calangute Beach Road, Calangute, Goa 403516, India',
        location_name: 'Calangute, Goa',
        latitude: 15.543200,
        longitude: 73.755400,
        phone: '+91 976 432 1098',
        website: 'https://blushandbloomdecor.in',
        rating: 4.7,
        review_count: 185,
        is_verified: true,
        source: 'platform',
        price_min: 80000,
        price_max: 300000,
        price_unit: 'per_event',
        description: 'Bespoke floral architecture, bohemian beachfront mandaps, and fairy-lit canopy styling designed for romantic coastal celebrations.',
        images: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'v_moments_studio',
        user_id: null,
        name: 'Moments Cinematography & Photography',
        category: 'photography',
        address: 'Mapusa Market Circle, Mapusa, Goa 403507, India',
        location_name: 'Mapusa, Goa',
        latitude: 15.592100,
        longitude: 73.812300,
        phone: '+91 989 012 3456',
        website: 'https://momentsgoa.photo',
        rating: 4.8,
        review_count: 420,
        is_verified: true,
        source: 'platform',
        price_min: 50000,
        price_max: 150000,
        price_unit: 'per_event',
        description: 'Award-winning cinematic storytelling, candid bridal portraiture, and high-altitude 4K drone videography capturing timeless emotions.',
        images: ['https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    seedVendors.forEach((v) => this.vendors.set(v.id, v));
    // Database starts completely clean. Every authentic user starts with zero records.
  }

  // USER PROFILES
  async syncUser(firebaseUid: string, email: string, displayName: string, photoUrl: string): Promise<DbUser> {
    const existing = this.users.get(firebaseUid);
    if (existing) {
      existing.display_name = displayName || existing.display_name;
      existing.photo_url = photoUrl || existing.photo_url;
      existing.last_login_at = new Date().toISOString();
      this.users.set(firebaseUid, existing);
      return existing;
    }

    const newUser: DbUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      firebase_uid: firebaseUid,
      email: email || `${firebaseUid}@example.com`,
      display_name: displayName || 'Planora Member',
      photo_url: photoUrl || DEFAULT_NEUTRAL_AVATAR,
      subscription_tier: 'free',
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.set(firebaseUid, newUser);
    return newUser;
  }

  async getUserProfile(firebaseUid: string): Promise<DbUser | null> {
    return this.users.get(firebaseUid) || null;
  }

  async updateUserProfile(firebaseUid: string, updates: Partial<DbUser>): Promise<DbUser | null> {
    const user = this.users.get(firebaseUid);
    if (!user) return null;
    const updated = { ...user, ...updates, firebase_uid: firebaseUid };
    this.users.set(firebaseUid, updated);
    return updated;
  }

  // EVENTS
  async getEventsByOwner(ownerUid: string): Promise<DbEvent[]> {
    return Array.from(this.events.values()).filter((e) => e.owner_id === ownerUid);
  }

  async getEventById(eventId: string, ownerUid: string): Promise<DbEvent | null> {
    const event = this.events.get(eventId);
    if (!event) return null;
    if (event.owner_id !== ownerUid) return null; // IDOR Protection
    return event;
  }

  async createEvent(eventData: Omit<DbEvent, 'id' | 'created_at'>): Promise<DbEvent> {
    const newEvent: DbEvent = {
      ...eventData,
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    this.events.set(newEvent.id, newEvent);
    return newEvent;
  }

  async updateEvent(eventId: string, ownerUid: string, updates: Partial<DbEvent>): Promise<DbEvent | null> {
    const event = await this.getEventById(eventId, ownerUid);
    if (!event) return null;

    const updated = { ...event, ...updates, id: eventId, owner_id: ownerUid, updated_at: new Date().toISOString() };
    this.events.set(eventId, updated);
    return updated;
  }

  async deleteEvent(eventId: string, ownerUid: string): Promise<boolean> {
    const event = await this.getEventById(eventId, ownerUid);
    if (!event) return false;
    this.events.delete(eventId);
    return true;
  }

  // TASKS
  async getTasksByEvent(eventId: string, ownerUid: string): Promise<DbTask[]> {
    const event = await this.getEventById(eventId, ownerUid);
    if (!event) return [];
    return Array.from(this.tasks.values()).filter((t) => t.event_id === eventId);
  }

  async createTask(taskData: Omit<DbTask, 'id' | 'created_at'>): Promise<DbTask> {
    const newTask: DbTask = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  async updateTask(taskId: string, ownerUid: string, updates: Partial<DbTask>): Promise<DbTask | null> {
    const task = this.tasks.get(taskId);
    if (!task || task.owner_id !== ownerUid) return null;

    const updated = { ...task, ...updates, id: taskId, owner_id: ownerUid };
    this.tasks.set(taskId, updated);
    return updated;
  }

  async deleteTask(taskId: string, ownerUid: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task || task.owner_id !== ownerUid) return false;
    this.tasks.delete(taskId);
    return true;
  }

  // BUDGETS
  async getBudgetsByEvent(eventId: string, ownerUid: string): Promise<DbBudget[]> {
    const event = await this.getEventById(eventId, ownerUid);
    if (!event) return [];
    return Array.from(this.budgets.values()).filter((b) => b.event_id === eventId);
  }

  async createBudget(budgetData: Omit<DbBudget, 'id' | 'updated_at'>): Promise<DbBudget> {
    const newBudget: DbBudget = {
      ...budgetData,
      id: `bgt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      updated_at: new Date().toISOString(),
    };
    this.budgets.set(newBudget.id, newBudget);
    return newBudget;
  }

  async updateBudget(budgetId: string, ownerUid: string, updates: Partial<DbBudget>): Promise<DbBudget | null> {
    const budget = this.budgets.get(budgetId);
    if (!budget || budget.owner_id !== ownerUid) return null;

    const updated = { ...budget, ...updates, id: budgetId, owner_id: ownerUid, updated_at: new Date().toISOString() };
    this.budgets.set(budgetId, updated);
    return updated;
  }

  async deleteBudget(budgetId: string, ownerUid: string): Promise<boolean> {
    const budget = this.budgets.get(budgetId);
    if (!budget || budget.owner_id !== ownerUid) return false;
    this.budgets.delete(budgetId);
    return true;
  }

  // GUESTS
  async getGuestsByEvent(eventId: string, ownerUid: string): Promise<DbGuest[]> {
    const event = await this.getEventById(eventId, ownerUid);
    if (!event) return [];
    return Array.from(this.guests.values()).filter((g) => g.event_id === eventId);
  }

  async createGuest(guestData: Omit<DbGuest, 'id' | 'created_at'>): Promise<DbGuest> {
    const newGuest: DbGuest = {
      ...guestData,
      id: `gst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    this.guests.set(newGuest.id, newGuest);
    return newGuest;
  }

  async updateGuest(guestId: string, ownerUid: string, updates: Partial<DbGuest>): Promise<DbGuest | null> {
    const guest = this.guests.get(guestId);
    if (!guest || guest.owner_id !== ownerUid) return null;

    const updated = { ...guest, ...updates, id: guestId, owner_id: ownerUid };
    this.guests.set(guestId, updated);
    return updated;
  }

  async deleteGuest(guestId: string, ownerUid: string): Promise<boolean> {
    const guest = this.guests.get(guestId);
    if (!guest || guest.owner_id !== ownerUid) return false;
    this.guests.delete(guestId);
    return true;
  }

  // AI USAGE LOGS & QUOTAS
  async logAiUsage(logData: Omit<DbAiUsageLog, 'id' | 'created_at'>): Promise<DbAiUsageLog> {
    const newLog: DbAiUsageLog = {
      ...logData,
      id: `ailog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    this.aiLogs.set(newLog.id, newLog);
    return newLog;
  }

  async getUserDailyAiUsage(userId: string): Promise<{ requestCount: number; totalTokens: number }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const userLogs = Array.from(this.aiLogs.values()).filter(
      (l) => l.user_id === userId && new Date(l.created_at) >= startOfDay
    );

    const requestCount = userLogs.length;
    const totalTokens = userLogs.reduce((sum, l) => sum + (l.prompt_tokens + l.completion_tokens), 0);

    return { requestCount, totalTokens };
  }

  // CALENDAR CONNECTIONS
  async getCalendarConnection(userId: string): Promise<DbCalendarConnection | null> {
    return this.calendarConnections.get(userId) || null;
  }

  async saveCalendarConnection(userId: string, data: Omit<DbCalendarConnection, 'id' | 'user_id' | 'updated_at'>): Promise<DbCalendarConnection> {
    const existing = this.calendarConnections.get(userId);
    const conn: DbCalendarConnection = {
      ...data,
      id: existing ? existing.id : `gcal_${Date.now()}`,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    this.calendarConnections.set(userId, conn);
    return conn;
  }

  async removeCalendarConnection(userId: string): Promise<boolean> {
    return this.calendarConnections.delete(userId);
  }

  // REVIEWS
  async submitPlatformReview(userId: string, rating: number, reviewText: string): Promise<DbPlatformReview> {
    const existing = this.reviews.get(userId);
    const review: DbPlatformReview = {
      id: existing ? existing.id : `rev_${Date.now()}`,
      user_id: userId,
      rating,
      review_text: reviewText,
      moderation_status: 'approved',
      created_at: existing ? existing.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.reviews.set(userId, review);
    return review;
  }

  async getPlatformReviews(): Promise<DbPlatformReview[]> {
    return Array.from(this.reviews.values()).filter((r) => r.moderation_status === 'approved');
  }

  // VENDORS
  async getVendors(filters?: { category?: string; location?: string; search?: string; userId?: string }): Promise<DbVendor[]> {
    let list = Array.from(this.vendors.values());

    if (filters?.userId) {
      // User can see public/platform vendors AND their own saved/created vendors
      list = list.filter((v) => !v.user_id || v.source === 'platform' || v.user_id === filters.userId);
    }

    if (filters?.category && filters.category !== 'all' && filters.category !== 'All Vendors') {
      const cat = filters.category.toLowerCase();
      list = list.filter((v) => v.category.toLowerCase() === cat);
    }

    if (filters?.location) {
      const loc = filters.location.toLowerCase();
      list = list.filter((v) => (v.location_name && v.location_name.toLowerCase().includes(loc)) || (v.address && v.address.toLowerCase().includes(loc)));
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((v) => v.name.toLowerCase().includes(q) || (v.description && v.description.toLowerCase().includes(q)));
    }

    return list;
  }

  async getVendorById(id: string): Promise<DbVendor | null> {
    return this.vendors.get(id) || null;
  }

  async saveVendor(vendorData: Omit<DbVendor, 'id' | 'created_at' | 'updated_at'>): Promise<DbVendor> {
    if (vendorData.user_id && vendorData.place_id) {
      for (const existing of this.vendors.values()) {
        if (existing.user_id === vendorData.user_id && existing.place_id === vendorData.place_id) {
          return existing;
        }
      }
    }

    const newVendor: DbVendor = {
      ...vendorData,
      id: `vnd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.vendors.set(newVendor.id, newVendor);
    return newVendor;
  }

  async updateVendor(id: string, userId: string, updates: Partial<DbVendor>): Promise<DbVendor | null> {
    const vendor = this.vendors.get(id);
    if (!vendor) return null;
    if (vendor.user_id !== userId) return null;

    const updated: DbVendor = {
      ...vendor,
      ...updates,
      id,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    this.vendors.set(id, updated);
    return updated;
  }

  async deleteVendor(id: string, userId: string): Promise<boolean> {
    const vendor = this.vendors.get(id);
    if (!vendor) return false;
    if (vendor.user_id !== userId) return false;

    this.vendors.delete(id);
    return true;
  }
}

export const localDb = new LocalDatabase();
