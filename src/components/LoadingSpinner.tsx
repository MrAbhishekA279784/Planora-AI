import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  inline?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  inline = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-9 h-9 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow Pulse */}
        <div className="absolute w-12 h-12 bg-[#B86B2A]/15 rounded-full blur-xl animate-pulse" />

        {/* Animated Spinning Icon */}
        <Loader2 className={`${iconSizes[size]} text-[#7A3D19] animate-spin shrink-0 relative z-10`} />

        {/* Center Sparkle Accent for lg/xl sizes */}
        {(size === 'lg' || size === 'xl') && (
          <div className="absolute inset-0 flex items-center justify-center text-[#B86B2A]/40 animate-ping pointer-events-none">
            <Sparkles className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Loading Text Label */}
      {text && (
        <p className="text-xs sm:text-sm font-medium text-[#6D6A66] tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <Loader2 className={`${iconSizes[size]} text-[#7A3D19] animate-spin shrink-0`} />
        {text && <span className="text-xs text-[#6D6A66] font-medium">{text}</span>}
      </span>
    );
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#FBF7EF]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-8 shadow-xl max-w-xs w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F5EDE1] border border-[#E2CFB8] flex items-center justify-center text-[#7A3D19] mx-auto shadow-xs relative">
            <Loader2 className="w-7 h-7 text-[#7A3D19] animate-spin" />
            <Sparkles className="w-3.5 h-3.5 text-[#B86B2A] absolute top-1 right-1" />
          </div>
          <div className="space-y-1">
            <div className="font-serif font-bold text-base text-[#171412]">
              {text || 'Loading Planora AI...'}
            </div>
            <p className="text-xs text-[#928B83]">
              Preparing your personalized event workspace
            </p>
          </div>
        </div>
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
