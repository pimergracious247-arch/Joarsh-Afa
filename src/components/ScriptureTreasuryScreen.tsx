import type React from 'react';
import { useState } from 'react';
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
import { TREASURY_CARDS } from '../data/treasuryCards';
import type { LanguageCode, TreasuryCard, VerseItem } from '../types';
import { generateTreasuryCardImage, type TreasuryCardImage } from '../utils/scriptureCardCanvas';
import { GoldCoinIcon } from './GoldCoinIcon';
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
}) => {
  const [subTab, setSubTab] = useState<'cards' | 'saved'>('cards');
  const [viewingCard, setViewingCard] = useState<{
    card: TreasuryCard;
    image: TreasuryCardImage;
  } | null>(null);

  const handleOpenCard = (card: TreasuryCard) => {
    const image = generateTreasuryCardImage(card);
    setViewingCard({ card, image });
  };

  const handleShareCard = async (card: TreasuryCard, image: TreasuryCardImage) => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        if (image.file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [image.file] })) {
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
    onShowToast('Scripture card saved!');
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col px-4 py-2.5 sm:py-3 max-w-4xl mx-auto w-full overflow-hidden"
    >
      <header className="shrink-0 flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-2xl bg-[#FFE675] border-2 border-[#F5B935] text-[#7A5400] flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tracking-tight">
              Scripture Treasury
            </h1>
            <p className="text-xs font-semibold text-[#47608B]">
              {unlockedCardIds.length}/{TREASURY_CARDS.length} illustrated verse cards unlocked
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white/85 rounded-2xl border border-[#DCEBFF]">
          <button
            type="button"
            onClick={() => setSubTab('cards')}
            className={`min-h-[36px] px-3 rounded-xl font-display text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'cards' ? 'bg-[#2A8CFF] text-white' : 'text-[#47608B] hover:text-[#14274E]'
            }`}
          >
            Verse Cards
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

      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 pb-3">
        {subTab === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TREASURY_CARDS.map((card) => {
              const isUnlocked = unlockedCardIds.includes(card.id);
              const canAfford = totalCoins >= card.unlockCost;
              return (
                <article
                  key={card.id}
                  className="bg-white/95 rounded-[24px] p-3.5 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border-2 border-white flex flex-col justify-between gap-2.5"
                >
                  <div>
                    <div className="relative h-28 rounded-2xl overflow-hidden border border-[#DCEBFF] bg-[#CBE7FF] mb-2.5">
                      <StorySceneSvg
                        theme={card.storyTheme}
                        label={`${card.reference} — ${card.title}`}
                      />
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-[#14274E]/40 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="w-10 h-10 rounded-full bg-white/95 text-[#B45309] flex items-center justify-center shadow-sm">
                            <Lock className="w-5 h-5" />
                          </span>
                        </div>
                      )}
                    </div>
                    <h2 className="font-display text-base font-extrabold text-[#14274E]">
                      {card.reference}
                    </h2>
                    <div className="text-xs font-bold text-[#2F8FFF]">{card.title}</div>
                    <p className="text-xs text-[#334155] mt-1 leading-snug line-clamp-3">
                      {isUnlocked
                        ? `“${card.verseText}”`
                        : 'Unlock this illustrated Scripture card to read, listen, and share it with family & friends.'}
                    </p>
                  </div>

                  {isUnlocked ? (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-[#EFF5FF]">
                      <button
                        type="button"
                        onClick={() => handleOpenCard(card)}
                        className="flex-1 min-h-[40px] rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>View &amp; Share</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onListen(`${card.reference}. ${card.verseText}`)}
                        aria-label={`Listen to ${card.reference}`}
                        className="w-10 h-10 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] text-[#7A5400] flex items-center justify-center cursor-pointer shrink-0"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUnlockCard(card)}
                      className={`w-full min-h-[40px] rounded-full font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#7A5400]'
                          : 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#475569]'
                      }`}
                    >
                      <GoldCoinIcon className="w-4 h-4" />
                      <span>Unlock for {card.unlockCost} Coins</span>
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        ) : savedVerses.length === 0 ? (
          <div className="bg-white/95 rounded-[28px] p-6 shadow-[0_10px_28px_-8px_rgba(30,58,138,0.12)] border border-white flex flex-col items-center text-center mt-4">
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
          <div className="space-y-2.5">
            {savedVerses.map((verse) => (
              <article
                key={verse.id}
                className="bg-white/95 rounded-2xl p-3.5 sm:p-4 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex flex-col gap-2"
              >
                <button
                  type="button"
                  onClick={() => onSelectVerse(verse)}
                  className="text-start cursor-pointer group"
                >
                  <h2 className="font-display text-base sm:text-lg font-extrabold text-[#14274E] group-hover:text-[#2F8FFF] transition-colors">
                    {verse.reference}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#334155] mt-0.5 leading-snug">
                    {verse.text}
                  </p>
                </button>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[11px] font-semibold text-[#5C7299]">
                    {verse.version} · {verse.themes[0]}
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
                <span>Save PNG</span>
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
