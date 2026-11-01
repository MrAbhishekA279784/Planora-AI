import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-18 md:bottom-5 left-4 z-50 flex items-center gap-2.5 rounded-full bg-[#4A2C1B]/95 backdrop-blur-md px-4 py-2 text-xs font-semibold text-[#FBF7EF] shadow-xl border border-[#D7A34B]/40 animate-fade-in"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5 text-amber-300 shrink-0" />
      <span>Offline Mode — Cached events and tools are active</span>
      <Database className="w-3 h-3 text-[#D7A34B] ml-1 shrink-0" />
    </div>
  );
};
