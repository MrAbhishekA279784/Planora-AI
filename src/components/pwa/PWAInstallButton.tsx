import React, { useState } from 'react';
import { Download, Sparkles, X, Share } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-all shadow-sm cursor-pointer ${
          compact
            ? 'px-2.5 py-1 text-[11px] bg-[#7A3D19] hover:bg-[#5D2E12] text-[#FBF7EF]'
            : 'px-3.5 py-1.5 text-xs bg-gradient-to-r from-[#7A3D19] to-[#B86B2A] hover:opacity-95 text-white'
        }`}
        title="Install Planora AI to your home screen or desktop for offline access"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-[#F8F0E4] hover:bg-[#FBE8D3] text-[#7A3D19] border border-[#EDE2D3] transition-colors cursor-pointer"
          title="Add Planora AI to your iPhone/iPad Home Screen"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#FFFCF6] border border-[#EDE2D3] p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-[#928B83] hover:text-[#171412] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-xl bg-[#FBE8D3] text-[#B86B2A] flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>

              <h3 className="font-serif text-lg font-bold text-[#171412]">Install on iPhone / iPad</h3>
              <p className="mt-1 text-xs text-[#6D6A66]">
                Install Planora AI to access your dashboard, budgets, and timelines even without an internet connection.
              </p>

              <div className="mt-4 space-y-2.5 text-xs text-[#171412] bg-[#FBF7EF] p-3.5 rounded-xl border border-[#EDE2D3]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#E2CFB8] text-[#7A3D19] flex items-center justify-center shrink-0 font-bold">1</div>
                  <span>Tap the <Share className="w-3.5 h-3.5 inline text-[#B86B2A] mx-0.5" /> <strong>Share</strong> icon in the Safari navigation bar.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#E2CFB8] text-[#7A3D19] flex items-center justify-center shrink-0 font-bold">2</div>
                  <span>Scroll down and select <strong>"Add to Home Screen"</strong>.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#E2CFB8] text-[#7A3D19] flex items-center justify-center shrink-0 font-bold">3</div>
                  <span>Tap <strong>Add</strong> in the top-right corner to finish.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#7A3D19] py-2.5 text-xs font-semibold text-white hover:bg-[#5D2E12] transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
