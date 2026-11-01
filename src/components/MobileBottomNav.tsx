import React from 'react';
import { Home, Calendar, Sparkles, Store, Bot, Compass, LogIn } from 'lucide-react';
import { AppRoute } from '../types';

interface MobileBottomNavProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  onOpenCopilotDrawer?: () => void;
  isAuthenticated?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onRouteChange,
  onOpenCopilotDrawer,
  isAuthenticated = true,
}) => {
  // Hide on authentication screens for uncluttered layout
  if (currentRoute === 'login' || currentRoute === 'signup') {
    return null;
  }

  // Public Landing Mode
  if (!isAuthenticated && currentRoute === 'landing') {
    return (
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFCF6]/90 backdrop-blur-md border-t border-[#EDE2D3] px-4 py-2 pb-safe"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around">
          <button
            onClick={() => onRouteChange('landing')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
              currentRoute === 'landing' ? 'text-[#7A3D19] font-bold' : 'text-[#928B83]'
            }`}
          >
            <Compass className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] mt-0.5">Experience</span>
          </button>

          <button
            onClick={() => onRouteChange('event-studio')}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[#928B83] hover:text-[#171412]"
          >
            <Sparkles className="w-5 h-5 stroke-[1.8] text-[#B86B2A]" />
            <span className="text-[10px] mt-0.5">Themes</span>
          </button>

          <button
            onClick={() => onRouteChange('vendors')}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[#928B83] hover:text-[#171412]"
          >
            <Store className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5">Vendors</span>
          </button>

          <button
            onClick={() => onRouteChange('login')}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[#7A3D19] font-bold"
          >
            <LogIn className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] mt-0.5">Sign In</span>
          </button>
        </div>
      </nav>
    );
  }

  // Standard Authenticated Navigation
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFCF6]/90 backdrop-blur-md border-t border-[#EDE2D3] px-2 py-1.5 pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onRouteChange('home')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
            currentRoute === 'home'
              ? 'text-[#7A3D19] font-bold'
              : 'text-[#928B83] hover:text-[#171412]'
          }`}
        >
          <Home className={`w-5 h-5 ${currentRoute === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </button>

        {/* My Events */}
        <button
          onClick={() => onRouteChange('my-events')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
            currentRoute === 'my-events' || currentRoute === 'budget-planner' || currentRoute === 'event-timeline' || currentRoute === 'create-event'
              ? 'text-[#7A3D19] font-bold'
              : 'text-[#928B83] hover:text-[#171412]'
          }`}
        >
          <Calendar className={`w-5 h-5 ${currentRoute === 'my-events' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">My Events</span>
        </button>

        {/* Event Studio */}
        <button
          onClick={() => onRouteChange('event-studio')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
            currentRoute === 'event-studio'
              ? 'text-[#7A3D19] font-bold'
              : 'text-[#928B83] hover:text-[#171412]'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${currentRoute === 'event-studio' ? 'stroke-[2.5] text-[#B86B2A]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Event Studio</span>
        </button>

        {/* Vendors */}
        <button
          onClick={() => onRouteChange('vendors')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
            currentRoute === 'vendors' || currentRoute === 'vendor-details'
              ? 'text-[#7A3D19] font-bold'
              : 'text-[#928B83] hover:text-[#171412]'
          }`}
        >
          <Store className={`w-5 h-5 ${currentRoute === 'vendors' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Vendors</span>
        </button>

        {/* AI Copilot */}
        <button
          onClick={() => onRouteChange('ai-copilot')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
            currentRoute === 'ai-copilot'
              ? 'text-[#7A3D19] font-bold'
              : 'text-[#928B83] hover:text-[#171412]'
          }`}
        >
          <Bot className={`w-5 h-5 ${currentRoute === 'ai-copilot' ? 'stroke-[2.5] text-[#B86B2A]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">AI Copilot</span>
        </button>
      </div>
    </nav>
  );
};
