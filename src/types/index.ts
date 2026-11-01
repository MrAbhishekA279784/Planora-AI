export type EventType = 'wedding' | 'birthday' | 'community' | 'other';
export type EventStatus = 'upcoming' | 'planning' | 'completed';
export type TaskStatus = 'completed' | 'in-progress' | 'pending' | 'upcoming';

export interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TaskItem {
  id: string;
  eventId: string;
  title: string;
  vendorName?: string;
  status: TaskStatus;
  dueDate: string;
}

export interface EventItem {
  id: string;
  name: string;
  subtitle: string;
  eventType: EventType;
  date: string;
  rawDate: string;
  location: string;
  guestCount: number;
  status: EventStatus;
  completionPercent: number;
  totalBudget: number;
  image: string;
  budgetCategories: BudgetCategory[];
  tasks: TaskItem[];
}

export interface VendorItem {
  id: string;
  name: string;
  category: 'Venue' | 'Catering' | 'Decoration' | 'Photography' | 'Entertainment' | 'Makeup & Styling' | 'Invitations' | 'Others' | string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  priceDisplay: string;
  priceMin: number;
  priceMax: number;
  image: string;
  badge?: 'Popular' | 'Top Rated' | 'Trending' | 'Saved in Account' | string;
  verified: boolean;
  description: string;
  features: string[];
  gallery: string[];
  capacity?: string;
  inComparison?: boolean;
  isFavorite?: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
  website?: string;
  placeId?: string;
  source?: 'platform' | 'google_places' | 'user_saved' | 'planora_db';
}

export interface ThemeItem {
  id: string;
  name: string;
  category: string;
  eventType: EventType;
  description: string;
  image: string;
  bestFor: string;
  estimatedBudget: string;
  guestCapacity: string;
  palette: string[];
  elements: Array<{ name: string; image: string }>;
  isFavorite?: boolean;
  isSaved?: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  iconType: 'booking' | 'proposal' | 'task' | 'budget' | 'theme' | 'guest';
}

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  plan?: string;
  avatar: string;
  isAuthenticated: boolean;
  phone?: string;
  city?: string;
  preferredLanguage?: 'English' | 'Hindi' | 'Hinglish' | string;
  bio?: string;
  onboardingCompleted?: boolean;
}

export type AppRoute =
  | 'landing'
  | 'login'
  | 'signup'
  | 'onboarding'
  | 'home'
  | 'my-events'
  | 'event-studio'
  | 'vendors'
  | 'vendor-details'
  | 'ai-copilot'
  | 'budget-planner'
  | 'event-timeline'
  | 'create-event'
  | 'profile';
