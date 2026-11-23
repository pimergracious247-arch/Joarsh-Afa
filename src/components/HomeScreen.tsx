import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  Copy,
  Dices,
  Search,
  Share2,
  Square,
  Volume2,
  X,
  ArrowRight,
} from 'lucide-react';
import { BibleVerse, LanguageCode } from '../types';
import { UIStrings } from '../data/translations';

interface HomeScreenProps {
  verses: BibleVerse[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onPrevVerse: () => void;
  onRandomVerse: () => void;
  onCopyVerse: (verse: BibleVerse) => void;
  onShareVerse: (verse: BibleVerse) => void;
  onToggleBookmark: (verseId: string) => void;
  onToggleSpeak: (text: string) => void;
  onGoToQuiz: () => void;
  isSpeaking: boolean;
  savedIds: string[];
  lang: LanguageCode;
  t: UIStrings;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  verses,
  currentIndex,
  onSelectIndex,
  onPrevVerse,
  onRandomVerse,
  onCopyVerse,
  onShareVerse,
  onToggleBookmark,
  onToggleSpeak,
  onGoToQuiz,
  isSpeaking,
  savedIds,
  lang,
  t,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const currentVerse = verses[currentIndex] || verses[0];
  const localized = currentVerse.translations[lang];
  const isSaved = savedIds.includes(currentVerse.id);

  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return verses
      .map((v, idx) => ({ verse: v, idx, content: v.translations[lang] }))
      .filter(
        ({ content, verse }) =>
          content.reference.toLowerCase().includes(q) ||
          content.text.toLowerCase().includes(q) ||
          verse.book.toLowerCase().includes(q) ||
          content.themes.some((th) => th.toLowerCase().includes(q))
      )
      .slice(0, 3);
  }, [searchQuery, verses, lang]);

  const remainingText = localized.text.startsWith(localized.highlightPrefix)
    ? localized.text.slice(localized.highlightPrefix.length)
    : '';

  const speakPayload = `${localized.reference}. ${localized.text}`;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-4 py-2 sm:py-3 max-w-4xl mx-auto w-full overflow-hidden"
    >
      {/* Header: Cloud-sun icon + Daily Bible Verse title */}
      <header className="shrink-0 flex items-center justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-full h-full" aria-hidden="true">
              <circle cx="22" cy="18" r="9" fill="#FBBF24" />
              <g stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round">
                <line x1="22" y1="3" x2="22" y2="6" />
                <line x1="33" y1="7" x2="31" y2="9.5" />
                <line x1="11" y1="7" x2="13" y2="9.5" />
                <line x1="37" y1="18" x2="34" y2="18" />
                <line x1="7" y1="18" x2="10" y2="18" />
              </g>
              <path
                d="M15 36 H34 C38 36 41 33 41 29.5 C41 26.3 38.6 23.7 35.5 23.3 C34.5 18.8 30.5 15.5 25.8 15.5 C20.6 15.5 16.3 19.5 15.9 24.6 C12.6 25.1 10 27.9 10 31.3 C10 34 12.2 36 15 36 Z"
                fill="#FFFFFF"
                stroke="#C9B382"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14274E] tracking-tight truncate">
            {t.dailyBibleVerse}
          </h1>
        </div>

        {/* Desktop quick Quiz CTA */}
        <button
          type="button"
          onClick={onGoToQuiz}
          className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] border-2 border-[#F5B935] text-[#14274E] font-display text-sm font-bold shadow-xs transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <span>{t.tabQuiz}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Rounded Search Bar + Instant Match Selector (Zero-scroll) */}
      <div className="shrink-0 relative mt-1.5 sm:mt-2">
        <div className="flex items-center bg-white/95 rounded-full px-3.5 py-2 sm:py-2.5 shadow-[0_4px_14px_rgba(20,39,78,0.08)] border border-white">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#64748B] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="w-full bg-transparent px-2.5 text-sm sm:text-base text-[#14274E] placeholder:text-[#7C8BA1] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label={t.clearSearch}
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {searchQuery.trim().length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {searchMatches.length > 0 ? (
              searchMatches.map(({ verse, idx, content }) => (
                <button
                  key={verse.id}
                  type="button"
                  onClick={() => {
                    onSelectIndex(idx);
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold bg-white hover:bg-[#EDF5FF] text-[#14274E] border border-[#BFD9FA] rounded-full px-3 py-1 shadow-xs transition-colors cursor-pointer"
                >
                  {content.reference}
                </button>
              ))
            ) : (
              <span className="text-xs font-medium text-[#5C7299] px-2">
                {t.noSearchMatches}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area: Responsive Single Card on Mobile, Balanced 2-Column on Large Desktop */}
      <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 md:gap-4 justify-center my-2 sm:my-3">
        {/* Main Elevated Verse Card */}
        <article className="md:col-span-8 bg-white rounded-[28px] p-4 sm:p-6 shadow-[0_12px_32px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col justify-between min-h-0 flex-1">
          {/* Card Top Row: Scripture Reference + Bookmark Icon + Circular Yellow Listen Button */}
          <div className="flex items-start justify-between gap-3 shrink-0">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14274E] tracking-tight pt-1">
              {localized.reference}
            </h2>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onToggleBookmark(currentVerse.id)}
                aria-label={isSaved ? t.savedWord : t.bookmark}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-[#E5F0FF] text-[#2F8FFF]'
                    : 'bg-[#F4F8FF] text-[#14274E] hover:bg-[#E5F0FF]'
                }`}
              >
                <Bookmark
                  className={`w-5 h-5 ${isSaved ? 'fill-[#2F8FFF]' : ''}`}
                />
              </button>

              <button
                type="button"
                onClick={() => onToggleSpeak(speakPayload)}
                aria-label={isSpeaking ? t.stop : t.listen}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center shadow-sm border-2 transition-transform active:scale-95 cursor-pointer ${
                  isSpeaking
                    ? 'bg-[#FF9F43] border-[#E67E22] text-white'
                    : 'bg-gradient-to-b from-[#FFE985] to-[#FFD23F] border-[#F5C12E] text-[#7A5400]'
                }`}
              >
                {isSpeaking ? (
                  <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
                <span className="text-[10px] sm:text-[11px] font-bold leading-none mt-0.5">
                  {isSpeaking ? t.stop : t.listen}
                </span>
              </button>
            </div>
          </div>

          {/* Verse Body with Soft Yellow Highlight on Opening Phrase */}
          <div className="my-auto py-2 sm:py-3">
            <p className="text-[17px] sm:text-xl md:text-[22px] leading-snug sm:leading-relaxed text-[#1E293B] font-medium">
              <mark className="bg-[#FFF16A] text-[#14274E] font-bold rounded-md px-1.5 py-0.5 box-decoration-clone">
                {localized.highlightPrefix}
              </mark>
              {remainingText}
            </p>
          </div>

          {/* Clean Unboxed Metadata Tags */}
          <div className="shrink-0 flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#47608B] pt-1">
            <span>{localized.version}</span>
            <span aria-hidden="true">·</span>
            <span>{localized.themes[0]}</span>
            <span aria-hidden="true">·</span>
            <span>{localized.themes[1]}</span>
          </div>
        </article>

        {/* Desktop Companion Card: Today's Illustrated Quiz Invitation (visible md+) */}
        <aside className="hidden md:flex md:col-span-4 bg-white/95 rounded-[28px] p-5 shadow-[0_12px_32px_-8px_rgba(30,58,138,0.12)] border border-white flex-col justify-between">
          <div>
            <div className="rounded-2xl overflow-hidden h-32 border border-[#DCEEFF] mb-3">
              <img
                src="/src/assets/images/quiz_noah_ark_1795414565549.jpg"
                alt="Illustrated Bible Quiz preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-display text-xl font-extrabold text-[#14274E]">
              {t.tabQuiz}
            </h3>
            <p className="text-sm text-[#5C7299] mt-1 leading-snug">
              {t.quizCompleteSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToQuiz}
            className="w-full py-3 rounded-2xl bg-[#2A8CFF] hover:bg-[#1A79EC] text-white font-display font-bold text-base shadow-[0_4px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer"
          >
            {t.tabQuiz}
          </button>
        </aside>
      </div>

      {/* 5-Button Action Row */}
      <div className="shrink-0 grid grid-cols-5 gap-1.5 sm:gap-2.5 pb-0.5">
        <button
          type="button"
          onClick={onPrevVerse}
          className="min-h-[54px] sm:min-h-[62px] flex flex-col items-center justify-center rounded-2xl bg-[#D4E9FF] hover:bg-[#C3E0FF] border border-[#B0D4FA] text-[#14274E] px-1 py-1.5 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full">
            {t.previous}
          </span>
        </button>

        <button
          type="button"
          onClick={onRandomVerse}
          className="min-h-[54px] sm:min-h-[62px] flex flex-col items-center justify-center rounded-2xl bg-[#2A8CFF] hover:bg-[#1B7CEE] border border-[#196FD6] text-white px-1 py-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Dices className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full">
            {t.random}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onCopyVerse(currentVerse)}
          className="min-h-[54px] sm:min-h-[62px] flex flex-col items-center justify-center rounded-2xl bg-[#D4E9FF] hover:bg-[#C3E0FF] border border-[#B0D4FA] text-[#14274E] px-1 py-1.5 transition-colors cursor-pointer"
        >
          <Copy className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full">
            {t.copy}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onShareVerse(currentVerse)}
          className="min-h-[54px] sm:min-h-[62px] flex flex-col items-center justify-center rounded-2xl bg-[#D4E9FF] hover:bg-[#C3E0FF] border border-[#B0D4FA] text-[#14274E] px-1 py-1.5 transition-colors cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full">
            {t.share}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onToggleBookmark(currentVerse.id)}
          className={`min-h-[54px] sm:min-h-[62px] flex flex-col items-center justify-center rounded-2xl border px-1 py-1.5 transition-colors cursor-pointer ${
            isSaved
              ? 'bg-[#FFE675] border-[#EBB935] text-[#14274E]'
              : 'bg-[#D4E9FF] hover:bg-[#C3E0FF] border-[#B0D4FA] text-[#14274E]'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-[#14274E]' : ''}`} />
          <span className="text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full">
            {isSaved ? t.savedWord : t.bookmark}
          </span>
        </button>
      </div>
    </div>
  );
};
