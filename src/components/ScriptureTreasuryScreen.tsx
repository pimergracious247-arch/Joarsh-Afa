import type React from 'react';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Check,
  Copy,
  Download,
  Lock,
  Share2,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import type { UIStrings } from '../data/translations';
import { getLocalizedTreasuryCard, TREASURY_CARDS } from '../data/treasuryCards';
import { useViewportMetrics } from '../hooks/useViewportPageSize';
import type { LanguageCode, TreasuryCard, VerseItem } from '../types';
import { generateTreasuryCardImage, type TreasuryCardImage } from '../utils/scriptureCardCanvas';
import { GoldCoinIcon } from './GoldCoinIcon';
import { PaginationBar } from './PaginationBar';
import { StorySceneSvg } from './StorySceneSvg';

interface ScriptureTreasuryScreenProps {
  unlockedCardIds: string[];
  totalCoins: number;
  savedVerses: VerseItem[];
  lang: LanguageCode;
  t: UIStrings;
  onUnlockCard: (card: TreasuryCard) => void;
  onListen: (text: string) => void;
  onCopyVerse: (verse: VerseItem) => void;
  onRemoveSaved: (verse: VerseItem) => void;
  onSelectVerse: (verse: VerseItem) => void;
  onBrowseVerses: () => void;
  onShowToast: (msg: string) => void;
  closeSubModalToken?: number;
  onSubModalOpenChange?: (open: boolean) => void;
}

export const ScriptureTreasuryScreen: React.FC<ScriptureTreasuryScreenProps> = ({
  unlockedCardIds,
  totalCoins,
  savedVerses,
  lang,
  t,
  onUnlockCard,
  onListen,
  onCopyVerse,
  onRemoveSaved,
  onSelectVerse,
  onBrowseVerses,
  onShowToast,
  closeSubModalToken = 0,
  onSubModalOpenChange,
}) => {
  const [subTab, setSubTab] = useState<'cards' | 'saved'>('cards');
  const [cardsPage, setCardsPage] = useState(0);
  const [savedPage, setSavedPage] = useState(0);
  const [viewingCard, setViewingCard] = useState<{
    card: TreasuryCard;
    image: TreasuryCardImage;
  } | null>(null);

  useEffect(() => {
    if (closeSubModalToken > 0) {
      setViewingCard(null);
    }
  }, [closeSubModalToken]);

  useEffect(() => {
    onSubModalOpenChange?.(viewingCard !== null);
    return () => onSubModalOpenChange?.(false);
  }, [viewingCard, onSubModalOpenChange]);

  const { isMdUp, isLgUp, isShortViewport } = useViewportMetrics();
  const cardsPerPage =
    isLgUp && !isShortViewport ? 6 : isMdUp && !isShortViewport ? 4 : isLgUp ? 3 : 2;
  const savedPerPage = isMdUp && !isShortViewport ? 4 : 2;

  const totalCardPages = Math.max(1, Math.ceil(TREASURY_CARDS.length / cardsPerPage));
  const totalSavedPages = Math.max(1, Math.ceil(savedVerses.length / savedPerPage));

  useEffect(() => {
    setCardsPage((prev) => Math.min(prev, totalCardPages - 1));
  }, [totalCardPages]);

  useEffect(() => {
    setSavedPage((prev) => Math.min(prev, totalSavedPages - 1));
  }, [totalSavedPages]);

  const safeCardsPage = Math.min(cardsPage, totalCardPages - 1);
  const safeSavedPage = Math.min(savedPage, totalSavedPages - 1);

  const visibleCards = TREASURY_CARDS.slice(
    safeCardsPage * cardsPerPage,
    safeCardsPage * cardsPerPage + cardsPerPage
  );
  const visibleSaved = savedVerses.slice(
    safeSavedPage * savedPerPage,
    safeSavedPage * savedPerPage + savedPerPage
  );

  const handleOpenCard = (card: TreasuryCard) => {
    const image = generateTreasuryCardImage(card, t, lang === 'ar');
    setViewingCard({ card, image });
  };

  const handleShareCard = async (card: TreasuryCard, image: TreasuryCardImage) => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        if (
          image.file &&
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [image.file] })
        ) {
          await navigator.share({
            title: `${card.reference} — ${card.title}`,
            text: image.shareText,
            files: [image.file],
          });
          onShowToast(t.sharedToast);
          return;
        }
        await navigator.share({
          title: `${card.reference} — ${card.title}`,
          text: image.shareText,
        });
        onShowToast(t.sharedToast);
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard?.writeText(image.shareText);
    } catch {}
    onShowToast(t.copiedToast);
  };

  const handleDownloadCard = (card: TreasuryCard, image: TreasuryCardImage) => {
    if (!image.dataUrl) return;
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = `scripture-card-${card.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(t.treasurySavedToast);
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-4 py-2 sm:py-3 max-w-4xl mx-auto w-full overflow-hidden"
    >
      <header className="shrink-0 flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FFE675] border-2 border-[#F5B935] text-[#7A5400] flex items-center justify-center shadow-xs shrink-0">
            <BookOpen className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-lg sm:text-2xl font-extrabold text-[#14274E] tracking-tight truncate">
              {t.treasuryTitle}
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-[#47608B] truncate">
              {t.treasurySubtitle
                .replace('{unlocked}', String(unlockedCardIds.length))
                .replace('{total}', String(TREASURY_CARDS.length))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white/85 rounded-2xl border border-[#DCEBFF] shrink-0">
          <button
            type="button"
            onClick={() => setSubTab('cards')}
            className={`min-h-[36px] px-3 rounded-xl font-display text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'cards' ? 'bg-[#2A8CFF] text-white' : 'text-[#47608B] hover:text-[#14274E]'
            }`}
          >
            {t.verseCardsTab}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('saved')}
            className={`min-h-[36px] px-3 rounded-xl font-display text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'saved' ? 'bg-[#2A8CFF] text-white' : 'text-[#47608B] hover:text-[#14274E]'
            }`}
          >
            {t.tabSaved} ({savedVerses.length})
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center">
        {subTab === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {visibleCards.map((rawCard) => {
              const card = getLocalizedTreasuryCard(rawCard, lang);
              const isUnlocked = unlockedCardIds.includes(card.id);
              const canAfford = totalCoins >= card.unlockCost;
              return (
                <article
                  key={card.id}
                  className="bg-white/95 rounded-[22px] p-3 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border-2 border-white flex flex-col justify-between gap-2"
                >
                  <div className="flex sm:block items-start gap-2.5">
                    <div className="relative w-24 h-20 sm:w-full sm:h-24 rounded-2xl overflow-hidden border border-[#DCEBFF] bg-[#CBE7FF] sm:mb-2 shrink-0">
                      <StorySceneSvg
                        theme={card.storyTheme}
                        label={`${card.reference} — ${card.title}`}
                      />
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-[#14274E]/40 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 text-[#B45309] flex items-center justify-center shadow-sm">
                            <Lock className="w-4 h-4" />
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-sm sm:text-base font-extrabold text-[#14274E] truncate">
                        {card.reference}
                      </h2>
                      <div className="text-[11px] sm:text-xs font-bold text-[#2F8FFF] truncate">
                        {card.title}
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#334155] mt-0.5 leading-snug line-clamp-2">
                        {isUnlocked ? `“${card.verseText}”` : t.treasuryLockedDesc}
                      </p>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-[#EFF5FF]">
                      <button
                        type="button"
                        onClick={() => handleOpenCard(card)}
                        className="flex-1 min-h-[38px] rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.viewAndShareBtn}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onListen(`${card.reference}. ${card.verseText}`)}
                        aria-label={t.listenToRefAria.replace('{ref}', card.reference)}
                        className="w-9 h-9 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] text-[#7A5400] flex items-center justify-center cursor-pointer shrink-0"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUnlockCard(card)}
                      className={`w-full min-h-[38px] rounded-full font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#7A5400]'
                          : 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#475569]'
                      }`}
                    >
                      <GoldCoinIcon className="w-4 h-4" />
                      <span>{t.unlockForCoinsBtn.replace('{cost}', String(card.unlockCost))}</span>
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        ) : savedVerses.length === 0 ? (
          <div className="bg-white/95 rounded-[28px] p-6 shadow-[0_10px_28px_-8px_rgba(30,58,138,0.12)] border border-white flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#EDF5FF] text-[#2F8FFF] flex items-center justify-center mb-3">
              <Bookmark className="w-7 h-7" />
            </div>
            <h2 className="font-display text-xl font-extrabold text-[#14274E]">
              {t.savedEmptyTitle}
            </h2>
            <p className="text-sm text-[#5C7299] mt-1 max-w-xs">{t.savedEmptySubtitle}</p>
            <button
              type="button"
              onClick={onBrowseVerses}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-sm shadow-sm cursor-pointer"
            >
              {t.browseVersesBtn}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {visibleSaved.map((verse) => (
              <article
                key={verse.id}
                className="bg-white/95 rounded-2xl p-3 sm:p-3.5 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex flex-col justify-between gap-2"
              >
                <button
                  type="button"
                  onClick={() => onSelectVerse(verse)}
                  className="text-start cursor-pointer group"
                >
                  <h2 className="font-display text-sm sm:text-base font-extrabold text-[#14274E] group-hover:text-[#2F8FFF] transition-colors truncate">
                    {verse.reference}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#334155] mt-0.5 leading-snug line-clamp-2 sm:line-clamp-3">
                    {verse.text}
                  </p>
                </button>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#EFF5FF]">
                  <span className="text-[11px] font-semibold text-[#5C7299] truncate">
                    {verse.version}
                    {verse.themes[0] ? ` · ${verse.themes[0]}` : ''}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onListen(`${verse.reference}. ${verse.text}`)}
                      aria-label={t.listen}
                      className="h-8 px-2.5 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] text-[#7A5400] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t.listen}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onCopyVerse(verse)}
                      aria-label={t.copy}
                      className="h-8 px-2.5 rounded-full bg-[#E5F0FF] hover:bg-[#CFE3FF] text-[#14274E] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t.copy}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveSaved(verse)}
                      aria-label={t.remove}
                      className="h-8 w-8 rounded-full bg-[#FFE8EC] hover:bg-[#FFD1DA] text-[#C81E3D] flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {subTab === 'cards' ? (
        <PaginationBar
          page={safeCardsPage}
          totalPages={totalCardPages}
          onPageChange={setCardsPage}
          lang={lang}
          t={t}
        />
      ) : savedVerses.length > 0 ? (
        <PaginationBar
          page={safeSavedPage}
          totalPages={totalSavedPages}
          onPageChange={setSavedPage}
          lang={lang}
          t={t}
        />
      ) : null}

      {viewingCard && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="treasury-card-modal-title"
          className="fixed inset-0 z-50 bg-[#14274E]/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-[28px] max-w-md w-full p-4 sm:p-5 shadow-[0_24px_60px_rgba(15,30,61,0.35)] border-2 border-white space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2
                  id="treasury-card-modal-title"
                  className="font-display text-lg sm:text-xl font-extrabold text-[#14274E]"
                >
                  {viewingCard.card.reference}
                </h2>
                <p className="text-xs font-bold text-[#2F8FFF]">{viewingCard.card.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingCard(null)}
                aria-label={t.closeLabel}
                className="w-9 h-9 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {viewingCard.image.dataUrl && (
              <div className="rounded-2xl overflow-hidden border border-[#DCEBFF] shadow-xs">
                <img
                  src={viewingCard.image.dataUrl}
                  alt={`${viewingCard.card.reference} — ${viewingCard.card.verseText}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto block"
                />
              </div>
            )}

            <p className="text-xs text-[#47608B] text-center font-medium">
              {viewingCard.card.reflection}
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => void handleShareCard(viewingCard.card, viewingCard.image)}
                className="min-h-[42px] rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.share}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadCard(viewingCard.card, viewingCard.image)}
                className="min-h-[42px] rounded-full bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#7A5400] font-display font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.savePngBtn}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onListen(`${viewingCard.card.reference}. ${viewingCard.card.verseText}`)
                }
                className="min-h-[42px] rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] font-display font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t.listen}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
