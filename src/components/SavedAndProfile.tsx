import React, { useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  Flame,
  Globe,
  ListChecks,
  SlidersHorizontal,
  Star,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BibleVerse, LanguageCode, QuizSettings, UserStats } from '../types';
import { LANGUAGES, UIStrings } from '../data/translations';
import { FlagIcon } from './FlagIcon';

interface SavedScreenProps {
  savedVerses: BibleVerse[];
  lang: LanguageCode;
  t: UIStrings;
  onListen: (text: string) => void;
  onCopy: (verse: BibleVerse) => void;
  onRemove: (verseId: string) => void;
  onBrowseVerses: () => void;
}

const ITEMS_PER_PAGE = 3;

export const SavedScreen: React.FC<SavedScreenProps> = ({
  savedVerses,
  lang,
  t,
  onListen,
  onCopy,
  onRemove,
  onBrowseVerses,
}) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(savedVerses.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const visible = savedVerses.slice(
    safePage * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const pageLabelText = t.pageLabel
    .replace('{page}', String(safePage + 1))
    .replace('{total}', String(totalPages));

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-4 py-2 sm:py-3 max-w-3xl mx-auto w-full overflow-hidden"
    >
      <header className="shrink-0 flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-2xl bg-[#FFE675] border-2 border-[#F5B935] text-[#14274E] flex items-center justify-center shadow-xs">
            <Bookmark className="w-5 h-5 fill-[#14274E]" />
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14274E] tracking-tight">
            {t.savedVersesTitle}
          </h1>
        </div>
        <span className="text-xs sm:text-sm font-bold text-[#5C7299] tabular-nums">
          {savedVerses.length}
        </span>
      </header>

      <div className="flex-1 min-h-0 flex flex-col justify-center gap-2.5 my-2">
        {savedVerses.length === 0 ? (
          <div className="bg-white/95 rounded-[28px] p-6 shadow-[0_10px_28px_-8px_rgba(30,58,138,0.12)] border border-white flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#EDF5FF] text-[#2F8FFF] flex items-center justify-center mb-3">
              <Bookmark className="w-7 h-7" />
            </div>
            <h2 className="font-display text-xl font-extrabold text-[#14274E]">
              {t.savedEmptyTitle}
            </h2>
            <p className="text-sm text-[#5C7299] mt-1 max-w-xs">
              {t.savedEmptySubtitle}
            </p>
            <button
              type="button"
              onClick={onBrowseVerses}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-sm shadow-sm cursor-pointer"
            >
              {t.browseVersesBtn}
            </button>
          </div>
        ) : (
          visible.map((verse) => {
            const content = verse.translations[lang];
            return (
              <article
                key={verse.id}
                className="bg-white/95 rounded-2xl p-3.5 sm:p-4 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-display text-base sm:text-lg font-extrabold text-[#14274E]">
                      {content.reference}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#334155] line-clamp-2 mt-0.5 leading-snug">
                      {content.text}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[11px] font-semibold text-[#5C7299]">
                    {content.version} · {content.themes[0]}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onListen(`${content.reference}. ${content.text}`)
                      }
                      aria-label={t.listen}
                      className="h-8 px-2.5 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] text-[#7A5400] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t.listen}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onCopy(verse)}
                      aria-label={t.copy}
                      className="h-8 px-2.5 rounded-full bg-[#E5F0FF] hover:bg-[#CFE3FF] text-[#14274E] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t.copy}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(verse.id)}
                      aria-label={t.remove}
                      className="h-8 w-8 rounded-full bg-[#FFE8EC] hover:bg-[#FFD1DA] text-[#C81E3D] flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Zero-scroll Pagination Bar */}
      {savedVerses.length > 0 && (
        <div className="shrink-0 flex items-center justify-between gap-2 bg-white/90 rounded-full px-3 py-1.5 border border-white shadow-xs">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="w-8 h-8 rounded-full bg-[#E5F0FF] disabled:opacity-40 text-[#14274E] flex items-center justify-center cursor-pointer disabled:cursor-default"
            aria-label={t.previous}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-[#14274E] tabular-nums">
            {pageLabelText}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="w-8 h-8 rounded-full bg-[#E5F0FF] disabled:opacity-40 text-[#14274E] flex items-center justify-center cursor-pointer disabled:cursor-default"
            aria-label={t.nextQuestion}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

interface ProfileScreenProps {
  stats: UserStats;
  lang: LanguageCode;
  settings: QuizSettings;
  t: UIStrings;
  onOpenLanguagePicker: () => void;
  onOpenQuizSettings: () => void;
  onToggleSound: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  stats,
  lang,
  settings,
  t,
  onOpenLanguagePicker,
  onOpenQuizSettings,
  onToggleSound,
}) => {
  const [celebrateKey, setCelebrateKey] = useState(0);
  const currentLanguage = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const ageLabel =
    settings.ageGroup === 'kids'
      ? `${t.ageKids} (${t.ageKidsRange})`
      : settings.ageGroup === 'teens'
      ? `${t.ageTeens} (${t.ageTeensRange})`
      : `${t.ageAdults} (${t.ageAdultsRange})`;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-4 py-2 sm:py-3 max-w-3xl mx-auto w-full overflow-hidden"
    >
      <header className="shrink-0 flex items-center gap-2.5 pt-0.5">
        <span className="w-10 h-10 rounded-2xl bg-[#D4E9FF] border-2 border-[#A6D0FB] text-[#164A9E] flex items-center justify-center shadow-xs">
          <Star className="w-5 h-5 fill-[#FFD038] text-[#E5A00D]" />
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14274E] tracking-tight">
          {t.profileTitle}
        </h1>
      </header>

      {/* Stats Grid: Total Stars, Quizzes Completed, Day Streak */}
      <section className="shrink-0 grid grid-cols-3 gap-2 sm:gap-3 my-2">
        <div className="bg-white/95 rounded-3xl p-3 sm:p-4 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col items-center text-center">
          <span className="w-10 h-10 rounded-full bg-[#FFF2BA] text-[#D97706] flex items-center justify-center mb-1.5">
            <Star className="w-5 h-5 fill-[#FFD038] text-[#D97706]" />
          </span>
          <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#14274E] tabular-nums leading-none">
            {stats.totalStars}
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-[#5C7299] mt-1 truncate max-w-full">
            {t.totalStars}
          </span>
        </div>

        <div className="bg-white/95 rounded-3xl p-3 sm:p-4 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col items-center text-center">
          <span className="w-10 h-10 rounded-full bg-[#E5F0FF] text-[#2F8FFF] flex items-center justify-center mb-1.5">
            <ListChecks className="w-5 h-5" />
          </span>
          <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#14274E] tabular-nums leading-none">
            {stats.quizzesCompleted}
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-[#5C7299] mt-1 truncate max-w-full">
            {t.quizzesDone}
          </span>
        </div>

        <button
          key={celebrateKey}
          type="button"
          onClick={() => setCelebrateKey((k) => k + 1)}
          aria-label={`${stats.streakDays} ${t.dayStreak}`}
          className="animate-streak-celebrate relative bg-white/95 rounded-3xl p-3 sm:p-4 shadow-[0_8px_22px_-8px_rgba(234,88,12,0.2)] border-2 border-[#FED7AA] flex flex-col items-center text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#EA580C]"
        >
          <span className="relative w-10 h-10 rounded-full bg-[#FFE4D6] text-[#EA580C] flex items-center justify-center mb-1.5">
            <Flame className="animate-streak-flame w-5 h-5 fill-[#FB923C]" />
            <span
              aria-hidden="true"
              style={{ ['--tx' as string]: '-14px', ['--ty' as string]: '-12px' }}
              className="animate-streak-sparkle absolute w-1.5 h-1.5 rounded-full bg-[#FBBF24]"
            />
            <span
              aria-hidden="true"
              style={{ ['--tx' as string]: '14px', ['--ty' as string]: '-12px' }}
              className="animate-streak-sparkle absolute w-1.5 h-1.5 rounded-full bg-[#FB923C]"
            />
            <span
              aria-hidden="true"
              style={{ ['--tx' as string]: '0px', ['--ty' as string]: '-16px' }}
              className="animate-streak-sparkle absolute w-1.5 h-1.5 rounded-full bg-[#F59E0B]"
            />
          </span>
          <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#14274E] tabular-nums leading-none">
            {stats.streakDays}
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-[#5C7299] mt-1 truncate max-w-full">
            {t.dayStreak}
          </span>
        </button>
      </section>

      {/* Quick Access Action Cards */}
      <section className="flex-1 min-h-0 flex flex-col justify-center gap-2.5 pb-1">
        <button
          type="button"
          onClick={onOpenLanguagePicker}
          className="w-full bg-white/95 hover:bg-white rounded-2xl p-3.5 sm:p-4 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-3 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-full bg-[#BCE0FF] flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-[#164A9E]" />
            </span>
            <div className="text-start min-w-0">
              <div className="font-display text-base font-extrabold text-[#14274E] truncate">
                {t.languageSettingLabel}
              </div>
              <div className="text-xs font-semibold text-[#5C7299] flex items-center gap-1.5 mt-0.5">
                <FlagIcon code={lang} className="w-4 h-4" />
                <span>{currentLanguage.name}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#5C7299] shrink-0" />
        </button>

        <button
          type="button"
          onClick={onOpenQuizSettings}
          className="w-full bg-white/95 hover:bg-white rounded-2xl p-3.5 sm:p-4 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-3 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-full bg-[#D3C2F8] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-[#4D2584]" />
            </span>
            <div className="text-start min-w-0">
              <div className="font-display text-base font-extrabold text-[#14274E] truncate">
                {t.quizSettingsLabel}
              </div>
              <div className="text-xs font-semibold text-[#5C7299] truncate mt-0.5">
                {ageLabel} · {t.bookNames[settings.bookFilter]}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#5C7299] shrink-0" />
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          className="w-full bg-white/95 hover:bg-white rounded-2xl p-3.5 sm:p-4 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-3 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-full bg-[#C1E8AC] flex items-center justify-center shrink-0">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-[#1E621D]" />
              ) : (
                <VolumeX className="w-5 h-5 text-[#64748B]" />
              )}
            </span>
            <div className="text-start min-w-0">
              <div className="font-display text-base font-extrabold text-[#14274E] truncate">
                {t.soundEffectsLabel}
              </div>
              <div className="text-xs font-semibold text-[#5C7299] mt-0.5">
                {settings.soundEnabled ? t.soundOn : t.soundOff}
              </div>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              settings.soundEnabled
                ? 'bg-[#C1E8AC] text-[#1E621D]'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {settings.soundEnabled ? t.soundOn : t.soundOff}
          </span>
        </button>
      </section>
    </div>
  );
};
