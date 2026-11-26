import type React from 'react';
import { useEffect } from 'react';
import { BookOpen, House, Layers, Trophy, User } from 'lucide-react';
import { ADMOB_CONFIG } from '../config/admob';
import type { UIStrings } from '../data/translations';
import type { LanguageCode, MainTab } from '../types';
import {
  BANNER_REFRESH_INTERVAL_MS,
  hideNativeBanner,
  initNativeAdMob,
  isNativeCapacitorApp,
  refreshNativeBanner,
  showNativeBanner,
} from '../utils/admobBridge';

interface BottomChromeProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  lang: LanguageCode;
  t: UIStrings;
  showTabs: boolean;
  showBanner: boolean;
  onAdClick: () => void;
}

export const BottomChrome: React.FC<BottomChromeProps> = ({
  activeTab,
  onSelectTab,
  lang,
  t,
  showTabs,
  showBanner,
  onAdClick,
}) => {
  const isNativeApp = isNativeCapacitorApp();

  useEffect(() => {
    initNativeAdMob();
  }, []);

  useEffect(() => {
    if (showBanner) showNativeBanner();
    else hideNativeBanner();
  }, [showBanner]);

  // Safe Google AdMob banner auto-refresh timer (60,000ms policy-compliant minimum)
  useEffect(() => {
    if (!showBanner || !isNativeApp) return;
    const refreshTimer = window.setInterval(() => {
      void refreshNativeBanner();
    }, BANNER_REFRESH_INTERVAL_MS);
    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [showBanner, isNativeApp]);

  const tabs: Array<{ id: MainTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: t.tabHome, icon: <House className="w-5 h-5" /> },
    { id: 'categories', label: t.tabPacks, icon: <Layers className="w-5 h-5" /> },
    { id: 'treasury', label: t.tabTreasury, icon: <BookOpen className="w-5 h-5" /> },
    { id: 'leaderboard', label: t.tabRanks, icon: <Trophy className="w-5 h-5" /> },
    { id: 'profile', label: t.tabProfile, icon: <User className="w-5 h-5" /> },
  ];

  const isQuizOrCategories = activeTab === 'categories' || activeTab === 'quiz';

  return (
    <footer dir={lang === 'ar' ? 'rtl' : 'ltr'} className="relative z-30 shrink-0 w-full">
      {showTabs && (
        <nav
          aria-label={t.navAria}
          className="bg-white/95 backdrop-blur-md border-t border-[#DCEBFF] shadow-[0_-4px_20px_rgba(20,39,78,0.06)]"
        >
          <div className="max-w-4xl mx-auto grid grid-cols-5 gap-1 px-2 py-1.5">
            {tabs.map((tab) => {
              const isActive =
                tab.id === 'categories' ? isQuizOrCategories : activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`min-h-[44px] flex flex-col items-center justify-center rounded-2xl px-1.5 py-1 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2F8FFF] ${
                    isActive
                      ? 'bg-[#2F8FFF] text-white shadow-sm'
                      : 'text-[#5C7299] hover:bg-[#EDF5FF] hover:text-[#14274E]'
                  }`}
                >
                  {tab.icon}
                  <span className="text-[10px] sm:text-[11px] font-semibold mt-0.5 leading-tight whitespace-nowrap truncate max-w-full">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {showBanner &&
        (isNativeApp ? (
          <div
            className="min-h-[60px] w-full bg-[#EFF7FF]/90 border-t border-[#DCEBFF]"
            data-ad-provider="google-admob"
            data-ad-app-id={ADMOB_CONFIG.appId}
            data-ad-unit-id={ADMOB_CONFIG.bannerAdUnitId}
            aria-label={`Native Banner Ad ${ADMOB_CONFIG.bannerAdUnitId}`}
          />
        ) : (
          <div
            className="bg-[#FFF2BA] border-t border-[#F3DC86] px-3 py-1"
            data-ad-provider="google-admob"
            data-ad-app-id={ADMOB_CONFIG.appId}
            data-ad-unit-id={ADMOB_CONFIG.bannerAdUnitId}
            data-ad-client={ADMOB_CONFIG.appPubClient}
            data-ad-slot={ADMOB_CONFIG.bannerAdSlot}
            aria-label={`Banner Ad ${ADMOB_CONFIG.bannerAdUnitId}`}
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-[#6E5611] bg-[#FBE284] border border-[#E5C65B] rounded px-1.5 py-0.5 shrink-0">
                  {t.adBannerLabel}
                </span>
                <span className="text-[11px] font-medium text-[#14274E] truncate">
                  {t.adBannerText}
                </span>
              </div>
              <button
                type="button"
                onClick={onAdClick}
                className="shrink-0 text-[10px] font-bold bg-[#2F8FFF] hover:bg-[#1E7CE8] text-white rounded-full px-2.5 py-1 transition-colors cursor-pointer whitespace-nowrap"
              >
                {t.learnMore}
              </button>
            </div>
          </div>
        ))}
    </footer>
  );
};
