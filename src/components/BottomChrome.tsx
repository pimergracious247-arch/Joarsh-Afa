import React from 'react';
import { Home, ListChecks, Bookmark, User } from 'lucide-react';
import { TabId } from '../types';
import { UIStrings } from '../data/translations';

interface BottomChromeProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  t: UIStrings;
  savedCount: number;
  showTabs: boolean;
  onAdClick: () => void;
}

export const BottomChrome: React.FC<BottomChromeProps> = ({
  activeTab,
  onSelectTab,
  t,
  savedCount,
  showTabs,
  onAdClick,
}) => {
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.tabHome, icon: <Home className="w-5 h-5" /> },
    { id: 'quiz', label: t.tabQuiz, icon: <ListChecks className="w-5 h-5" /> },
    {
      id: 'saved',
      label: savedCount > 0 ? `${t.tabSaved} (${savedCount})` : t.tabSaved,
      icon: <Bookmark className="w-5 h-5" />,
    },
    { id: 'profile', label: t.tabProfile, icon: <User className="w-5 h-5" /> },
  ];

  return (
    <footer className="relative z-30 shrink-0 w-full">
      {showTabs && (
        <nav
          aria-label="Primary navigation"
          className="bg-white/95 backdrop-blur-md border-t border-[#DCEBFF] shadow-[0_-4px_20px_rgba(20,39,78,0.06)]"
        >
          <div className="max-w-3xl mx-auto grid grid-cols-4 gap-1.5 px-2.5 py-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`min-h-[44px] flex flex-col items-center justify-center rounded-2xl px-2 py-1 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2F8FFF] ${
                    isActive
                      ? 'bg-[#2F8FFF] text-white shadow-sm'
                      : 'text-[#5C7299] hover:bg-[#EDF5FF] hover:text-[#14274E]'
                  }`}
                >
                  {tab.icon}
                  <span className="text-[11px] font-semibold mt-0.5 leading-tight whitespace-nowrap truncate max-w-full">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Slim placeholder banner ad strip at the very bottom */}
      <div className="bg-[#FFF2BA] border-t border-[#F3DC86] px-3 py-1">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
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
            {t.nextQuestion === 'Next' ? 'Learn More' : t.nextQuestion}
          </button>
        </div>
      </div>
    </footer>
  );
};
