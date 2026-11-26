import type React from 'react';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  LoaderCircle,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import {
  BIBLE_BOOKS,
  NEW_TESTAMENT_BOOKS,
  OLD_TESTAMENT_BOOKS,
  findBookById,
  getLocalizedBookName,
} from '../data/bibleBooks';
import type { UIStrings } from '../data/translations';
import type { LanguageCode, VerseItem } from '../types';
import { fetchClientBibleChapter } from '../utils/clientBibleQuiz';

interface BibleReaderModalProps {
  isOpen: boolean;
  initialBookId: number;
  initialChapter: number;
  lang: LanguageCode;
  t: UIStrings;
  savedIds: string[];
  isSpeaking: boolean;
  onClose: () => void;
  onToggleSpeak: (text: string) => void;
  onCopyVerse: (verse: VerseItem) => void;
  onToggleBookmark: (verse: VerseItem) => void;
  onSelectDailyVerse: (verse: VerseItem) => void;
}

export const BibleReaderModal: React.FC<BibleReaderModalProps> = ({
  isOpen,
  initialBookId,
  initialChapter,
  lang,
  t,
  savedIds,
  isSpeaking,
  onClose,
  onToggleSpeak,
  onCopyVerse,
  onToggleBookmark,
  onSelectDailyVerse,
}) => {
  const [bookId, setBookId] = useState(initialBookId || 19);
  const [chapter, setChapter] = useState(initialChapter || 23);
  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [version, setVersion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const validBook = findBookById(initialBookId) || BIBLE_BOOKS[18];
    const safeCh = Math.min(Math.max(1, initialChapter || 1), validBook.chapters);
    setBookId(validBook.id);
    setChapter(safeCh);
  }, [isOpen, initialBookId, initialChapter]);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(false);

    void fetchClientBibleChapter(bookId, chapter, lang, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return;
        setVerses(res.verses);
        setVersion(res.version);
        if (res.verses.length === 0) setLoadError(true);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isOpen, bookId, chapter, lang]);

  if (!isOpen) return null;

  const activeBook = findBookById(bookId) || BIBLE_BOOKS[18];
  const localizedBookName = getLocalizedBookName(activeBook.id, lang);
  const totalChapters = activeBook.chapters;
  const bookIndex = BIBLE_BOOKS.findIndex((b) => b.id === activeBook.id);

  const canGoPrev = bookIndex > 0 || chapter > 1;
  const canGoNext = bookIndex < BIBLE_BOOKS.length - 1 || chapter < totalChapters;

  const handlePrevChapter = () => {
    if (chapter > 1) {
      setChapter((c) => c - 1);
    } else if (bookIndex > 0) {
      const prevBook = BIBLE_BOOKS[bookIndex - 1];
      setBookId(prevBook.id);
      setChapter(prevBook.chapters);
    }
  };

  const handleNextChapter = () => {
    if (chapter < totalChapters) {
      setChapter((c) => c + 1);
    } else if (bookIndex < BIBLE_BOOKS.length - 1) {
      const nextBook = BIBLE_BOOKS[bookIndex + 1];
      setBookId(nextBook.id);
      setChapter(1);
    }
  };

  const handleListenChapter = () => {
    if (verses.length === 0) return;
    const chapterNarration = `${localizedBookName} ${chapter}. ${verses
      .map((v) => `${v.verse}. ${v.text}`)
      .join(' ')}`;
    onToggleSpeak(chapterNarration);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bible-reader-title"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#14274E]/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4"
    >
      <div className="bg-[#F4F9FF] rounded-[28px] max-w-3xl w-full h-[90dvh] flex flex-col overflow-hidden shadow-[0_24px_60px_rgba(15,30,61,0.4)] border-2 border-white">
        {/* Header */}
        <div className="shrink-0 bg-white px-4 py-3 border-b border-[#DCEBFF] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-2xl bg-[#FFE675] border border-[#F5B935] text-[#7A5400] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2
                id="bible-reader-title"
                className="font-display text-base sm:text-xl font-extrabold text-[#14274E] truncate"
              >
                {t.bibleReaderTitle}
              </h2>
              <p className="text-[11px] font-bold text-[#5C7299] truncate">
                {localizedBookName} {chapter}
                {version ? ` · ${version}` : ''}
                {verses.length > 0
                  ? ` · ${t.versesCountLabel.replace('{n}', String(verses.length))}`
                  : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {verses.length > 0 && (
              <button
                type="button"
                onClick={handleListenChapter}
                className={`min-h-[36px] px-3 py-1.5 rounded-full font-display font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer ${
                  isSpeaking
                    ? 'bg-[#FF9F43] text-white'
                    : 'bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#7A5400]'
                }`}
              >
                {isSpeaking ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isSpeaking ? t.stop : t.listenChapterBtn}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeLabel}
              className="w-9 h-9 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Book & Chapter Pickers */}
        <div className="shrink-0 bg-white/90 px-3.5 py-2.5 border-b border-[#DCEBFF] grid grid-cols-12 gap-2 items-center">
          <div className="col-span-7 sm:col-span-6">
            <select
              aria-label={t.selectBookLabel}
              value={bookId}
              onChange={(e) => {
                const nextId = Number(e.target.value);
                setBookId(nextId);
                setChapter(1);
              }}
              className="w-full min-h-[40px] rounded-2xl bg-[#EDF5FF] border border-[#BFD9FA] px-3 py-1.5 text-xs sm:text-sm font-extrabold text-[#14274E] focus:outline-none focus:ring-2 focus:ring-[#2A8CFF] cursor-pointer"
            >
              <optgroup label={t.oldTestamentLabel}>
                {OLD_TESTAMENT_BOOKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {getLocalizedBookName(b.id, lang)} ({t.chaptersCountLabel.replace('{n}', String(b.chapters))})
                  </option>
                ))}
              </optgroup>
              <optgroup label={t.newTestamentLabel}>
                {NEW_TESTAMENT_BOOKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {getLocalizedBookName(b.id, lang)} ({t.chaptersCountLabel.replace('{n}', String(b.chapters))})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="col-span-5 sm:col-span-3">
            <select
              aria-label={t.selectChapterLabel}
              value={chapter}
              onChange={(e) => setChapter(Number(e.target.value))}
              className="w-full min-h-[40px] rounded-2xl bg-[#EDF5FF] border border-[#BFD9FA] px-3 py-1.5 text-xs sm:text-sm font-extrabold text-[#14274E] focus:outline-none focus:ring-2 focus:ring-[#2A8CFF] cursor-pointer tabular-nums"
            >
              {Array.from({ length: totalChapters }, (_, idx) => idx + 1).map((chNum) => (
                <option key={chNum} value={chNum}>
                  {t.selectChapterLabel} {chNum}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-12 sm:col-span-3 flex items-center justify-end gap-1.5">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={handlePrevChapter}
              className="flex-1 sm:flex-none min-h-[36px] px-2.5 rounded-xl bg-[#EDF5FF] hover:bg-[#DCEBFF] disabled:opacity-45 text-[#14274E] text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer disabled:cursor-default"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{t.prevChapterBtn}</span>
            </button>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={handleNextChapter}
              className="flex-1 sm:flex-none min-h-[36px] px-2.5 rounded-xl bg-[#2A8CFF] hover:bg-[#1B7CEE] disabled:opacity-45 text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer disabled:cursor-default"
            >
              <span>{t.nextChapterBtn}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Full Chapter Verses */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 space-y-2.5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#5C7299] gap-2">
              <LoaderCircle className="w-7 h-7 animate-spin text-[#2A8CFF]" />
              <span className="text-sm font-bold">{t.loadingChapterMsg}</span>
            </div>
          ) : loadError || verses.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-[#DCEBFF] space-y-3">
              <p className="text-sm font-bold text-[#47608B]">{t.chapterLoadErrorMsg}</p>
              <button
                type="button"
                onClick={() => setChapter((c) => c)}
                className="px-4 py-2 rounded-full bg-[#2A8CFF] text-white text-xs font-bold cursor-pointer"
              >
                {t.retryBtn}
              </button>
            </div>
          ) : (
            verses.map((item) => {
              const isSaved = savedIds.includes(item.id);
              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 border border-[#DCEBFF] shadow-2xs flex flex-col gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="min-w-[28px] h-7 px-1.5 rounded-full bg-[#E5F0FF] text-[#164A9E] font-display text-xs font-extrabold flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                      {item.verse}
                    </span>
                    <p className="text-sm sm:text-base text-[#1E293B] leading-relaxed font-medium flex-1">
                      {item.text}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1 border-t border-[#F1F6FF]">
                    <button
                      type="button"
                      onClick={() => onToggleSpeak(`${item.reference}. ${item.text}`)}
                      className="h-8 px-2.5 rounded-full bg-[#FFF4C4] hover:bg-[#FFE675] text-[#7A5400] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t.listen}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onCopyVerse(item)}
                      className="h-8 px-2.5 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.copy}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleBookmark(item)}
                      className={`h-8 px-2.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                        isSaved
                          ? 'bg-[#FFE675] text-[#7A5400]'
                          : 'bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E]'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      <span>{isSaved ? t.savedWord : t.bookmark}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDailyVerse(item);
                        onClose();
                      }}
                      className="h-8 px-3 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white text-[11px] font-bold cursor-pointer"
                    >
                      {t.useDailyVerseBtn}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
