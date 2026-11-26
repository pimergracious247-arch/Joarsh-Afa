import type React from 'react';
import { Lock, LockOpen, Play, Sparkles } from 'lucide-react';
import { getLocalizedCategory, QUIZ_CATEGORIES } from '../data/categories';
import type { UIStrings } from '../data/translations';
import type { LanguageCode, QuizCategory } from '../types';
import { GoldCoinIcon } from './GoldCoinIcon';
import { StorySceneSvg } from './StorySceneSvg';

interface CategorySelectScreenProps {
  unlockedCategories: string[];
  activeCategoryId: string;
  totalCoins: number;
  lang: LanguageCode;
  t: UIStrings;
  onSelectAndPlay: (category: QuizCategory) => void;
  onUnlockCategory: (category: QuizCategory) => void;
  onWatchFreeCoinsAd: () => void;
}

export const CategorySelectScreen: React.FC<CategorySelectScreenProps> = ({
  unlockedCategories,
  activeCategoryId,
  totalCoins,
  lang,
  t,
  onSelectAndPlay,
  onUnlockCategory,
  onWatchFreeCoinsAd,
}) => {
  const unlockedCount = unlockedCategories.length;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col px-4 py-2.5 sm:py-3 max-w-4xl mx-auto w-full overflow-hidden"
    >
      <header className="shrink-0 flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tracking-tight">
            {t.quizPacksTitle}
          </h1>
          <p className="text-xs font-semibold text-[#47608B]">
            {t.packsUnlockedSummary
              .replace('{unlocked}', String(unlockedCount))
              .replace('{total}', String(QUIZ_CATEGORIES.length))}
          </p>
        </div>

        <button
          type="button"
          onClick={onWatchFreeCoinsAd}
          className="min-h-[40px] px-3.5 py-2 rounded-full bg-gradient-to-r from-[#FF8C1A] to-[#F59E0B] hover:from-[#EB7C0E] hover:to-[#D97706] text-white font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-[0_3px_0_#B45309] active:translate-y-[1px] transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>{t.watchVideoFreeCoins}</span>
          <GoldCoinIcon className="w-4 h-4 shrink-0" />
        </button>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 pb-3 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 content-start">
        {QUIZ_CATEGORIES.map((rawCategory, idx) => {
          const category = getLocalizedCategory(rawCategory, lang);
          const isUnlocked = category.unlockCost === 0 || unlockedCategories.includes(category.id);
          const isActive = activeCategoryId === category.id;
          const canAfford = totalCoins >= category.unlockCost;
          return (
            <article
              key={category.id}
              className={`bg-white/95 rounded-[24px] p-3.5 shadow-[0_8px_20px_-8px_rgba(30,58,138,0.14)] border-2 flex flex-col justify-between gap-2.5 transition-all ${
                isActive && isUnlocked ? 'border-[#2F8FFF] ring-2 ring-[#BFDBFE]' : 'border-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#DCEBFF] bg-[#CBE7FF] shrink-0">
                  <StorySceneSvg theme={category.storyTheme} label={category.title} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5 text-[11px] font-bold text-[#5C7299]">
                    <span>
                      {String(idx + 1).padStart(2, '0')} · {category.badgeLabel}
                    </span>
                    {category.hardMode && (
                      <span className="text-[#B91C1C] font-extrabold inline-flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" />
                        {t.hardModeBadge}
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-extrabold text-[#14274E] leading-tight mt-0.5">
                    {category.title}
                  </h2>
                  <p className="text-xs text-[#47608B] leading-snug mt-0.5">{category.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#EFF5FF]">
                {isUnlocked ? (
                  <>
                    <span className="text-xs font-bold text-[#1E7E1C] inline-flex items-center gap-1">
                      <LockOpen className="w-3.5 h-3.5" />
                      <span>
                        {category.unlockCost === 0 ? t.freeStarterBadge : t.unlockedBadge}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectAndPlay(category)}
                      className="min-h-[40px] px-4 py-1.5 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-[0_3px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t.playPackBtn}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-extrabold text-[#7A5400] inline-flex items-center gap-1 tabular-nums">
                      <Lock className="w-3.5 h-3.5 text-[#B45309]" />
                      <GoldCoinIcon className="w-4 h-4" />
                      <span>
                        {category.unlockCost} {t.coinsLabel}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onUnlockCategory(category)}
                      className={`min-h-[40px] px-4 py-1.5 rounded-full font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        canAfford
                          ? 'bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#7A5400] shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#475569]'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        {t.unlockBtn} · {category.unlockCost}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
