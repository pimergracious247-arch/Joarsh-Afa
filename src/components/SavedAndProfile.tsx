import type React from 'react';
import { useEffect, useState } from 'react';
import {
  Award,
  ChevronRight,
  Copy,
  Download,
  Flame,
  Globe,
  History,
  Layers,
  ListChecks,
  RotateCcw,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { getLocalizedBookName } from '../data/bibleBooks';
import { getLocalizedCategory, getQuizCategoryById } from '../data/categories';
import { LANGUAGES, type UIStrings } from '../data/translations';
import { useViewportMetrics } from '../hooks/useViewportPageSize';
import type {
  LanguageCode,
  PlayerProfile,
  QuizHistoryEntry,
  QuizSettings,
  UserStats,
} from '../types';
import {
  generateAchievementSummaryCard,
  type AchievementCardResult,
} from '../utils/achievementCard';
import { BibleAvatarIcon } from './BibleAvatarIcon';
import { GoldCoinIcon } from './GoldCoinIcon';
import { PaginationBar } from './PaginationBar';
import { PWAInstallCard } from './PWAComponents';

interface ProfileScreenProps {
  profile: PlayerProfile;
  stats: UserStats;
  lang: LanguageCode;
  settings: QuizSettings;
  quizHistory: QuizHistoryEntry[];
  t: UIStrings;
  onEditProfile: () => void;
  onOpenLeaderboard: () => void;
  onOpenLanguagePicker: () => void;
  onOpenQuizSettings: () => void;
  onRetryQuizHistory: (entry: QuizHistoryEntry) => void;
  onOpenQuizPacks: () => void;
  onOpenPrivacyPolicy: () => void;
  onToggleSound: () => void;
  onShowToast: (msg: string) => void;
  closeSubModalToken?: number;
  onSubModalOpenChange?: (open: boolean) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  stats,
  lang,
  settings,
  quizHistory,
  t,
  onEditProfile,
  onOpenLeaderboard,
  onOpenLanguagePicker,
  onOpenQuizSettings,
  onRetryQuizHistory,
  onOpenQuizPacks,
  onOpenPrivacyPolicy,
  onToggleSound,
  onShowToast,
  closeSubModalToken = 0,
  onSubModalOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'prefs'>('stats');
  const [historyPage, setHistoryPage] = useState(0);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [achievementCard, setAchievementCard] = useState<AchievementCardResult | null>(null);

  useEffect(() => {
    if (closeSubModalToken > 0) {
      setAchievementCard(null);
    }
  }, [closeSubModalToken]);

  useEffect(() => {
    onSubModalOpenChange?.(achievementCard !== null);
    return () => onSubModalOpenChange?.(false);
  }, [achievementCard, onSubModalOpenChange]);

  const { isMdUp, isShortViewport } = useViewportMetrics();
  const historyPerPage = isMdUp && !isShortViewport ? 4 : 3;
  const totalHistoryPages = Math.max(1, Math.ceil(quizHistory.length / historyPerPage));

  useEffect(() => {
    setHistoryPage((prev) => Math.min(prev, totalHistoryPages - 1));
  }, [totalHistoryPages]);

  const safeHistoryPage = Math.min(historyPage, totalHistoryPages - 1);
  const visibleHistory = quizHistory.slice(
    safeHistoryPage * historyPerPage,
    safeHistoryPage * historyPerPage + historyPerPage
  );

  const formatHistoryTitle = (entry: QuizHistoryEntry): string => {
    if (!entry.useCustomBookFilter && entry.categoryId) {
      const rawCat = getQuizCategoryById(entry.categoryId);
      if (rawCat) return getLocalizedCategory(rawCat, lang).title;
    }
    const bf = entry.settingsSnapshot.bookFilter;
    return bf === 'all' ? t.bookNames.all : getLocalizedBookName(bf, lang);
  };

  const formatHistoryAge = (ageGroup: QuizSettings['ageGroup']): string => {
    if (ageGroup === 'kids') return t.ageKids;
    if (ageGroup === 'teens') return t.ageTeens;
    return t.ageAdults;
  };

  const formatHistoryDate = (timestamp: number): string => {
    try {
      return new Intl.DateTimeFormat(lang, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(timestamp));
    } catch {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  const shareCardViaWebShare = async (card: AchievementCardResult): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        if (
          card.file &&
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [card.file] })
        ) {
          await navigator.share({ title: card.title, text: card.text, files: [card.file] });
          onShowToast(t.sharedToast);
          return true;
        }
        await navigator.share({ title: card.title, text: card.text });
        onShowToast(t.sharedToast);
        return true;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return false;
      }
    }
    return false;
  };

  const handleShareAchievement = () => {
    const card = generateAchievementSummaryCard(stats, lang, t);
    setAchievementCard(card);
    void shareCardViaWebShare(card);
  };

  const handleCopyAchievement = async () => {
    if (!achievementCard) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(achievementCard.text);
      }
      onShowToast(t.achievementCopiedToast);
    } catch {
      onShowToast(t.achievementCopiedToast);
    }
  };

  const handleSaveCardImage = () => {
    if (!achievementCard?.dataUrl) return;
    const link = document.createElement('a');
    link.href = achievementCard.dataUrl;
    link.download = 'bible-quest-achievement.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(t.achievementSavedToast);
  };

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
      className="relative z-10 flex-1 min-h-0 flex flex-col px-4 py-2 sm:py-3 max-w-3xl mx-auto w-full overflow-hidden"
    >
      <header className="shrink-0 flex items-center justify-between gap-2 pt-0.5 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <BibleAvatarIcon avatarId={profile.avatarId} size="md" t={t} />
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tracking-tight truncate">
              {profile.displayName || t.profileTitle}
            </h1>
            <p className="text-xs font-semibold text-[#5C7299] truncate">{t.profileTitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white border border-[#BFD9FA] text-[#164A9E] font-display font-bold text-xs shadow-xs cursor-pointer shrink-0"
        >
          {t.editAvatarBtn}
        </button>
      </header>

      <div className="shrink-0 grid grid-cols-3 gap-1 p-1 bg-white/85 rounded-2xl border border-[#DCEBFF] mb-2">
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`min-h-[40px] px-2 rounded-xl font-display text-[11px] sm:text-sm font-extrabold flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'stats'
              ? 'bg-[#2A8CFF] text-white shadow-xs'
              : 'text-[#47608B] hover:text-[#14274E]'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">{t.statsOverviewTab}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`min-h-[40px] px-2 rounded-xl font-display text-[11px] sm:text-sm font-extrabold flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-[#2A8CFF] text-white shadow-xs'
              : 'text-[#47608B] hover:text-[#14274E]'
          }`}
        >
          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">{t.quizHistoryTab}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('prefs')}
          className={`min-h-[40px] px-2 rounded-xl font-display text-[11px] sm:text-sm font-extrabold flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'prefs'
              ? 'bg-[#2A8CFF] text-white shadow-xs'
              : 'text-[#47608B] hover:text-[#14274E]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">{t.appPreferencesTab}</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden pb-1">
        {activeTab === 'stats' ? (
          <div className="my-auto space-y-2.5 sm:space-y-3">
            <section className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white/95 rounded-3xl p-2.5 sm:p-3 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col items-center text-center">
            <span className="w-9 h-9 rounded-full bg-[#FFF2BA] flex items-center justify-center mb-1">
              <GoldCoinIcon className="w-5 h-5" />
            </span>
            <span className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums leading-none">
              {stats.totalCoins.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-[#5C7299] mt-1 truncate max-w-full">
              {t.totalCoins}
            </span>
          </div>

          <div className="bg-white/95 rounded-3xl p-3 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col items-center text-center">
            <span className="w-9 h-9 rounded-full bg-[#E5F0FF] text-[#164A9E] flex items-center justify-center mb-1">
              <Trophy className="w-5 h-5 text-[#F59E0B]" />
            </span>
            <span className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums leading-none">
              {stats.totalScore.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-[#5C7299] mt-1 truncate max-w-full">
              {t.totalPointsStat}
            </span>
          </div>

          <button
            key={celebrateKey}
            type="button"
            onClick={() => setCelebrateKey((k) => k + 1)}
            aria-label={`${stats.bestStreak} ${t.bestStreakStat}`}
            className="animate-streak-celebrate relative bg-white/95 rounded-3xl p-3 shadow-[0_8px_22px_-8px_rgba(234,88,12,0.2)] border-2 border-[#FED7AA] flex flex-col items-center text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#EA580C]"
          >
            <span className="relative w-9 h-9 rounded-full bg-[#FFE4D6] text-[#EA580C] flex items-center justify-center mb-1">
              <Flame className="animate-streak-flame w-5 h-5 fill-[#FB923C]" />
              <span
                aria-hidden="true"
                style={{ '--tx': '-12px', '--ty': '-10px' } as React.CSSProperties}
                className="animate-streak-sparkle absolute w-1.5 h-1.5 rounded-full bg-[#FBBF24]"
              />
              <span
                aria-hidden="true"
                style={{ '--tx': '12px', '--ty': '-10px' } as React.CSSProperties}
                className="animate-streak-sparkle absolute w-1.5 h-1.5 rounded-full bg-[#FB923C]"
              />
            </span>
            <span className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums leading-none">
              {stats.bestStreak}
            </span>
            <span className="text-[11px] font-bold text-[#5C7299] mt-1 truncate max-w-full">
              {t.bestStreakStat}
            </span>
          </button>

          <div className="bg-white/95 rounded-3xl p-3 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col items-center text-center">
            <span className="w-9 h-9 rounded-full bg-[#FFF7D1] text-[#D97706] flex items-center justify-center mb-1">
              <Star className="w-5 h-5 fill-[#FBBF24]" />
            </span>
            <span className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums leading-none">
              {stats.perfectRounds}
            </span>
            <span className="text-[11px] font-bold text-[#5C7299] mt-1 truncate max-w-full">
              {t.perfectRoundsStat}
            </span>
          </div>

          <div className="bg-white/95 rounded-3xl p-3 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col items-center text-center">
            <span className="w-9 h-9 rounded-full bg-[#E5F0FF] text-[#2F8FFF] flex items-center justify-center mb-1">
              <ListChecks className="w-5 h-5" />
            </span>
            <span className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums leading-none">
              {stats.quizzesCompleted}
            </span>
            <span className="text-[11px] font-bold text-[#5C7299] mt-1 truncate max-w-full">
              {t.quizzesDone}
            </span>
          </div>

          <div className="bg-white/95 rounded-3xl p-3 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col items-center text-center">
            <span className="w-9 h-9 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mb-1">
              <Award className="w-5 h-5" />
            </span>
            <span className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums leading-none">
              {stats.streakDays}
            </span>
            <span className="text-[11px] font-bold text-[#5C7299] mt-1 truncate max-w-full">
              {t.dayStreak}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleShareAchievement}
            className="w-full min-h-[46px] px-5 py-2.5 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{t.shareAchievement}</span>
          </button>
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="w-full min-h-[46px] px-5 py-2.5 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#14274E] font-display font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#D99B1C] active:translate-y-[1px] transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-[#B45309]" />
            <span>{t.top20LeaderboardBtn}</span>
          </button>
        </div>
          </div>
        ) : activeTab === 'history' ? (
          <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            {quizHistory.length === 0 ? (
              <div className="my-auto bg-white/95 rounded-[28px] p-6 shadow-[0_10px_28px_-8px_rgba(30,58,138,0.12)] border border-white flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#EDF5FF] text-[#2F8FFF] flex items-center justify-center mb-2.5">
                  <History className="w-6 h-6" />
                </div>
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#14274E]">
                  {t.quizHistoryEmptyTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#5C7299] mt-1 max-w-xs">
                  {t.quizHistoryEmptyDesc}
                </p>
                <button
                  type="button"
                  onClick={onOpenQuizPacks}
                  className="mt-3.5 min-h-[42px] px-5 py-2 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-[0_3px_0_#1561C0] cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>{t.quizPacksNavBtn}</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-h-0 flex flex-col justify-center gap-2">
                  {visibleHistory.map((entry) => (
                    <article
                      key={entry.id}
                      className="bg-white/95 rounded-2xl p-3 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="font-display text-sm sm:text-base font-extrabold text-[#14274E] truncate">
                            {formatHistoryTitle(entry)}
                          </h3>
                          {entry.isPerfect && (
                            <Star className="w-3.5 h-3.5 text-[#D97706] fill-[#FBBF24] shrink-0" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold text-[#5C7299] mt-0.5 tabular-nums">
                          <span className="font-extrabold text-[#164A9E]">
                            {t.scoreLabel}: {entry.score}/{entry.total}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>+{entry.coinsEarned} {t.coinsUnit}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatHistoryAge(entry.settingsSnapshot.ageGroup)}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatHistoryDate(entry.timestamp)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRetryQuizHistory(entry)}
                        className="shrink-0 min-h-[38px] px-3 py-1.5 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-xs inline-flex items-center gap-1.5 shadow-[0_3px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer whitespace-nowrap"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t.retryBtn}</span>
                      </button>
                    </article>
                  ))}
                </div>
                <PaginationBar
                  page={safeHistoryPage}
                  totalPages={totalHistoryPages}
                  onPageChange={setHistoryPage}
                  lang={lang}
                  t={t}
                  compact
                />
              </>
            )}
          </div>
        ) : (
        <section className="my-auto space-y-2">
          <PWAInstallCard
            onInstalled={() => onShowToast(t.appInstalledToast)}
            t={t}
            lang={lang}
          />

          <button
            type="button"
            onClick={onOpenLanguagePicker}
            className="w-full bg-white/95 hover:bg-white rounded-2xl p-3 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-3 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#BCE0FF] flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-[#164A9E]" />
              </span>
              <div className="text-start min-w-0">
                <div className="font-display text-sm sm:text-base font-extrabold text-[#14274E] truncate">
                  {t.languageSettingLabel}
                </div>
                <div className="text-xs font-semibold text-[#5C7299] flex items-center gap-1.5 mt-0.5">
                  <span>
                    {currentLanguage.nativeName !== currentLanguage.name
                      ? `${currentLanguage.name} · ${currentLanguage.nativeName}`
                      : currentLanguage.name}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5C7299] shrink-0" />
          </button>

          <button
            type="button"
            onClick={onOpenQuizSettings}
            className="w-full bg-white/95 hover:bg-white rounded-2xl p-3 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-3 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#D3C2F8] flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-5 h-5 text-[#4D2584]" />
              </span>
              <div className="text-start min-w-0">
                <div className="font-display text-sm sm:text-base font-extrabold text-[#14274E] truncate">
                  {t.quizSettingsLabel}
                </div>
                <div className="text-xs font-semibold text-[#5C7299] truncate mt-0.5">
                  {ageLabel} ·{' '}
                  {settings.bookFilter === 'all'
                    ? t.bookNames.all
                    : getLocalizedBookName(settings.bookFilter, lang)}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5C7299] shrink-0" />
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="w-full bg-white/95 hover:bg-white rounded-2xl p-3 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-3 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C1E8AC] flex items-center justify-center shrink-0">
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-[#1E621D]" />
                ) : (
                  <VolumeX className="w-5 h-5 text-[#64748B]" />
                )}
              </span>
              <div className="text-start min-w-0">
                <div className="font-display text-sm sm:text-base font-extrabold text-[#14274E] truncate">
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

          <button
            type="button"
            onClick={onOpenPrivacyPolicy}
            className="w-full bg-white/95 hover:bg-white rounded-2xl p-3 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-3 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E5F0FF] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#164A9E]" />
              </span>
              <div className="text-start min-w-0">
                <div className="font-display text-sm sm:text-base font-extrabold text-[#14274E] truncate">
                  {t.privacyPolicyInfoBtn}
                </div>
                <div className="text-xs font-semibold text-[#5C7299] truncate mt-0.5">
                  {t.termsHeading} · {t.supportHeading}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5C7299] shrink-0" />
          </button>
        </section>
        )}
      </div>

      {achievementCard && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="achievement-modal-title"
          className="fixed inset-0 z-50 bg-[#14274E]/55 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-[28px] max-w-md w-full p-4 sm:p-5 shadow-[0_20px_50px_rgba(20,39,78,0.28)] border border-white space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h2
                id="achievement-modal-title"
                className="font-display text-lg sm:text-xl font-extrabold text-[#14274E]"
              >
                {t.achievementCardTitle}
              </h2>
              <button
                type="button"
                onClick={() => setAchievementCard(null)}
                aria-label={t.closeLabel}
                className="w-10 h-10 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {achievementCard.dataUrl ? (
              <div className="rounded-2xl overflow-hidden border border-[#DCEBFF] shadow-sm bg-[#EFF7FF]">
                <img
                  src={achievementCard.dataUrl}
                  alt={`${t.achievementCardTitle} — ${stats.totalCoins} ${t.totalCoins}, ${stats.streakDays} ${t.dayStreak}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto block"
                />
              </div>
            ) : (
              <div className="rounded-2xl bg-gradient-to-b from-[#BFE3FF] to-[#EFF7FF] p-5 text-center space-y-2 border border-[#DCEBFF]">
                <p className="font-display text-xl font-extrabold text-[#14274E]">
                  {stats.totalCoins} {t.totalCoins} · {stats.streakDays} {t.dayStreak}
                </p>
              </div>
            )}

            <p className="text-xs sm:text-sm font-semibold text-[#47608B] text-center leading-snug">
              {achievementCard.text}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-0.5">
              <button
                type="button"
                onClick={async () => {
                  if (!(await shareCardViaWebShare(achievementCard))) {
                    await handleCopyAchievement();
                  }
                }}
                className="min-w-0 min-h-[44px] px-2.5 py-2 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_3px_0_#1561C0] cursor-pointer"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.share}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveCardImage}
                className="min-w-0 min-h-[44px] px-2.5 py-2 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#14274E] font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.saveCardImage}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyAchievement}
                className="min-w-0 min-h-[44px] px-2.5 py-2 rounded-full bg-[#E5F0FF] hover:bg-[#CFE3FF] text-[#14274E] font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.copySummary}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
