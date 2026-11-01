import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Calendar,
  Sparkles,
  Store,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  X,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';
import { AppRoute, EventItem, UserProfile } from '../types';

interface HeaderProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  user: UserProfile;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onRouteChange,
  events,
  onSelectEvent,
  user,
  onSignOut,
}) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
        setShowNotifications(false);
        setShowSearchModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredEvents = searchQuery.trim()
    ? events.filter(
        (e) =>
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events;

  const userNotifications = events.flatMap((ev) => {
    const list = [];
    if (ev.name) {
      list.push({
        id: `notif-ev-${ev.id}`,
        title: `Event: ${ev.name}`,
        description: `${ev.location ? `${ev.location} • ` : ''}${ev.date || 'Planning underway'}`,
        timestamp: 'Active Event',
      });
    }
    return list;
  });

  const isPublicRoute = currentRoute === 'landing' || currentRoute === 'login' || currentRoute === 'signup' || currentRoute === 'onboarding';

  return (
    <>
      <header className="sticky top-0 z-40 glass-header transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Logo & Wordmark */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onRouteChange(user.isAuthenticated ? 'home' : 'landing')}
            role="button"
            tabIndex={0}
            aria-label="Go to Planora AI Home"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onRouteChange(user.isAuthenticated ? 'home' : 'landing');
              }
            }}
          >
            {/* Sparkle Logo Mark */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B86B2A] to-[#7A3D19] flex items-center justify-center text-[#FBF7EF] shadow-sm group-hover:scale-105 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
              </svg>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold tracking-tight text-[#171412] leading-none">
                Planora AI
              </div>
              <div className="text-[11px] font-medium tracking-wide text-[#928B83] mt-1">
                Plan Smarter. Celebrate Better.
              </div>
            </div>
          </div>

          {/* Center Navigation (Desktop) - Authenticated vs Public */}
          {!isPublicRoute && user.isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-1.5 glass-nav-container p-1.5 rounded-full">
              <button
                onClick={() => onRouteChange('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  currentRoute === 'home'
                    ? 'bg-[#FBE8D3] text-[#7A3D19] shadow-xs font-semibold'
                    : 'text-[#6D6A66] hover:text-[#171412] hover:bg-[#F8F0E4]/80'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => onRouteChange('my-events')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  currentRoute === 'my-events' || currentRoute === 'budget-planner' || currentRoute === 'event-timeline' || currentRoute === 'create-event'
                    ? 'bg-[#FBE8D3] text-[#7A3D19] shadow-xs font-semibold'
                    : 'text-[#6D6A66] hover:text-[#171412] hover:bg-[#F8F0E4]/80'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>My Events</span>
              </button>

              <button
                onClick={() => onRouteChange('event-studio')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  currentRoute === 'event-studio'
                    ? 'bg-[#FBE8D3] text-[#7A3D19] shadow-xs font-semibold'
                    : 'text-[#6D6A66] hover:text-[#171412] hover:bg-[#F8F0E4]/80'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#B86B2A]" />
                <span>Event Studio</span>
              </button>

              <button
                onClick={() => onRouteChange('vendors')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  currentRoute === 'vendors' || currentRoute === 'vendor-details'
                    ? 'bg-[#FBE8D3] text-[#7A3D19] shadow-xs font-semibold'
                    : 'text-[#6D6A66] hover:text-[#171412] hover:bg-[#F8F0E4]/80'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Vendors</span>
              </button>
            </nav>
          ) : (
            /* Public Landing Navigation (Desktop) */
            <nav className="hidden md:flex items-center gap-1.5 glass-nav-container p-1.5 rounded-full">
              <button
                onClick={() => onRouteChange('landing')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  currentRoute === 'landing'
                    ? 'bg-[#FBE8D3] text-[#7A3D19] font-semibold'
                    : 'text-[#6D6A66] hover:text-[#171412] hover:bg-[#F8F0E4]/80'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Experience</span>
              </button>
              <button
                onClick={() => onRouteChange('event-studio')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-[#6D6A66] hover:text-[#171412] hover:bg-[#F8F0E4]/80 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#B86B2A]" />
                <span>Themes</span>
              </button>
              <button
                onClick={() => onRouteChange('vendors')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-[#6D6A66] hover:text-[#171412] hover:bg-[#F8F0E4]/80 transition-all cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Vendors</span>
              </button>
            </nav>
          )}

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Search Button (Available in Dashboard and Public) */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#6D6A66] hover:text-[#171412] hover:bg-[#F8F0E4] transition-colors border border-transparent hover:border-[#EDE2D3] cursor-pointer"
              aria-label="Search events and vendors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell (Authenticated Only) */}
            {user.isAuthenticated && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#6D6A66] hover:text-[#171412] hover:bg-[#F8F0E4] transition-colors border border-transparent hover:border-[#EDE2D3] relative cursor-pointer"
                  aria-label="View notifications"
                  aria-expanded={showNotifications}
                >
                  <Bell className="w-4 h-4" />
                  {userNotifications.length > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#B86B2A] ring-2 ring-[#FBF7EF]" />
                  )}
                </button>

                {/* Notifications Popover */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 profile-dropdown p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D3]">
                      <div className="font-serif font-bold text-base text-[#171412]">
                        Notifications
                      </div>
                      <span className="text-xs bg-[#FBE8D3] text-[#7A3D19] px-2 py-0.5 rounded-full font-semibold">
                        {userNotifications.length > 0 ? `${userNotifications.length} Active` : 'All caught up'}
                      </span>
                    </div>
                    <div className="divide-y divide-[#EDE2D3]/60 max-h-80 overflow-y-auto mt-2">
                      {userNotifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#6D6A66]">
                          No notifications yet. You're all caught up!
                        </div>
                      ) : (
                        userNotifications.map((act) => (
                          <div
                            key={act.id}
                            className="py-3 px-1.5 hover:bg-[#F8F0E4]/70 rounded-xl cursor-pointer transition-colors"
                            onClick={() => {
                              setShowNotifications(false);
                              onRouteChange('my-events');
                            }}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-2 h-2 rounded-full bg-[#B86B2A] mt-1.5 shrink-0" />
                              <div className="flex-1 text-xs">
                                <div className="font-semibold text-[#171412]">{act.title}</div>
                                <div className="text-[#6D6A66] mt-0.5 line-clamp-1">{act.description}</div>
                                <div className="text-[10px] text-[#928B83] mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {act.timestamp}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated State: TASK 2 Glassmorphic Profile Capsule */}
            {user.isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="profile-capsule cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/30"
                  aria-label="User account menu"
                  aria-haspopup="menu"
                  aria-expanded={showProfileMenu}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-white/90 shrink-0"
                  />
                  <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
                    <span className="font-semibold text-xs text-[#171412] line-clamp-1">{user.name}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#6D6A66] transition-transform duration-200 ${
                      showProfileMenu ? 'rotate-180 text-[#7A3D19]' : ''
                    }`}
                  />
                </button>

                {/* TASK 3: Glassmorphic Profile Dropdown (PROMOTIONAL UPGRADE CARD COMPLETELY REMOVED) */}
                {showProfileMenu && (
                  <div
                    className="absolute right-0 mt-2.5 w-64 profile-dropdown p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    role="menu"
                  >
                    {/* User Profile Summary Header */}
                    <div className="p-3 border-b border-[#EDE2D3]/80 flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                      />
                      <div className="overflow-hidden">
                        <div className="font-bold text-sm text-[#171412] truncate">{user.name}</div>
                        <div className="text-[11px] text-[#928B83] truncate">{user.email}</div>
                      </div>
                    </div>

                    {/* Navigation Actions */}
                    <div className="py-2 space-y-1">
                      <button
                        onClick={() => {
                          onRouteChange('profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-[#171412] hover:bg-[#F8F0E4]/80 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                        role="menuitem"
                      >
                        <User className="w-4 h-4 text-[#7A3D19]" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          onRouteChange('budget-planner');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-[#171412] hover:bg-[#F8F0E4]/80 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                        role="menuitem"
                      >
                        <Calendar className="w-4 h-4 text-[#7A3D19]" />
                        <span>Budget Planner</span>
                      </button>

                      <button
                        onClick={() => {
                          onRouteChange('event-timeline');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-[#171412] hover:bg-[#F8F0E4]/80 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                        role="menuitem"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#7A3D19]" />
                        <span>Event Timeline</span>
                      </button>

                      <button
                        onClick={() => {
                          onRouteChange('profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-[#171412] hover:bg-[#F8F0E4]/80 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                        role="menuitem"
                      >
                        <Settings className="w-4 h-4 text-[#6D6A66]" />
                        <span>Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          onRouteChange('profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-[#171412] hover:bg-[#F8F0E4]/80 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                        role="menuitem"
                      >
                        <HelpCircle className="w-4 h-4 text-[#6D6A66]" />
                        <span>Help & Support</span>
                      </button>
                    </div>

                    {/* Sign-Out Section (Cleanly separated without any upgrade card) */}
                    <div className="pt-2 border-t border-[#EDE2D3]/80">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onSignOut();
                          onRouteChange('landing');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-[#C5221F] hover:bg-[#FDE8E6] rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Public / Unauthenticated Header Actions */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRouteChange('login')}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#171412] hover:text-[#7A3D19] hover:bg-[#F8F0E4] transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onRouteChange('signup')}
                  className="px-4 py-2 rounded-full bg-[#7A3D19] hover:bg-[#5D2E12] text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFCF6] border border-[#EDE2D3] w-full max-w-xl rounded-2xl shadow-2xl p-4 overflow-hidden">
            <div className="flex items-center gap-3 pb-3 border-b border-[#EDE2D3]">
              <Search className="w-5 h-5 text-[#B86B2A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, vendors, themes, tasks..."
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-[#928B83] text-[#171412]"
                autoFocus
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#928B83] hover:text-[#171412] hover:bg-[#F8F0E4] cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto space-y-2">
              <div className="text-[11px] font-semibold text-[#928B83] uppercase tracking-wider px-2">
                Events ({filteredEvents.length})
              </div>
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    onSelectEvent(ev);
                    onRouteChange('my-events');
                    setShowSearchModal(false);
                  }}
                  className="flex items-center justify-between p-2.5 hover:bg-[#F8F0E4] rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={ev.image}
                      alt={ev.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#171412]">{ev.name}</div>
                      <div className="text-[11px] text-[#6D6A66]">
                        {ev.date} • {ev.location}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-[#7A3D19] bg-[#FBE8D3] px-2 py-0.5 rounded-full">
                    {ev.completionPercent}%
                  </span>
                </div>
              ))}

              <div className="pt-2 border-t border-[#EDE2D3]">
                <div className="text-[11px] font-semibold text-[#928B83] uppercase tracking-wider px-2 mb-2">
                  Quick Navigation
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      onRouteChange('vendors');
                      setShowSearchModal(false);
                    }}
                    className="p-2 text-left bg-[#F8F0E4] hover:bg-[#F5E7D3] rounded-lg font-medium text-[#7A3D19] cursor-pointer"
                  >
                    Explore Vendors →
                  </button>
                  <button
                    onClick={() => {
                      onRouteChange('event-studio');
                      setShowSearchModal(false);
                    }}
                    className="p-2 text-left bg-[#F8F0E4] hover:bg-[#F5E7D3] rounded-lg font-medium text-[#7A3D19] cursor-pointer"
                  >
                    Browse Themes →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
