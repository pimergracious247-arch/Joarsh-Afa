import type React from 'react';
import { useState } from 'react';
import { Check, Flame, Globe, Trophy, X } from 'lucide-react';
import { LANGUAGES, type UIStrings } from '../data/translations';
import type { LanguageCode, PlayerProfile, UserStats } from '../types';
import { warmUpSpeechGesture } from '../utils/speechAndAudio';
import { BibleAvatarIcon } from './BibleAvatarIcon';
import { GoldCoinIcon } from './GoldCoinIcon';

interface TopBarProps {
  profile: PlayerProfile;
  stats: UserStats;
  lang: LanguageCode;
  t: UIStrings;
  onSelectLanguage: (lang: LanguageCode) => void;
  onOpenProfileModal: () => void;
  onOpenLeaderboard: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  profile,
  stats,
  lang,
  t,
  onSelectLanguage,
  onOpenProfileModal,
  onOpenLeaderboard,
}) => {
  const [langModalOpen, setLangModalOpen] = useState(false);

  return (
    <>
      <header
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="relative z-20 shrink-0 w-full bg-white/85 backdrop-blur-md border-b border-[#DCEBFF] px-3 sm:px-5 py-1.5"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="min-h-[36px] flex items-center gap-2 rounded-full pe-2.5 hover:bg-[#EDF5FF] transition-colors cursor-pointer min-w-0"
            aria-label={t.editProfileAria}
          >
            <BibleAvatarIcon avatarId={profile.avatarId} size="sm" t={t} />
            <span className="font-display text-xs sm:text-sm font-extrabold text-[#14274E] truncate max-w-[95px] sm:max-w-[155px]">
              {profile.displayName || t.pilgrimDefault}
            </span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setLangModalOpen(true)}
              aria-label={t.switchLanguageAria}
              title={t.switchLanguageTitle}
              className="min-h-[34px] inline-flex items-center gap-1 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] border border-[#BFD9FA] px-2.5 py-1 text-xs font-extrabold text-[#164A9E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-[#2F8FFF]" />
              <span className="uppercase">{lang}</span>
            </button>

            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="min-h-[34px] inline-flex items-center gap-1 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] px-2.5 py-1 text-xs font-extrabold text-[#164A9E] tabular-nums transition-colors cursor-pointer whitespace-nowrap"
              aria-label={t.openLeaderboardAria}
            >
              <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>
                {stats.totalScore.toLocaleString()} {t.ptsUnit}
              </span>
            </button>

            <span
              className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-[#C2410C] tabular-nums whitespace-nowrap"
              title={t.bestStreakTitle}
            >
              <Flame className="w-3.5 h-3.5 fill-[#FB923C] text-[#EA580C]" />
              <span>{stats.bestStreak}</span>
            </span>

            <div
              className="min-h-[34px] inline-flex items-center gap-1.5 rounded-full bg-[#FFF4C4] border border-[#F5B935] px-2.5 py-1 shadow-2xs"
              aria-label={t.coinBalanceAria.replace('{coins}', String(stats.totalCoins))}
            >
              <GoldCoinIcon className="w-4 h-4 shrink-0" />
              <span className="font-display text-xs sm:text-sm font-extrabold text-[#7A5400] tabular-nums">
                {stats.totalCoins.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {langModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="switch-lang-modal-title"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-50 bg-[#14274E]/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-[28px] max-w-md w-full max-h-[82dvh] flex flex-col p-5 shadow-[0_24px_60px_rgba(15,30,61,0.35)] border-2 border-white space-y-3">
            <div className="flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-[#EDF5FF] text-[#2F8FFF] flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </span>
                <h2
                  id="switch-lang-modal-title"
                  className="font-display text-lg font-extrabold text-[#14274E]"
                >
                  {t.switchLanguageTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setLangModalOpen(false)}
                aria-label={t.closeLabel}
                className="w-9 h-9 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-0.5">
              {LANGUAGES.map((opt) => {
                const isSelected = opt.code === lang;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      warmUpSpeechGesture();
                      setLangModalOpen(false);
                      onSelectLanguage(opt.code);
                    }}
                    className={`w-full min-h-[48px] px-3.5 py-2 rounded-2xl border-2 flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E5F0FF] border-[#2F8FFF] text-[#14274E]'
                        : 'bg-[#F8FBFF] hover:bg-[#EDF5FF] border-[#DCEBFF] text-[#14274E]'
                    }`}
                  >
                    <div className="flex flex-col items-start text-start min-w-0">
                      <span className="font-display text-sm sm:text-base font-extrabold leading-tight truncate max-w-full">
                        {opt.nativeName}
                      </span>
                      {opt.nativeName !== opt.name && (
                        <span className="text-xs font-semibold text-[#5C7299] truncate max-w-full">
                          {opt.name}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-[#2F8FFF] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
