import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FloatingAiLauncher } from './components/FloatingAiLauncher';
import { LoginView } from './components/views/LoginView';
import { SignupView } from './components/views/SignupView';
import { HomeView } from './components/views/HomeView';
import { MyEventsView } from './components/views/MyEventsView';
import { OnboardingView } from './components/views/OnboardingView';
import { ProfileMenuView } from './components/views/ProfileMenuView';
import { VendorCompareModal } from './components/modals/VendorCompareModal';
import { InquiryModal } from './components/modals/InquiryModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

// React.lazy Code-Splitting for Heavy Route Components
const LandingPageView = lazy(() => import('./components/views/LandingPageView').then((m) => ({ default: m.LandingPageView })));
const EventStudioView = lazy(() => import('./components/views/EventStudioView').then((m) => ({ default: m.EventStudioView })));
const VendorsView = lazy(() => import('./components/views/VendorsView').then((m) => ({ default: m.VendorsView })));
const VendorDetailsView = lazy(() => import('./components/views/VendorDetailsView').then((m) => ({ default: m.VendorDetailsView })));
const AiCopilotView = lazy(() => import('./components/views/AiCopilotView').then((m) => ({ default: m.AiCopilotView })));
const BudgetPlannerView = lazy(() => import('./components/views/BudgetPlannerView').then((m) => ({ default: m.BudgetPlannerView })));
const EventTimelineView = lazy(() => import('./components/views/EventTimelineView').then((m) => ({ default: m.EventTimelineView })));
const CreateEventView = lazy(() => import('./components/views/CreateEventView').then((m) => ({ default: m.CreateEventView })));

import { AppRoute, EventItem, ThemeItem, VendorItem } from './types';
import { initialEvents, initialThemes, initialVendors } from './data/mockData';
import { useAuth } from './context/AuthContext';

export function App() {
  const { user, logout, getIdToken } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Navigation Route
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const requestedRoute = urlParams.get('route') as AppRoute;
      if (requestedRoute) return requestedRoute;
    } catch {
      // fallback
    }
    return 'home';
  });

  // Protect private application routes with visual feedback
  const handleNavigate = (route: AppRoute) => {
    setIsNavigating(true);

    const protectedRoutes: AppRoute[] = [
      'home',
      'my-events',
      'event-studio',
      'budget-planner',
      'event-timeline',
      'create-event',
      'profile',
      'onboarding',
    ];

    setTimeout(() => {
      if (!user.isAuthenticated && protectedRoutes.includes(route)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentRoute('login');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentRoute(route);
      }
      setIsNavigating(false);
    }, 180);
  };

  // User-scoped events state
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const userKey = user.isAuthenticated && user.uid ? `planora_events_${user.uid}` : null;
      if (!userKey) return [];
      const saved = localStorage.getItem(userKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeEvent, setActiveEvent] = useState<EventItem | null>(events[0] || null);

  const [themes, setThemes] = useState<ThemeItem[]>(() => {
    try {
      const saved = localStorage.getItem('planora_themes');
      return saved ? JSON.parse(saved) : initialThemes;
    } catch {
      return initialThemes;
    }
  });

  const [selectedTheme, setSelectedTheme] = useState<ThemeItem>(themes[0] || initialThemes[0]);

  const [vendors, setVendors] = useState<VendorItem[]>(() => {
    try {
      const saved = localStorage.getItem('planora_vendors');
      return saved ? JSON.parse(saved) : initialVendors;
    } catch {
      return initialVendors;
    }
  });

  const [selectedVendor, setSelectedVendor] = useState<VendorItem>(vendors[0] || initialVendors[0]);

  // Modals & Floating AI drawer states
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [inquiryVendor, setInquiryVendor] = useState<VendorItem | null>(null);

  // Synchronize authenticated user's events from backend API & keep clean state
  useEffect(() => {
    let isMounted = true;
    const syncUserEvents = async () => {
      if (!user.isAuthenticated || !user.uid) {
        setEvents([]);
        setActiveEvent(null);
        return;
      }

      const userKey = `planora_events_${user.uid}`;
      try {
        const cached = localStorage.getItem(userKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (isMounted) {
            setEvents(parsed);
            setActiveEvent(parsed[0] || null);
          }
        }
      } catch {}

      try {
        setIsSyncing(true);
        const token = await getIdToken();
        if (!token) return;
        const res = await fetch('/api/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.events)) {
            const mappedEvents: EventItem[] = data.events.map((dbEv: any) => ({
              id: dbEv.id,
              name: dbEv.name,
              subtitle: dbEv.description || 'Private Event',
              eventType: dbEv.event_type || 'wedding',
              date: dbEv.start_date || '',
              rawDate: dbEv.start_date || '',
              location: dbEv.location_name || '',
              guestCount: dbEv.expected_guests || 0,
              status: (dbEv.status || 'planning') as any,
              completionPercent: dbEv.completion_percentage || 0,
              totalBudget: dbEv.total_budget || 0,
              image: dbEv.image || (dbEv.event_type === 'birthday' ? 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80' : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80'),
              budgetCategories: dbEv.budgetCategories || [],
              tasks: dbEv.tasks || [],
            }));

            setEvents(mappedEvents);
            setActiveEvent(mappedEvents[0] || null);
            localStorage.setItem(userKey, JSON.stringify(mappedEvents));
          }
        }
      } catch (err) {
        console.warn('Events sync notice:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    syncUserEvents();
    return () => {
      isMounted = false;
    };
  }, [user.isAuthenticated, user.uid]);

  // Persist user-specific events to user-scoped localStorage
  useEffect(() => {
    if (user.isAuthenticated && user.uid) {
      try {
        localStorage.setItem(`planora_events_${user.uid}`, JSON.stringify(events));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    }
  }, [events, user.isAuthenticated, user.uid]);

  useEffect(() => {
    try {
      localStorage.setItem('planora_themes', JSON.stringify(themes));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [themes]);

  useEffect(() => {
    try {
      localStorage.setItem('planora_vendors', JSON.stringify(vendors));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [vendors]);

  // Auth Handlers
  const handleLoginSuccess = () => {
    handleNavigate('home');
  };

  const handleSignupSuccess = () => {
    handleNavigate('home');
  };

  const handleSignOut = async () => {
    await logout();
    setEvents([]);
    setActiveEvent(null);
    try {
      localStorage.removeItem('planora_events');
      localStorage.removeItem('planora_events_guest');
    } catch {}
    handleNavigate('landing');
  };

  // Event handlers with server sync
  const handleUpdateEvent = async (updated: EventItem) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (activeEvent?.id === updated.id) {
      setActiveEvent(updated);
    }

    if (user.isAuthenticated) {
      try {
        setIsSyncing(true);
        const token = await getIdToken();
        if (token) {
          await fetch(`/api/events/${updated.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: updated.name,
              eventType: updated.eventType,
              description: updated.subtitle,
              startDate: updated.date,
              locationName: updated.location,
              totalBudget: updated.totalBudget,
              completionPercentage: updated.completionPercent,
            }),
          });
        }
      } catch (err) {
        console.warn('Failed to sync event update:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (activeEvent?.id === id) {
      setActiveEvent(null);
    }

    if (user.isAuthenticated) {
      try {
        setIsSyncing(true);
        const token = await getIdToken();
        if (token) {
          await fetch(`/api/events/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (err) {
        console.warn('Failed to sync event deletion:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleCreateEvent = async (newEvent: EventItem) => {
    setEvents((prev) => [newEvent, ...prev]);
    setActiveEvent(newEvent);

    if (user.isAuthenticated) {
      try {
        setIsSyncing(true);
        const token = await getIdToken();
        if (token) {
          await fetch('/api/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: newEvent.name,
              eventType: newEvent.eventType,
              description: newEvent.subtitle,
              startDate: newEvent.date,
              locationName: newEvent.location,
              totalBudget: newEvent.totalBudget,
            }),
          });
        }
      } catch (err) {
        console.warn('Failed to sync new event creation:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Vendor handlers
  const handleToggleFavoriteVendor = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, isFavorite: !v.isFavorite } : v))
    );
  };

  const handleToggleCompareVendor = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, inComparison: !v.inComparison } : v))
    );
  };

  // Theme handlers
  const handleToggleSaveTheme = (themeId: string) => {
    setThemes((prev) =>
      prev.map((t) => (t.id === themeId ? { ...t, isSaved: !t.isSaved } : t))
    );
  };

  const handleToggleFavoriteTheme = (themeId: string) => {
    setThemes((prev) =>
      prev.map((t) => (t.id === themeId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  const handleQuickAiPrompt = () => {
    setIsCopilotOpen(true);
  };

  // Hide the floating button on Vendor Details, AI Copilot view, or Auth pages
  const hideFloatingButton =
    currentRoute === 'vendor-details' ||
    currentRoute === 'ai-copilot' ||
    currentRoute === 'login' ||
    currentRoute === 'signup';

  const [isMapsQuotaExceeded, setIsMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setIsMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF7EF] text-[#171412] flex flex-col font-sans selection:bg-[#FBE8D3] selection:text-[#7A3D19]">
      {/* Google Maps Quota Exhaustion Banner */}
      {isMapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
          <button
            onClick={() => setIsMapsQuotaExceeded(false)}
            className="ml-3 text-amber-700 hover:text-amber-900 font-bold px-1.5 py-0.5 rounded hover:bg-amber-200/50"
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Application Glass Header */}
      <Header
        currentRoute={currentRoute}
        onRouteChange={handleNavigate}
        events={events}
        onSelectEvent={(ev) => {
          setActiveEvent(ev);
          handleNavigate('event-timeline');
        }}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-12">
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading Planora experience..." className="py-20" />}>
          {/* Landing Page */}
          {currentRoute === 'landing' && (
            <LandingPageView
              onNavigate={handleNavigate}
              isAuthenticated={user.isAuthenticated}
            />
          )}

          {/* Login View */}
          {currentRoute === 'login' && (
            <LoginView
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
            />
          )}

          {/* Signup View */}
          {currentRoute === 'signup' && (
            <SignupView
              onSignupSuccess={handleSignupSuccess}
              onNavigate={handleNavigate}
            />
          )}

          {/* Home Dashboard */}
          {currentRoute === 'home' && (
            <HomeView
              events={events}
              themes={themes}
              onRouteChange={handleNavigate}
              onSelectEvent={(ev) => {
                setActiveEvent(ev);
                handleNavigate('event-timeline');
              }}
              onSelectTheme={(th) => {
                setSelectedTheme(th);
                handleNavigate('event-studio');
              }}
              onQuickAiPrompt={handleQuickAiPrompt}
            />
          )}

          {/* My Events */}
          {currentRoute === 'my-events' && (
            <MyEventsView
              events={events}
              onRouteChange={handleNavigate}
              onSelectEvent={(ev) => {
                setActiveEvent(ev);
                handleNavigate('event-timeline');
              }}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}

          {/* Event Studio */}
          {currentRoute === 'event-studio' && (
            <EventStudioView
              themes={themes}
              selectedTheme={selectedTheme}
              onSelectTheme={setSelectedTheme}
              onToggleSaveTheme={handleToggleSaveTheme}
              onToggleFavoriteTheme={handleToggleFavoriteTheme}
              onRouteChange={handleNavigate}
              activeEvent={activeEvent}
            />
          )}

          {/* Vendors Marketplace */}
          {currentRoute === 'vendors' && (
            <VendorsView
              vendors={vendors}
              onSelectVendor={(v) => {
                setSelectedVendor(v);
                handleNavigate('vendor-details');
              }}
              onToggleFavorite={handleToggleFavoriteVendor}
              onToggleCompare={handleToggleCompareVendor}
              onOpenCompareModal={() => setIsCompareModalOpen(true)}
              onOpenInquiryModal={(v) => setInquiryVendor(v)}
              onRouteChange={handleNavigate}
              activeEvent={activeEvent}
            />
          )}

          {/* Vendor Details */}
          {currentRoute === 'vendor-details' && (
            <VendorDetailsView
              vendor={selectedVendor}
              onBack={() => handleNavigate('vendors')}
              onOpenInquiryModal={(v) => setInquiryVendor(v)}
              onToggleFavorite={handleToggleFavoriteVendor}
              onRouteChange={handleNavigate}
            />
          )}

          {/* AI Copilot Dedicated View */}
          {currentRoute === 'ai-copilot' && (
            <AiCopilotView
              activeEvent={activeEvent}
              onRouteChange={handleNavigate}
              onUpdateEvent={handleUpdateEvent}
            />
          )}

          {/* Budget Planner */}
          {currentRoute === 'budget-planner' && (
            <BudgetPlannerView
              event={activeEvent}
              onUpdateEvent={handleUpdateEvent}
              onBack={() => handleNavigate('my-events')}
              onRouteChange={handleNavigate}
            />
          )}

          {/* Event Timeline */}
          {currentRoute === 'event-timeline' && (
            <EventTimelineView
              event={activeEvent}
              onUpdateEvent={handleUpdateEvent}
              onBack={() => handleNavigate('my-events')}
              onRouteChange={handleNavigate}
            />
          )}

          {/* Create Event Wizard */}
          {currentRoute === 'create-event' && (
            <CreateEventView
              onCreateEvent={handleCreateEvent}
              onBack={() => handleNavigate('my-events')}
              onRouteChange={handleNavigate}
            />
          )}

          {/* Onboarding View */}
          {currentRoute === 'onboarding' && (
            <OnboardingView
              onComplete={() => {}}
              onNavigate={handleNavigate}
            />
          )}

          {/* Profile Menu View */}
          {currentRoute === 'profile' && (
            <ProfileMenuView onRouteChange={handleNavigate} events={events} />
          )}
        </Suspense>
      </main>

      {/* Floating AI Launcher */}
      <FloatingAiLauncher
        activeEvent={activeEvent}
        isOpen={isCopilotOpen}
        onToggle={() => setIsCopilotOpen(!isCopilotOpen)}
        hideLauncherButton={hideFloatingButton}
        onNavigateToRoute={handleNavigate}
      />

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav
        currentRoute={currentRoute}
        onRouteChange={handleNavigate}
        onOpenCopilotDrawer={() => setIsCopilotOpen(true)}
        isAuthenticated={user.isAuthenticated}
      />

      {/* Modals */}
      <VendorCompareModal
        vendors={vendors.filter((v) => v.inComparison)}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemove={handleToggleCompareVendor}
        onSelectVendor={(v) => {
          setSelectedVendor(v);
          handleNavigate('vendor-details');
        }}
      />

      <InquiryModal
        vendor={inquiryVendor}
        isOpen={Boolean(inquiryVendor)}
        onClose={() => setInquiryVendor(null)}
      />

      {/* Floating Background Sync Status Indicator */}
      {isSyncing && (
        <div className="fixed bottom-20 right-6 z-40 bg-[#FFFCF6]/95 border border-[#EDE2D3] rounded-full px-4 py-2 shadow-lg flex items-center gap-2.5 text-xs font-semibold text-[#7A3D19] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <LoadingSpinner size="sm" />
          <span>Syncing workspace...</span>
        </div>
      )}

      {/* PWA Offline Mode Indicator */}
      <OfflineIndicator />

      {/* Full-Screen Navigation Loading Feedback Overlay */}
      {isNavigating && (
        <LoadingSpinner fullScreen text="Loading experience..." />
      )}
    </div>
  );
}

export default App;
