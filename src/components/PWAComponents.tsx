import type React from 'react';
import { useState } from 'react';
import { ChevronRight, Download, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWA';

export const OfflineIndicator: React.FC = () => {
  if (useOnlineStatus()) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2.5 right-3 z-50 flex items-center gap-1.5 rounded-full bg-[#B45309]/95 border border-[#FCD34D] px-3 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-xs"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline Mode · Verses &amp; Quiz Ready</span>
    </div>
  );
};

interface PWAInstallCardProps {
  onInstalled?: () => void;
}

export const PWAInstallCard: React.FC<PWAInstallCardProps> = ({ onInstalled }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;
  if (!isInstallable && !isIOS) return null;

  const handleClick = async () => {
    if (isInstallable) {
      if (await install()) onInstalled?.();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="w-full bg-white/95 hover:bg-white rounded-2xl p-3.5 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-3 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-full bg-[#FFE675] flex items-center justify-center shrink-0">
            {isIOS ? (
              <Smartphone className="w-5 h-5 text-[#7A5400]" />
            ) : (
              <Download className="w-5 h-5 text-[#7A5400]" />
            )}
          </span>
          <div className="text-start min-w-0">
            <div className="font-display text-base font-extrabold text-[#14274E] truncate">
              Install Bible Quest App
            </div>
            <div className="text-xs font-semibold text-[#5C7299] mt-0.5 truncate">
              {isIOS
                ? 'Add to Home Screen for offline reading'
                : 'Quick access & offline reading anytime'}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#5C7299] shrink-0" />
      </button>

      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          className="fixed inset-0 z-50 bg-[#14274E]/55 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-[28px] max-w-sm w-full p-5 shadow-xl border border-white space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 id="ios-install-title" className="font-display text-lg font-extrabold text-[#14274E]">
                Install on iPhone / iPad
              </h2>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#334155] leading-relaxed">
              1. Tap the <strong>Share</strong> button in Safari&apos;s toolbar.
              <br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full min-h-[44px] rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-sm cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
