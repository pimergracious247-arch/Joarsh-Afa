import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  ChevronLeft,
  Clock,
  Copy,
  Dices,
  Layers,
  Loader2,
  Pause,
  Play,
  Search,
  Share2,
  Square,
  Trophy,
  Volume2,
  X,
} from 'lucide-react';
import { DynamicVerseItem, LanguageCode } from '../types';
import { UIStrings } from '../data/translations';
import { BIBLE_VERSES } from '../data/verses';
import { searchOfflineVerses } from '../utils/offlineVerseStore';
import { StorySceneSvg } from './StorySceneSvg';
import { GoldCoinIcon } from './GoldCoinIcon';

const AUTO_REFRESH_SECONDS = 20;

interface HomeScreenProps {
  currentVerse: DynamicVerseItem;
  isVerseLoading: boolean;
  isAutoPaused: boolean;
  timerResetToken: number;
  onToggleAutoPaused: () => void;
  onSelectVerse: (verse: DynamicVerseItem) => void;
  onPrevVerse: () => void;
  onRandomVerse: (silent?: boolean) => void;
  onCopyVerse: (verse: DynamicVerseItem) => void;
  onShareVerse: (verse: DynamicVerseItem) => void;
  onToggleBookmark: (verse: DynamicVerseItem) => void;
  onToggleSpeak: (text: string) => void;
  onGoToCategories: () => void;
  onGoToLeaderboard: () => void;
  onWatchFreeCoinsAd: () => void;
  isSpeaking: boolean;
  savedIds: string[];
  lang: LanguageCode;
  t: UIStrings;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentVerse,
  isVerseLoading,
  isAutoPaused,
  timerResetToken,
  onToggleAutoPaused,
  onSelectVerse,
  onPrevVerse,
  onRandomVerse,
  onCopyVerse,
  onShareVerse,
  onToggleBookmark,
  onToggleSpeak,
  onGoToCategories,
  onGoToLeaderboard,
  onWatchFreeCoinsAd,
  isSpeaking,
  savedIds,
  lang,
  t,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DynamicVerseItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REFRESH_SECONDS);

  const isSaved = savedIds.includes(currentVerse.id);

  useEffect(() => {
    setSecondsLeft(AUTO_REFRESH_SECONDS);
  }, [currentVerse.id, timerResetToken]);

  useEffect(() => {
    if (
      isAutoPaused ||
      isVerseLoading ||
      isSpeaking ||
      searchQuery.trim().length >= 2
    ) {
      return;
    }

    if (secondsLeft <= 0) {
      setSecondsLeft(AUTO_REFRESH_SECONDS);
      onRandomVerse(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [
    secondsLeft,
    isAutoPaused,
    isVerseLoading,
    isSpeaking,
    searchQuery,
    onRandomVerse,
  ]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      const lower = trimmed.toLowerCase();
      const starterPool: DynamicVerseItem[] = BIBLE_VERSES.map((v) => {
        const content = v.translations[lang];
        return {
          id: `${v.bookId || 43}:${v.chapter || 1}:${v.verseNumber || 1}`,
          bookId: v.bookId || 43,
          bookName: v.book,
          chapter: v.chapter || 1,
          verse: v.verseNumber || 1,
          reference: content.reference,
          highlightPrefix: content.highlightPrefix,
          text: content.text,
          version: content.version,
          themes: content.themes,
          lang,
        };
      });

      const localMatches = starterPool.filter(
        (item) =>
          item.reference.toLowerCase().includes(lower) ||
          item.text.toLowerCase().includes(lower) ||
          item.bookName.toLowerCase().includes(lower)
      );

      const offlineMatches = await searchOfflineVerses(trimmed, starterPool);
      if (controller.signal.aborted) return;

      const initialMatches =
        offlineMatches.length > 0 ? offlineMatches : localMatches;
      if (initialMatches.length > 0) {
        setSearchResults(initialMatches);
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsSearching(false);
        if (initialMatches.length === 0) {
          setSearchResults([]);
        }
        return;
      }

      try {
        const resp = await fetch(
          `/api/bible/search?q=${encodeURIComponent(trimmed)}&lang=${encodeURIComponent(
            lang
          )}`,
          { signal: controller.signal }
        );
        const data = (await resp.json()) as {
          results?: DynamicVerseItem[];
          error?: string;
        };
        if (!resp.ok) {
          throw new Error(data.error || 'Search failed.');
        }
        const remote = Array.isArray(data.results) ? data.results : [];
        if (remote.length > 0) {
          setSearchResults(remote);
        } else if (initialMatches.length === 0) {
          setSearchResults([]);
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        if (initialMatches.length === 0) {
          setSearchError(
            err instanceof Error ? err.message : 'Unable to search right now.'
          );
        }
      } finally {
        setIsSearching(false);
      }
    }, 360);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, lang]);

  const remainingText = currentVerse.text.startsWith(currentVerse.highlightPrefix)
    ? currentVerse.text.slice(currentVerse.highlightPrefix.length)
    : '';

  const speakPayload = `${currentVerse.reference}. ${currentVerse.text}`;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-4 py-1.5 sm:py-2.5 max-w-4xl mx-auto w-full overflow-hidden"
    >
      {/* Header: Cloud-sun icon + Daily Bible Verse title + Leaderboard & Packs buttons */}
      <header className="shrink-0 flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
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
          <h1 className="font-display text-lg sm:text-2xl font-extrabold text-[#14274E] tracking-tight truncate">
            {t.dailyBibleVerse}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onGoToLeaderboard}
            className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white border border-[#BFD9FA] text-[#14274E] font-display text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
            <span>Leaderboard</span>
          </button>

          <button
            type="button"
            onClick={onGoToCategories}
            className="hidden sm:inline-flex min-h-[38px] items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#7A5400] font-display text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Layers className="w-4 h-4" />
            <span>10 Quiz Packs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Search Bar + Quick Rewarded Video Banner Strip */}
      <div className="shrink-0 relative mt-1.5 z-20 flex flex-col sm:flex-row gap-1.5">
        <div className="relative flex-1">
          <div className="flex items-center bg-white/95 rounded-full px-3.5 py-1.5 sm:py-2 shadow-[0_4px_14px_rgba(20,39,78,0.08)] border border-white">
            {isSearching ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#2F8FFF] animate-spin shrink-0" />
            ) : (
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#64748B] shrink-0" />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className="w-full bg-transparent px-2.5 text-sm text-[#14274E] placeholder:text-[#7C8BA1] focus:outline-none"
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

          {searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-3xl shadow-[0_14px_34px_rgba(20,39,78,0.18)] border border-[#DCEBFF] max-h-60 overflow-y-auto p-2 space-y-1.5 z-30">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={`${item.id}-${item.reference}`}
                    type="button"
                    onClick={() => {
                      onSelectVerse(item);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full text-start rounded-2xl p-2.5 hover:bg-[#EDF5FF] transition-colors cursor-pointer border border-transparent hover:border-[#BFD9FA]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-extrabold text-[#14274E]">
                        {item.reference}
                      </span>
                      <span className="text-[11px] font-semibold text-[#5C7299]">
                        {item.version}
                      </span>
                    </div>
                    <p className="text-xs text-[#334155] line-clamp-2 mt-0.5 leading-snug">
                      {item.text}
                    </p>
                  </button>
                ))
              ) : isSearching ? (
                <div className="py-4 text-center text-xs font-semibold text-[#5C7299]">
                  Searching all 66 books...
                </div>
              ) : searchError ? (
                <div className="py-3 px-3 text-center text-xs font-semibold text-[#C81E3D]">
                  {searchError}
                </div>
              ) : (
                <div className="py-4 text-center text-xs font-semibold text-[#5C7299]">
                  {t.noSearchMatches}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rewarded Video +100 Free Coins CTA */}
        <button
          type="button"
          onClick={onWatchFreeCoinsAd}
          className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF8C1A] to-[#F59E0B] hover:from-[#EB7C0E] hover:to-[#D97706] text-white font-display font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-[0_3px_0_#B45309] active:translate-y-[1px] transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>Watch Video for +100 Free Coins</span>
          <GoldCoinIcon className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 md:gap-4 justify-center my-1.5 sm:my-2.5">
        <article className="md:col-span-8 bg-white/95 rounded-[28px] p-4 sm:p-5 shadow-[0_12px_32px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col justify-between min-h-0 flex-1">
          <div className="flex items-start justify-between gap-3 shrink-0">
            <h2 className="font-display text-xl sm:text-3xl font-extrabold text-[#14274E] tracking-tight pt-1">
              {currentVerse.reference}
            </h2>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onToggleBookmark(currentVerse)}
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
                className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full flex flex-col items-center justify-center shadow-sm border-2 transition-transform active:scale-95 cursor-pointer ${
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
                <span className="text-[10px] font-bold leading-none mt-0.5">
                  {isSpeaking ? t.stop : t.listen}
                </span>
              </button>
            </div>
          </div>

          <div className="my-auto py-2 overflow-y-auto">
            {isVerseLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-[#5C7299] text-sm font-semibold">
                <Loader2 className="w-5 h-5 animate-spin text-[#2F8FFF]" />
                <span>Loading Scripture...</span>
              </div>
            ) : (
              <p className="text-[16px] sm:text-xl md:text-[21px] leading-snug sm:leading-relaxed text-[#1E293B] font-medium">
                <mark className="bg-[#FFF16A] text-[#14274E] font-bold rounded-md px-1.5 py-0.5 box-decoration-clone">
                  {currentVerse.highlightPrefix}
                </mark>
                {remainingText ? ` ${remainingText.trimStart()}` : ''}
              </p>
            )}
          </div>

          <div className="shrink-0 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pt-2 border-t border-[#EFF5FF]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#47608B]">
              <span>{currentVerse.version}</span>
              <span aria-hidden="true">·</span>
              <span>{currentVerse.themes[0]}</span>
              <span aria-hidden="true">·</span>
              <span>{currentVerse.themes[1]}</span>
            </div>

            <div className="flex items-center gap-1.5 ms-auto">
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#5C7299] tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#2F8FFF]" />
                <span>
                  {isAutoPaused
                    ? t.autoNextPaused
                    : t.autoNextIn.replace('{sec}', String(secondsLeft))}
                </span>
              </span>
              <button
                type="button"
                onClick={onToggleAutoPaused}
                aria-label={isAutoPaused ? t.resumeAutoNext : t.pauseAutoNext}
                className={`h-8 px-2.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border transition-colors cursor-pointer ${
                  isAutoPaused
                    ? 'bg-[#FFE675] hover:bg-[#FFD94A] border-[#F5B935] text-[#7A5400]'
                    : 'bg-[#EDF5FF] hover:bg-[#DCEBFF] border-[#B0D4FA] text-[#14274E]'
                }`}
              >
                {isAutoPaused ? (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>{t.resumeAutoNext}</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span>{t.pauseAutoNext}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </article>

        {/* Desktop Companion Card */}
        <aside className="hidden md:flex md:col-span-4 bg-white/95 rounded-[28px] p-5 shadow-[0_12px_32px_-8px_rgba(30,58,138,0.12)] border border-white flex-col justify-between">
          <div>
            <div className="rounded-2xl overflow-hidden h-32 border border-[#DCEEFF] bg-[#CBE7FF] mb-3">
              <StorySceneSvg
                theme="noah"
                label="Illustrated Bible Quiz Packs"
              />
            </div>
            <h3 className="font-display text-xl font-extrabold text-[#14274E]">
              10 Bible Quiz Packs
            </h3>
            <p className="text-sm text-[#5C7299] mt-1 leading-snug">
              Earn +10 coins &amp; +100 pts per answer, plus +20 coins &amp; +200 pts on 6/6 Perfect Rounds.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToCategories}
            className="w-full py-3 rounded-2xl bg-[#2A8CFF] hover:bg-[#1A79EC] text-white font-display font-bold text-base shadow-[0_4px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer"
          >
            Choose Quiz Pack
          </button>
        </aside>
      </div>

      {/* 5-Button Action Row */}
      <div className="shrink-0 grid grid-cols-5 gap-1.5 sm:gap-2.5 pb-0.5">
        <button
          type="button"
          onClick={onPrevVerse}
          className="min-h-[50px] sm:min-h-[58px] flex flex-col items-center justify-center rounded-2xl bg-[#D4E9FF] hover:bg-[#C3E0FF] border border-[#B0D4FA] text-[#14274E] px-1 py-1.5 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full">
            {t.previous}
          </span>
        </button>

        <button
          type="button"
          disabled={isVerseLoading}
          onClick={() => onRandomVerse(false)}
          className="min-h-[50px] sm:min-h-[58px] flex flex-col items-center justify-center rounded-2xl bg-[#2A8CFF] hover:bg-[#1B7CEE] disabled:opacity-70 border border-[#196FD6] text-white px-1 py-1.5 shadow-sm transition-colors cursor-pointer"
        >
          {isVerseLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Dices className="w-5 h-5" />
          )}
          <span className="text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full">
            {t.random}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onCopyVerse(currentVerse)}
          className="min-h-[50px] sm:min-h-[58px] flex flex-col items-center justify-center rounded-2xl bg-[#D4E9FF] hover:bg-[#C3E0FF] border border-[#B0D4FA] text-[#14274E] px-1 py-1.5 transition-colors cursor-pointer"
        >
          <Copy className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full">
            {t.copy}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onShareVerse(currentVerse)}
          className="min-h-[50px] sm:min-h-[58px] flex flex-col items-center justify-center rounded-2xl bg-[#D4E9FF] hover:bg-[#C3E0FF] border border-[#B0D4FA] text-[#14274E] px-1 py-1.5 transition-colors cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full">
            {t.share}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onToggleBookmark(currentVerse)}
          className={`min-h-[50px] sm:min-h-[58px] flex flex-col items-center justify-center rounded-2xl border px-1 py-1.5 transition-colors cursor-pointer ${
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
