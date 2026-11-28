import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BibleReaderModal } from './components/BibleReaderModal';
import { BottomChrome } from './components/BottomChrome';
import { CategorySelectScreen } from './components/CategorySelectScreen';
import { ExitAppModal } from './components/ExitAppModal';
import { HomeScreen } from './components/HomeScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { OfflineIndicator } from './components/PWAComponents';
import { QuizScreen } from './components/QuizScreen';
import { RewardVideoAdModal } from './components/RewardVideoAdModal';
import { ProfileScreen } from './components/SavedAndProfile';
import { ScriptureTreasuryScreen } from './components/ScriptureTreasuryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SkyBackdrop } from './components/SkyBackdrop';
import { TopBar } from './components/TopBar';
import {
  BIBLE_BOOKS,
  findBookByQuery,
  getLocalizedBookName,
  getTranslationCodesForLang,
} from './data/bibleBooks';
import {
  FREE_CATEGORY_IDS,
  getLocalizedCategory,
  getQuizCategoryById,
} from './data/categories';
import { getLocalizedStoryThemeAlt } from './data/illustrations';
import { TRANSLATIONS } from './data/translations';
import { getLocalizedTreasuryCard, TREASURY_CARDS } from './data/treasuryCards';
import { BIBLE_VERSES } from './data/verses';
import type {
  AppScreen,
  LanguageCode,
  MainTab,
  PlayerProfile,
  QuizCategory,
  QuizHistoryEntry,
  QuizQuestion,
  QuizSettings,
  RewardAdPlacement,
  StoryTheme,
  TreasuryCard,
  UserStats,
  VerseItem,
} from './types';
import {
  isNativeCapacitorApp,
  notifyFullRoundCompletedHook,
  tryShowNativeRewardedAd,
} from './utils/admobBridge';
import {
  fetchClientBibleVerse,
  generateClientBibleQuizRound,
  preWarmOfflineQuizChapters,
} from './utils/clientBibleQuiz';
import {
  getAllCachedChaptersFromIDB,
  getLoadedPreCachedDailyVerses,
  getQuizQuestionsFromOfflineBank,
  getSavedVersesFromIDB,
  getViewedVerses,
  hydrateOfflineDailyVerses,
  loadPreCachedDailyVerses,
  recordViewedVerse,
  saveQuizQuestionsToOfflineBank,
  syncSavedVersesToIDB,
} from './utils/offlineVerseStore';
import {
  exitNativeApp,
  playChime,
  speakText,
  stopSpeaking,
  VOICE_PRESETS,
} from './utils/speechAndAudio';

const STORAGE_KEYS = {
  lang: 'sunbeam_lang_v1',
  savedVerses: 'sunbeam_saved_verses_v2',
  seenVerses: 'sunbeam_seen_verses_v1',
  askedQuestions: 'sunbeam_asked_questions_v1',
  settings: 'sunbeam_settings_v1',
  stats: 'sunbeam_stats_v1',
  profile: 'sunbeam_profile_v1',
  unlockedCategories: 'sunbeam_unlocked_categories_v1',
  activeCategory: 'sunbeam_active_category_v1',
  unlockedTreasury: 'sunbeam_unlocked_treasury_v1',
  quizHistory: 'sunbeam_quiz_history_v1',
} as const;

const DEFAULT_SETTINGS: QuizSettings = {
  ageGroup: 'adults',
  bookFilter: 'all',
  voiceGender: 'female',
  voicePitch: VOICE_PRESETS.female.pitch,
  voiceSpeed: VOICE_PRESETS.female.rate,
  soundEnabled: true,
};

const DEFAULT_STATS: UserStats = {
  totalCoins: 0,
  totalScore: 0,
  weeklyScore: 0,
  bestStreak: 0,
  currentCorrectStreak: 0,
  perfectRounds: 0,
  quizzesCompleted: 0,
  streakDays: 1,
  lastPlayedDate: null,
};

const DEFAULT_PROFILE: PlayerProfile = {
  displayName: '',
  avatarId: 'dove',
  isCustomized: false,
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadInitialSettings(): QuizSettings {
  const base = loadJson<QuizSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  try {
    const storedBook = localStorage.getItem('selectedBook');
    const storedVoice = localStorage.getItem('voiceGender');
    const resolvedGender =
      storedVoice === 'female' ||
      storedVoice === 'male' ||
      storedVoice === 'teen' ||
      storedVoice === 'kids'
        ? storedVoice
        : base.voiceGender;
    const preset = VOICE_PRESETS[resolvedGender] || VOICE_PRESETS.female;
    const clampedPitch =
      typeof base.voicePitch === 'number' &&
      base.voicePitch >= 0.7 &&
      base.voicePitch <= 1.85
        ? base.voicePitch
        : preset.pitch;
    const clampedSpeed =
      typeof base.voiceSpeed === 'number' &&
      base.voiceSpeed >= 0.7 &&
      base.voiceSpeed <= 1.3
        ? base.voiceSpeed
        : preset.rate;

    return {
      ...base,
      bookFilter: storedBook ? storedBook : base.bookFilter,
      voiceGender: resolvedGender,
      voicePitch: clampedPitch,
      voiceSpeed: clampedSpeed,
    };
  } catch {
    return base;
  }
}

function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.stats);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw) as Partial<UserStats> & {
      totalStars?: number;
    };
    return {
      totalCoins:
        typeof parsed.totalCoins === 'number'
          ? parsed.totalCoins
          : typeof parsed.totalStars === 'number'
            ? parsed.totalStars * 10
            : DEFAULT_STATS.totalCoins,
      totalScore:
        typeof parsed.totalScore === 'number'
          ? parsed.totalScore
          : DEFAULT_STATS.totalScore,
      weeklyScore:
        typeof parsed.weeklyScore === 'number'
          ? parsed.weeklyScore
          : DEFAULT_STATS.weeklyScore,
      bestStreak:
        typeof parsed.bestStreak === 'number'
          ? parsed.bestStreak
          : DEFAULT_STATS.bestStreak,
      currentCorrectStreak:
        typeof parsed.currentCorrectStreak === 'number'
          ? parsed.currentCorrectStreak
          : DEFAULT_STATS.currentCorrectStreak,
      perfectRounds:
        typeof parsed.perfectRounds === 'number'
          ? parsed.perfectRounds
          : DEFAULT_STATS.perfectRounds,
      quizzesCompleted:
        typeof parsed.quizzesCompleted === 'number'
          ? parsed.quizzesCompleted
          : DEFAULT_STATS.quizzesCompleted,
      streakDays:
        typeof parsed.streakDays === 'number'
          ? parsed.streakDays
          : DEFAULT_STATS.streakDays,
      lastPlayedDate: parsed.lastPlayedDate ?? null,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

function loadUnlockedCategories(): string[] {
  const saved = loadJson<string[]>(
    STORAGE_KEYS.unlockedCategories,
    FREE_CATEGORY_IDS
  );
  const merged = new Set([...FREE_CATEGORY_IDS, ...saved]);
  return Array.from(merged);
}

function getStarterVerseItem(index: number, lang: LanguageCode): VerseItem {
  const safe = BIBLE_VERSES[index] || BIBLE_VERSES[0];
  const content = safe.translations[lang] || safe.translations.en;
  const bookMeta =
    BIBLE_BOOKS.find(
      (b) => b.name.toLowerCase() === safe.book.toLowerCase()
    ) || BIBLE_BOOKS[42];
  const refParts = content.reference.match(/(\d+)[:,](\d+)/);
  const chapter = refParts ? parseInt(refParts[1], 10) : 3;
  const verse = refParts ? parseInt(refParts[2], 10) : 16;

  return {
    id: `${bookMeta.id}:${chapter}:${verse}`,
    bookId: bookMeta.id,
    bookName: getLocalizedBookName(bookMeta.id, lang),
    chapter,
    verse,
    reference: content.reference,
    highlightPrefix: content.highlightPrefix,
    text: content.text,
    version: content.version,
    themes: content.themes,
    lang,
  };
}

function mapThemeToIllustration(
  theme: string,
  targetLang: LanguageCode
): {
  storyTheme: StoryTheme;
  alt: string;
} {
  const validTheme: StoryTheme =
    theme === 'noah' ||
    theme === 'david' ||
    theme === 'whale' ||
    theme === 'shepherd'
      ? theme
      : 'bible';
  return {
    storyTheme: validTheme,
    alt: getLocalizedStoryThemeAlt(validTheme, targetLang),
  };
}

const VALID_LANGS = new Set<LanguageCode>([
  'en',
  'it',
  'sw',
  'fr',
  'es',
  'pt',
  'de',
  'ar',
  'hi',
  'zh',
]);

function readStoredLang(): LanguageCode | null {
  try {
    const rawPrimary = localStorage.getItem(STORAGE_KEYS.lang);
    const rawLegacy = localStorage.getItem('selectedLanguage');
    const raw = rawPrimary ?? rawLegacy;
    if (!raw) return null;
    const parsed = raw.startsWith('"') ? (JSON.parse(raw) as string) : raw;
    return VALID_LANGS.has(parsed as LanguageCode)
      ? (parsed as LanguageCode)
      : null;
  } catch {
    return null;
  }
}

interface RawQuizApiQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  reference: string;
  storyTheme: string;
}

function buildQuizScopeKey(
  targetSettings: QuizSettings,
  categoryId?: string
): string {
  return categoryId ? `cat:${categoryId}` : `book:${targetSettings.bookFilter}`;
}

function buildQuizCacheKey(
  targetLang: LanguageCode,
  targetSettings: QuizSettings,
  categoryId?: string
): string {
  return `${targetLang}:${targetSettings.ageGroup}:${buildQuizScopeKey(targetSettings, categoryId)}`;
}

export function App(): React.ReactElement {
  const [hasSavedLang, setHasSavedLang] = useState<boolean>(
    () => readStoredLang() !== null
  );
  const [lang, setLang] = useState<LanguageCode>(() => readStoredLang() ?? 'en');
  const [screen, setScreen] = useState<AppScreen>(() =>
    readStoredLang() !== null ? 'main' : 'onboarding'
  );
  const [previousTab, setPreviousTab] = useState<MainTab>('home');
  const [activeTab, setActiveTab] = useState<MainTab>('home');

  const [currentVerse, setCurrentVerse] = useState<VerseItem>(() =>
    getStarterVerseItem(
      Math.floor(Math.random() * BIBLE_VERSES.length),
      readStoredLang() ?? 'en'
    )
  );
  const [verseHistory, setVerseHistory] = useState<VerseItem[]>([]);
  const [seenVerses, setSeenVerses] = useState<string[]>(() =>
    loadJson<string[]>(STORAGE_KEYS.seenVerses, [])
  );
  const [isVerseLoading, setIsVerseLoading] = useState(false);
  const [isAutoNextPaused, setIsAutoNextPaused] = useState(false);
  const [verseTimerResetToken, setVerseTimerResetToken] = useState(0);
  const [isBibleReaderOpen, setIsBibleReaderOpen] = useState(false);
  const [readerInitialBookId, setReaderInitialBookId] = useState(19);
  const [readerInitialChapter, setReaderInitialChapter] = useState(23);

  const [savedVerses, setSavedVerses] = useState<VerseItem[]>(() => {
    const initialLang = readStoredLang() ?? 'en';
    return loadJson<VerseItem[]>(STORAGE_KEYS.savedVerses, [
      getStarterVerseItem(0, initialLang),
      getStarterVerseItem(1, initialLang),
    ]);
  });

  const [settings, setSettings] = useState<QuizSettings>(() =>
    loadInitialSettings()
  );
  const [stats, setStats] = useState<UserStats>(() => loadStats());
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => {
    const loaded = loadJson<PlayerProfile>(STORAGE_KEYS.profile, DEFAULT_PROFILE);
    if (!loaded.isCustomized && loaded.displayName === 'Bible Pilgrim') {
      return { ...loaded, displayName: '' };
    }
    return loaded;
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFirstLaunchPrompt, setIsFirstLaunchPrompt] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [subModalCloseToken, setSubModalCloseToken] = useState(0);

  const [unlockedCategories, setUnlockedCategories] = useState<string[]>(() =>
    loadUnlockedCategories()
  );
  const [activeCategoryId, setActiveCategoryId] = useState<string>(() =>
    loadJson<string>(STORAGE_KEYS.activeCategory, 'genesis-creation')
  );
  const [useCustomBookFilter, setUseCustomBookFilter] = useState<boolean>(
    () => settings.bookFilter !== 'all'
  );

  const [unlockedTreasuryIds, setUnlockedTreasuryIds] = useState<string[]>(() =>
    loadJson<string[]>(STORAGE_KEYS.unlockedTreasury, [])
  );

  const [askedQuestions, setAskedQuestions] = useState<string[]>(() =>
    loadJson<string[]>(STORAGE_KEYS.askedQuestions, [])
  );
  const [quizHistory, setQuizHistory] = useState<QuizHistoryEntry[]>(() =>
    loadJson<QuizHistoryEntry[]>(STORAGE_KEYS.quizHistory, [])
  );
  const [quizDeck, setQuizDeck] = useState<QuizQuestion[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [isQuizRoundOver, setIsQuizRoundOver] = useState(false);

  const [pendingRewardAd, setPendingRewardAd] =
    useState<RewardAdPlacement | null>(null);
  const [roundCoinsDoubled, setRoundCoinsDoubled] = useState(false);
  const [saveStreakGrantToken, setSaveStreakGrantToken] = useState(0);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const quizRequestSeqRef = useRef(0);
  const quizAbortRef = useRef<AbortController | null>(null);
  const prefetchedQuizzesRef = useRef<Map<string, QuizQuestion[]>>(new Map());
  const prefetchInFlightRef = useRef<Set<string>>(new Set());
  const totalCoinsRef = useRef(stats.totalCoins);
  const lastSpokenTextRef = useRef<string | null>(null);
  const hasOpenChildSubModalRef = useRef(false);
  const handleBackNavigationRef = useRef<() => void>(() => {});
  const allowWindowHistoryExitRef = useRef(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (!hasSavedLang) return;
    try {
      localStorage.setItem(STORAGE_KEYS.lang, JSON.stringify(lang));
      localStorage.setItem('selectedLanguage', lang);
    } catch {
      // ignore storage errors
    }
  }, [lang, hasSavedLang]);

  useEffect(() => {
    let cancelled = false;
    void hydrateOfflineDailyVerses();
    if (typeof navigator === 'undefined' || navigator.onLine) {
      void preWarmOfflineQuizChapters(lang);
    }
    void getSavedVersesFromIDB().then((idbSaved) => {
      if (cancelled || idbSaved.length === 0) return;
      setSavedVerses((prev) => {
        if (prev.length === 0) return idbSaved;
        const existingIds = new Set(prev.map((v) => v.id));
        const missingFromLocal = idbSaved.filter((v) => !existingIds.has(v.id));
        return missingFromLocal.length > 0 ? [...prev, ...missingFromLocal] : prev;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void recordViewedVerse(currentVerse);
  }, [currentVerse]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.savedVerses, JSON.stringify(savedVerses));
    } catch {
      // ignore storage errors
    }
    void syncSavedVersesToIDB(savedVerses);
  }, [savedVerses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.seenVerses, JSON.stringify(seenVerses));
    } catch {
      // ignore storage errors
    }
  }, [seenVerses]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.askedQuestions,
        JSON.stringify(askedQuestions)
      );
    } catch {
      // ignore storage errors
    }
  }, [askedQuestions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
      localStorage.setItem('selectedBook', settings.bookFilter);
      localStorage.setItem('voiceGender', settings.voiceGender);
    } catch {
      // ignore storage errors
    }
  }, [settings]);

  useEffect(() => {
    totalCoinsRef.current = stats.totalCoins;
    try {
      localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
    } catch {
      // ignore storage errors
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(playerProfile));
    } catch {
      // ignore storage errors
    }
  }, [playerProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.unlockedCategories,
        JSON.stringify(unlockedCategories)
      );
    } catch {
      // ignore storage errors
    }
  }, [unlockedCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.activeCategory,
        JSON.stringify(activeCategoryId)
      );
    } catch {
      // ignore storage errors
    }
  }, [activeCategoryId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.unlockedTreasury,
        JSON.stringify(unlockedTreasuryIds)
      );
    } catch {
      // ignore storage errors
    }
  }, [unlockedTreasuryIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.quizHistory,
        JSON.stringify(quizHistory.slice(0, 50))
      );
    } catch {
      // ignore storage errors
    }
  }, [quizHistory]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    return () => {
      quizAbortRef.current?.abort();
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  const handleStopAndSpeak = useCallback(
    (text: string) => {
      if (isSpeaking && lastSpokenTextRef.current === text) {
        stopSpeaking();
        lastSpokenTextRef.current = null;
        setIsSpeaking(false);
      } else {
        lastSpokenTextRef.current = text;
        setIsSpeaking(true);
        speakText(
          text,
          lang,
          settings.voiceGender,
          () => {
            lastSpokenTextRef.current = null;
            setIsSpeaking(false);
          },
          {
            pitch: settings.voicePitch,
            rate: settings.voiceSpeed,
          }
        );
      }
    },
    [
      isSpeaking,
      lang,
      settings.voiceGender,
      settings.voicePitch,
      settings.voiceSpeed,
    ]
  );

  const handleStartQuizSpeech = useCallback(
    (text: string, onDone?: () => void) => {
      setIsSpeaking(true);
      speakText(
        text,
        lang,
        settings.voiceGender,
        () => {
          setIsSpeaking(false);
          onDone?.();
        },
        {
          pitch: settings.voicePitch,
          rate: settings.voiceSpeed,
        }
      );
    },
    [lang, settings.voiceGender, settings.voicePitch, settings.voiceSpeed]
  );

  const handleStopSpeech = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const mapRawQuizQuestions = useCallback(
    (items: Array<RawQuizApiQuestion>, targetLang: LanguageCode): QuizQuestion[] =>
      items.map((q) => {
        const art = mapThemeToIllustration(q.storyTheme, targetLang);
        return {
          id: q.id,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          reference: q.reference,
          storyTheme: art.storyTheme,
          illustrationAlt: art.alt,
        };
      }),
    []
  );

  const prefetchQuizRound = useCallback(
    (
      targetLang: LanguageCode,
      targetSettings: QuizSettings,
      excludeQuestions: string[],
      categoryId?: string
    ) => {
      const cacheKey = buildQuizCacheKey(targetLang, targetSettings, categoryId);
      const scopeKey = buildQuizScopeKey(targetSettings, categoryId);
      if (
        prefetchedQuizzesRef.current.has(cacheKey) ||
        prefetchInFlightRef.current.has(cacheKey)
      ) {
        return;
      }

      prefetchInFlightRef.current.add(cacheKey);
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

      void (async () => {
        try {
          if (!isOffline && !isNativeCapacitorApp()) {
            const apiController = new AbortController();
            const timer = window.setTimeout(() => apiController.abort(), 4500);
            try {
              const resp = await fetch('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  lang: targetLang,
                  ageGroup: targetSettings.ageGroup,
                  bookFilter: categoryId ? 'all' : targetSettings.bookFilter,
                  categoryId,
                  askedQuestions: excludeQuestions,
                }),
                signal: apiController.signal,
              });
              window.clearTimeout(timer);
              if (resp.ok) {
                const data = (await resp.json()) as {
                  questions?: RawQuizApiQuestion[];
                };
                if (Array.isArray(data.questions) && data.questions.length > 0) {
                  const mapped = mapRawQuizQuestions(data.questions, targetLang);
                  prefetchedQuizzesRef.current.set(cacheKey, mapped);
                  void saveQuizQuestionsToOfflineBank(
                    targetLang,
                    scopeKey,
                    mapped
                  );
                  return;
                }
              }
            } catch {
              window.clearTimeout(timer);
            }
          }

          const local = await generateClientBibleQuizRound({
            lang: targetLang,
            ageGroup: targetSettings.ageGroup,
            bookFilter: categoryId ? 'all' : targetSettings.bookFilter,
            categoryId,
            askedQuestions: excludeQuestions,
            count: 6,
          });
          if (local.length > 0) {
            const mapped = mapRawQuizQuestions(local, targetLang);
            prefetchedQuizzesRef.current.set(cacheKey, mapped);
            void saveQuizQuestionsToOfflineBank(targetLang, scopeKey, mapped);
          }
        } catch {
          // ignore background prefetch failures
        } finally {
          prefetchInFlightRef.current.delete(cacheKey);
        }
      })();
    },
    [mapRawQuizQuestions]
  );

  const fetchGeminiQuizRound = useCallback(
    async (
      targetLang: LanguageCode,
      targetSettings: QuizSettings,
      excludeQuestions: string[],
      categoryId?: string
    ) => {
      if (quizAbortRef.current) quizAbortRef.current.abort();
      const controller = new AbortController();
      quizAbortRef.current = controller;
      const reqId = ++quizRequestSeqRef.current;

      const cacheKey = buildQuizCacheKey(targetLang, targetSettings, categoryId);
      const scopeKey = buildQuizScopeKey(targetSettings, categoryId);

      // 1. Instant hit from background prefetch cache (0ms load time)
      const prefetched = prefetchedQuizzesRef.current.get(cacheKey);
      if (prefetched && prefetched.length > 0) {
        prefetchedQuizzesRef.current.delete(cacheKey);
        setQuizError(null);
        setIsQuizRoundOver(false);
        setRoundCoinsDoubled(false);
        setQuizDeck(prefetched);
        setIsQuizLoading(false);
        const nextExcluded = [
          ...excludeQuestions,
          ...prefetched.map((q) => q.question),
        ].slice(-40);
        prefetchQuizRound(targetLang, targetSettings, nextExcluded, categoryId);
        return;
      }

      setIsQuizLoading(true);
      setQuizError(null);
      setIsQuizRoundOver(false);
      setQuizDeck([]);

      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

      try {
        // 2. Instant offline or native APK path
        if (isOffline || isNativeCapacitorApp()) {
          const [bankQuestions, synthesized] = await Promise.all([
            isOffline
              ? getQuizQuestionsFromOfflineBank(
                  targetLang,
                  scopeKey,
                  excludeQuestions,
                  6
                )
              : Promise.resolve<QuizQuestion[]>([]),
            generateClientBibleQuizRound({
              lang: targetLang,
              ageGroup: targetSettings.ageGroup,
              bookFilter: categoryId ? 'all' : targetSettings.bookFilter,
              categoryId,
              askedQuestions: excludeQuestions,
              count: 6,
              signal: controller.signal,
            }),
          ]);
          if (controller.signal.aborted || reqId !== quizRequestSeqRef.current) {
            return;
          }

          const mapped =
            bankQuestions.length >= 6
              ? bankQuestions
              : synthesized.length > 0
                ? mapRawQuizQuestions(synthesized, targetLang)
                : bankQuestions;

          if (mapped.length === 0) {
            setQuizDeck([]);
            setQuizError(TRANSLATIONS[targetLang].unableLoadQuizTitle);
            return;
          }

          setRoundCoinsDoubled(false);
          setQuizDeck(mapped);
          void saveQuizQuestionsToOfflineBank(targetLang, scopeKey, mapped);
          prefetchQuizRound(
            targetLang,
            targetSettings,
            [...excludeQuestions, ...mapped.map((q) => q.question)].slice(-40),
            categoryId
          );
          return;
        }

        // 3. Fast online path: run local client quiz synthesis in parallel with a 3.2s-capped Gemini API request
        const clientFallbackPromise = generateClientBibleQuizRound({
          lang: targetLang,
          ageGroup: targetSettings.ageGroup,
          bookFilter: categoryId ? 'all' : targetSettings.bookFilter,
          categoryId,
          askedQuestions: excludeQuestions,
          count: 6,
          signal: controller.signal,
        }).catch(() => []);

        let apiMapped: QuizQuestion[] | null = null;
        let lastErrorMessage = TRANSLATIONS[targetLang].unableLoadQuizTitle;

        const apiAbort = new AbortController();
        const apiTimer = window.setTimeout(() => apiAbort.abort(), 3200);
        const onOuterAbort = () => apiAbort.abort();
        controller.signal.addEventListener('abort', onOuterAbort, { once: true });

        try {
          const resp = await fetch('/api/quiz/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lang: targetLang,
              ageGroup: targetSettings.ageGroup,
              bookFilter: categoryId ? 'all' : targetSettings.bookFilter,
              categoryId,
              askedQuestions: excludeQuestions,
            }),
            signal: apiAbort.signal,
          });
          if (resp.ok) {
            const data = (await resp.json()) as {
              questions?: RawQuizApiQuestion[];
            };
            if (Array.isArray(data.questions) && data.questions.length > 0) {
              apiMapped = mapRawQuizQuestions(data.questions, targetLang);
            }
          } else {
            lastErrorMessage = TRANSLATIONS[targetLang].unableLoadQuizTitle;
          }
        } catch (err) {
          if (controller.signal.aborted) return;
          if (err instanceof Error && err.name !== 'AbortError') {
            lastErrorMessage = TRANSLATIONS[targetLang].unableLoadQuizTitle;
          }
        } finally {
          window.clearTimeout(apiTimer);
          controller.signal.removeEventListener('abort', onOuterAbort);
        }

        if (controller.signal.aborted || reqId !== quizRequestSeqRef.current) {
          return;
        }

        if (apiMapped && apiMapped.length > 0) {
          setRoundCoinsDoubled(false);
          setQuizDeck(apiMapped);
          void saveQuizQuestionsToOfflineBank(targetLang, scopeKey, apiMapped);
          prefetchQuizRound(
            targetLang,
            targetSettings,
            [...excludeQuestions, ...apiMapped.map((q) => q.question)].slice(
              -40
            ),
            categoryId
          );
          return;
        }

        const clientFallback = await clientFallbackPromise;
        if (controller.signal.aborted || reqId !== quizRequestSeqRef.current) {
          return;
        }
        if (clientFallback.length > 0) {
          const mapped = mapRawQuizQuestions(clientFallback, targetLang);
          setRoundCoinsDoubled(false);
          setQuizDeck(mapped);
          void saveQuizQuestionsToOfflineBank(targetLang, scopeKey, mapped);
          prefetchQuizRound(
            targetLang,
            targetSettings,
            [...excludeQuestions, ...mapped.map((q) => q.question)].slice(-40),
            categoryId
          );
          return;
        }

        const offlineBankFallback = await getQuizQuestionsFromOfflineBank(
          targetLang,
          scopeKey,
          excludeQuestions,
          6
        );
        if (offlineBankFallback.length > 0 && reqId === quizRequestSeqRef.current) {
          setRoundCoinsDoubled(false);
          setQuizDeck(offlineBankFallback);
          return;
        }

        setQuizDeck([]);
        setQuizError(lastErrorMessage);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (reqId !== quizRequestSeqRef.current) return;
        setQuizDeck([]);
        setQuizError(TRANSLATIONS[targetLang].unableLoadQuizTitle);
      } finally {
        if (reqId === quizRequestSeqRef.current) setIsQuizLoading(false);
      }
    },
    [mapRawQuizQuestions, prefetchQuizRound]
  );

  const fetchRandomVerseAcrossBible = useCallback(
    async (
      targetLang: LanguageCode,
      excludeBookId: number,
      seenIds: string[]
    ): Promise<VerseItem | null> => {
      const seenSet = new Set(seenIds);
      const bookPool = BIBLE_BOOKS.filter((b) => b.id !== excludeBookId);
      const candidates = bookPool.length > 0 ? bookPool : BIBLE_BOOKS;

      for (let attempt = 0; attempt < 4; attempt++) {
        const pickedBook =
          candidates[Math.floor(Math.random() * candidates.length)];
        const pickedChapter =
          Math.floor(Math.random() * pickedBook.chapters) + 1;
        try {
          let candidateVerse: VerseItem | null = null;
          if (!isNativeCapacitorApp()) {
            try {
              const resp = await fetch(
                `/api/bible/verse?book=${pickedBook.id}&chapter=${pickedChapter}&lang=${encodeURIComponent(targetLang)}&random=1&seen=${encodeURIComponent(seenIds.slice(-80).join(','))}`
              );
              if (resp.ok) {
                const json = (await resp.json()) as VerseItem;
                if (json?.text) candidateVerse = json;
              }
            } catch {
              // ignore server error and try client fetch
            }
          }
          if (!candidateVerse) {
            candidateVerse = await fetchClientBibleVerse({
              bookId: pickedBook.id,
              chapter: pickedChapter,
              lang: targetLang,
              random: true,
              seenIds: seenIds.slice(-80),
            });
          }
          if (candidateVerse?.text) {
            if (!seenSet.has(candidateVerse.id) || attempt === 3) {
              return candidateVerse;
            }
          }
        } catch {
          // continue trying
        }
      }
      return null;
    },
    []
  );

  const handleSelectLanguage = async (chosen: LanguageCode) => {
    stopSpeaking();
    setIsSpeaking(false);
    playChime('tap', settings.soundEnabled);
    if (quizAbortRef.current) quizAbortRef.current.abort();
    quizRequestSeqRef.current += 1;
    setIsQuizLoading(false);
    setQuizDeck([]);
    setQuizError(null);

    const comingFromOnboarding = screen === 'onboarding';
    setHasSavedLang(true);
    try {
      localStorage.setItem(STORAGE_KEYS.lang, JSON.stringify(chosen));
      localStorage.setItem('selectedLanguage', chosen);
    } catch {
      // ignore storage errors
    }

    setLang(chosen);
    setVerseHistory([]);

    // Re-localize saved verses to the newly chosen language immediately,
    // and asynchronously fetch translated scripture text for non-starter verses.
    const starterById = new Map<string, VerseItem>();
    BIBLE_VERSES.forEach((_, idx) => {
      const localized = getStarterVerseItem(idx, chosen);
      starterById.set(localized.id, localized);
    });
    const toTranslateRemotely: VerseItem[] = [];
    setSavedVerses((prev) =>
      prev.map((v) => {
        const starterMatch = starterById.get(v.id);
        if (starterMatch) return starterMatch;
        if (v.lang !== chosen) {
          toTranslateRemotely.push(v);
        }
        const localizedBook = getLocalizedBookName(v.bookId, chosen);
        return {
          ...v,
          bookName: localizedBook,
          reference: `${localizedBook} ${v.chapter}:${v.verse}`,
          lang: chosen,
        };
      })
    );
    if (toTranslateRemotely.length > 0) {
      void Promise.all(
        toTranslateRemotely.slice(0, 20).map(async (v) => {
          try {
            let translated: VerseItem | null = null;
            if (!isNativeCapacitorApp() && (typeof navigator === 'undefined' || navigator.onLine)) {
              const resp = await fetch(
                `/api/bible/verse?book=${v.bookId}&chapter=${v.chapter}&verse=${v.verse}&lang=${encodeURIComponent(chosen)}`
              );
              if (resp.ok) {
                const json = (await resp.json()) as VerseItem;
                if (json?.text) translated = json;
              }
            }
            if (!translated) {
              translated = await fetchClientBibleVerse({
                bookId: v.bookId,
                chapter: v.chapter,
                verse: v.verse,
                lang: chosen,
              });
            }
            return translated;
          } catch {
            return null;
          }
        })
      ).then((results) => {
        const resolvedById = new Map<string, VerseItem>();
        for (const item of results) {
          if (item?.text) resolvedById.set(item.id, item);
        }
        if (resolvedById.size === 0) return;
        setSavedVerses((prev) =>
          prev.map((v) => resolvedById.get(v.id) ?? v)
        );
      });
    }

    if (comingFromOnboarding) {
      setScreen('main');
      setActiveTab('home');
      if (!playerProfile.isCustomized) {
        setIsFirstLaunchPrompt(true);
        setIsProfileModalOpen(true);
      }
    } else if (screen === 'main' && activeTab === 'quiz') {
      void fetchGeminiQuizRound(
        chosen,
        settings,
        askedQuestions,
        useCustomBookFilter ? undefined : activeCategoryId
      );
    }

    const loadedDaily50 = getLoadedPreCachedDailyVerses();
    const randomStarterIdx = Math.floor(Math.random() * BIBLE_VERSES.length);
    const immediateStarter =
      chosen === 'en' && loadedDaily50.length > 0
        ? loadedDaily50[Math.floor(Math.random() * loadedDaily50.length)]
        : getStarterVerseItem(randomStarterIdx, chosen);
    setCurrentVerse(immediateStarter);

    if (comingFromOnboarding || activeTab !== 'quiz') {
      prefetchQuizRound(
        chosen,
        settings,
        askedQuestions,
        useCustomBookFilter ? undefined : activeCategoryId
      );
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (chosen === 'en' && loadedDaily50.length === 0) {
        const daily50 = await loadPreCachedDailyVerses();
        if (daily50.length > 0) {
          setCurrentVerse(daily50[Math.floor(Math.random() * daily50.length)]);
        }
      }
      return;
    }

    void preWarmOfflineQuizChapters(chosen);

    setIsVerseLoading(true);
    try {
      const freshVerse = await fetchRandomVerseAcrossBible(
        chosen,
        immediateStarter.bookId,
        seenVerses
      );
      if (freshVerse?.text) {
        setCurrentVerse(freshVerse);
        setSeenVerses((prev) =>
          prev.includes(freshVerse.id)
            ? prev
            : [...prev.slice(-199), freshVerse.id]
        );
      }
    } catch {
      // keep starter verse
    } finally {
      setIsVerseLoading(false);
    }
  };

  const handleSelectTab = (tab: MainTab) => {
    stopSpeaking();
    setIsSpeaking(false);
    playChime('tap', settings.soundEnabled);
    setScreen('main');
    setActiveTab(tab);
    if (tab === 'quiz' && quizDeck.length === 0 && !isQuizLoading) {
      void fetchGeminiQuizRound(
        lang,
        settings,
        askedQuestions,
        useCustomBookFilter ? undefined : activeCategoryId
      );
    }
  };

  const handleLaunchCategoryQuiz = (category: QuizCategory) => {
    stopSpeaking();
    setIsSpeaking(false);
    playChime('tap', settings.soundEnabled);
    setActiveCategoryId(category.id);
    setUseCustomBookFilter(false);
    const nextSettings: QuizSettings = {
      ...settings,
      bookFilter: 'all',
    };
    setSettings(nextSettings);
    setRoundCoinsDoubled(false);
    setIsQuizRoundOver(false);
    setScreen('main');
    setActiveTab('quiz');
    void fetchGeminiQuizRound(lang, nextSettings, askedQuestions, category.id);
  };

  const handleUnlockCategory = (category: QuizCategory) => {
    const locCat = getLocalizedCategory(category, lang);
    if (unlockedCategories.includes(category.id)) {
      handleLaunchCategoryQuiz(locCat);
      return;
    }
    if (totalCoinsRef.current < category.unlockCost) {
      showToast(
        t.needCoinsCategoryToast
          .replace('{cost}', String(category.unlockCost))
          .replace('{title}', locCat.title)
      );
      return;
    }
    totalCoinsRef.current -= category.unlockCost;
    setStats((prev) => ({
      ...prev,
      totalCoins: Math.max(0, prev.totalCoins - category.unlockCost),
    }));
    setUnlockedCategories((prev) =>
      prev.includes(category.id) ? prev : [...prev, category.id]
    );
    playChime('complete', settings.soundEnabled);
    showToast(t.unlockedCategoryToast.replace('{title}', locCat.title));
    handleLaunchCategoryQuiz(locCat);
  };

  const handleUnlockTreasuryCard = (card: TreasuryCard) => {
    const locCard = getLocalizedTreasuryCard(card, lang);
    if (unlockedTreasuryIds.includes(card.id)) return;
    if (totalCoinsRef.current < card.unlockCost) {
      showToast(
        t.needCoinsTreasuryToast
          .replace('{cost}', String(card.unlockCost))
          .replace('{ref}', locCard.reference)
      );
      return;
    }
    totalCoinsRef.current -= card.unlockCost;
    setStats((prev) => ({
      ...prev,
      totalCoins: Math.max(0, prev.totalCoins - card.unlockCost),
    }));
    setUnlockedTreasuryIds((prev) =>
      prev.includes(card.id) ? prev : [...prev, card.id]
    );
    playChime('complete', settings.soundEnabled);
    showToast(t.unlockedTreasuryToast.replace('{ref}', locCard.reference));
  };

  const navigateToVerse = useCallback((nextVerse: VerseItem) => {
    stopSpeaking();
    setIsSpeaking(false);
    setVerseTimerResetToken((n) => n + 1);
    setCurrentVerse((prev) => {
      if (nextVerse.id === prev.id) return prev;
      setVerseHistory((hist) => [...hist, prev]);
      setSeenVerses((seen) =>
        seen.includes(nextVerse.id) ? seen : [...seen, nextVerse.id]
      );
      return nextVerse;
    });
  }, []);

  const handlePrevVerse = () => {
    stopSpeaking();
    setIsSpeaking(false);
    playChime('tap', settings.soundEnabled);
    setVerseTimerResetToken((n) => n + 1);

    if (verseHistory.length > 0) {
      const realPrevious = verseHistory[verseHistory.length - 1];
      setVerseHistory((prev) => prev.slice(0, -1));
      if (realPrevious.lang === lang) {
        setCurrentVerse(realPrevious);
        return;
      }
    }
    const daily50 = getLoadedPreCachedDailyVerses();
    if (daily50.length > 0 && lang === 'en') {
      const idx = daily50.findIndex((v) => v.id === currentVerse.id);
      const prevIdx =
        idx >= 0 ? (idx - 1 + daily50.length) % daily50.length : daily50.length - 1;
      setCurrentVerse(daily50[prevIdx]);
      return;
    }
    const fallbackIdx =
      (BIBLE_VERSES.findIndex(
        (_, i) => getStarterVerseItem(i, lang).id === currentVerse.id
      ) -
        1 +
        BIBLE_VERSES.length) %
      BIBLE_VERSES.length;
    setCurrentVerse(getStarterVerseItem(fallbackIdx, lang));
  };

  const handleRandomVerse = useCallback(
    async (silent = false) => {
      stopSpeaking();
      setIsSpeaking(false);
      if (!silent) playChime('tap', settings.soundEnabled);
      setVerseTimerResetToken((n) => n + 1);
      setIsVerseLoading(true);
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          throw new Error('Offline mode');
        }
        const liveVerse = await fetchRandomVerseAcrossBible(
          lang,
          currentVerse.bookId,
          seenVerses
        );
        if (!liveVerse?.text) throw new Error('Could not load random verse.');
        navigateToVerse(liveVerse);
      } catch {
        const [cachedViewed, daily50, allCachedChapters] = await Promise.all([
          getViewedVerses(80),
          lang === 'en' ? loadPreCachedDailyVerses() : Promise.resolve<VerseItem[]>([]),
          getAllCachedChaptersFromIDB(),
        ]);
        const starterItems = BIBLE_VERSES.map((_, idx) =>
          getStarterVerseItem(idx, lang)
        );
        const langUi = TRANSLATIONS[lang] || TRANSLATIONS.en;
        const treasuryItems: VerseItem[] = TREASURY_CARDS.map((raw) => {
          const card = getLocalizedTreasuryCard(raw, lang);
          const match = raw.reference.match(/^(.+?)\s+(\d+):(\d+)/);
          const bookMeta = match ? findBookByQuery(match[1]) : undefined;
          const bId = bookMeta?.id || 19;
          const ch = match ? parseInt(match[2], 10) : 1;
          const vs = match ? parseInt(match[3], 10) : 1;
          return {
            id: `${bId}:${ch}:${vs}`,
            bookId: bId,
            bookName: getLocalizedBookName(bId, lang),
            chapter: ch,
            verse: vs,
            reference: card.reference,
            highlightPrefix: card.verseText.split(/[,.!?،।。]/)[0] || card.verseText,
            text: card.verseText,
            version: getTranslationCodesForLang(lang)[0],
            themes: [langUi.themes.scripture, card.title],
            meditation: card.reflection,
            lang,
          };
        });
        const allowedTrans = new Set(getTranslationCodesForLang(lang));
        const cachedChapterVerses: VerseItem[] = [];
        for (const ch of allCachedChapters) {
          if (!allowedTrans.has(ch.trans)) continue;
          const localizedBook = getLocalizedBookName(ch.bookId, lang);
          for (const r of ch.rows) {
            if (!r.text || r.text.length < 18) continue;
            cachedChapterVerses.push({
              id: `${ch.bookId}:${ch.chapter}:${r.verse}`,
              bookId: ch.bookId,
              bookName: localizedBook,
              chapter: ch.chapter,
              verse: r.verse,
              reference: `${localizedBook} ${ch.chapter}:${r.verse}`,
              highlightPrefix: r.text.split(/[,.!?،।。]/)[0] || r.text,
              text: r.text,
              version: ch.trans,
              themes: [langUi.themes.scripture, localizedBook],
              lang,
            });
          }
        }

        const combinedPoolMap = new Map<string, VerseItem>();
        for (const v of [
          ...cachedViewed.filter((item) => item.lang === lang),
          ...daily50.filter((item) => item.lang === lang),
          ...savedVerses.filter((item) => item.lang === lang),
          ...treasuryItems,
          ...cachedChapterVerses,
          ...starterItems,
        ]) {
          if (!combinedPoolMap.has(v.id)) combinedPoolMap.set(v.id, v);
        }
        const sameLangCandidates = Array.from(combinedPoolMap.values()).filter(
          (item) => item.id !== currentVerse.id && item.lang === lang
        );
        const sameLangUnseen = sameLangCandidates.filter(
          (item) => !seenVerses.includes(item.id)
        );
        const langPool =
          sameLangUnseen.length > 0 ? sameLangUnseen : sameLangCandidates;
        const diffBookUnseen = langPool.filter(
          (item) =>
            item.bookId !== currentVerse.bookId && !seenVerses.includes(item.id)
        );
        const diffBook = langPool.filter(
          (item) => item.bookId !== currentVerse.bookId
        );
        const pool =
          diffBookUnseen.length > 0
            ? diffBookUnseen
            : diffBook.length > 0
              ? diffBook
              : langPool;
        const picked = pool[Math.floor(Math.random() * pool.length)];
        if (picked) navigateToVerse(picked);
      } finally {
        setIsVerseLoading(false);
      }
    },
    [
      currentVerse.bookId,
      currentVerse.id,
      fetchRandomVerseAcrossBible,
      lang,
      navigateToVerse,
      savedVerses,
      seenVerses,
      settings.soundEnabled,
    ]
  );

  const handleCopyVerse = async (verse: VerseItem) => {
    const formatted = `"${verse.text}" — ${verse.reference} (${verse.version})`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formatted);
      }
    } catch {
      // ignore clipboard errors
    }
    showToast(t.copiedToast);
  };

  const handleShareVerse = async (verse: VerseItem) => {
    const formatted = `"${verse.text}" — ${verse.reference}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: verse.reference,
          text: formatted,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formatted);
      }
    } catch {
      // ignore clipboard errors
    }
    showToast(t.sharedToast);
  };

  const handleToggleBookmark = (verse: VerseItem) => {
    setSavedVerses((prev) => {
      if (prev.some((v) => v.id === verse.id)) {
        showToast(t.removedToast);
        return prev.filter((v) => v.id !== verse.id);
      } else {
        playChime('tap', settings.soundEnabled);
        showToast(t.bookmarkedToast);
        return [verse, ...prev];
      }
    });
  };

  const handlePlaySound = useCallback(
    (kind: 'tap' | 'correct' | 'wrong' | 'complete') => {
      playChime(kind, settings.soundEnabled);
    },
    [settings.soundEnabled]
  );

  const handleQuestionPlayed = useCallback((questionText: string) => {
    setAskedQuestions((prev) =>
      prev.includes(questionText) ? prev : [...prev.slice(-99), questionText]
    );
  }, []);

  const handleSpendCoins = useCallback(
    (amount: number, reasonToast: string): boolean => {
      if (totalCoinsRef.current < amount) {
        showToast(t.notEnoughCoinsToast);
        return false;
      }
      totalCoinsRef.current -= amount;
      setStats((prev) => ({
        ...prev,
        totalCoins: Math.max(0, prev.totalCoins - amount),
      }));
      showToast(reasonToast);
      return true;
    },
    [showToast, t.notEnoughCoinsToast]
  );

  const handleAnswerOutcome = useCallback((isCorrect: boolean) => {
    setStats((prev) => {
      if (isCorrect) {
        const nextCorrectStreak = prev.currentCorrectStreak + 1;
        return {
          ...prev,
          currentCorrectStreak: nextCorrectStreak,
          bestStreak: Math.max(prev.bestStreak, nextCorrectStreak),
        };
      }
      return {
        ...prev,
        currentCorrectStreak: 0,
      };
    });
  }, []);

  const handleFinishRound = useCallback(
    (
      correctCount: number,
      coinsEarned: number,
      pointsEarned: number,
      isPerfect: boolean
    ) => {
      const today = new Date().toISOString().slice(0, 10);
      totalCoinsRef.current += coinsEarned;
      setStats((prev) => {
        const nextDayStreak =
          prev.lastPlayedDate === today
            ? prev.streakDays
            : prev.lastPlayedDate
              ? prev.streakDays + 1
              : 1;
        return {
          ...prev,
          totalCoins: prev.totalCoins + coinsEarned,
          totalScore: prev.totalScore + pointsEarned,
          weeklyScore: prev.weeklyScore + pointsEarned,
          perfectRounds: prev.perfectRounds + (isPerfect ? 1 : 0),
          quizzesCompleted: prev.quizzesCompleted + 1,
          streakDays: Math.max(1, nextDayStreak),
          lastPlayedDate: today,
        };
      });
      const entry: QuizHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        score: correctCount,
        total: quizDeck.length || 6,
        coinsEarned,
        pointsEarned,
        isPerfect,
        categoryId: useCustomBookFilter ? null : activeCategoryId,
        useCustomBookFilter,
        settingsSnapshot: { ...settings },
      };
      setQuizHistory((prev) => [entry, ...prev].slice(0, 50));
      notifyFullRoundCompletedHook(stats.quizzesCompleted + 1);
    },
    [activeCategoryId, quizDeck.length, settings, stats.quizzesCompleted, useCustomBookFilter]
  );

  const applyRewardedAdOutcome = useCallback(
    (placement: RewardAdPlacement) => {
      if (placement.kind === 'free-coins') {
        totalCoinsRef.current += placement.coins;
        setStats((prev) => ({
          ...prev,
          totalCoins: prev.totalCoins + placement.coins,
        }));
        playChime('complete', settings.soundEnabled);
        showToast(
          t.freeCoinsAddedToast.replace('{coins}', String(placement.coins))
        );
        return;
      }
      if (placement.kind === 'double-round') {
        if (roundCoinsDoubled) return;
        totalCoinsRef.current += placement.baseCoins;
        setStats((prev) => ({
          ...prev,
          totalCoins: prev.totalCoins + placement.baseCoins,
          totalScore: prev.totalScore + placement.basePoints,
          weeklyScore: prev.weeklyScore + placement.basePoints,
        }));
        setQuizHistory((prev) => {
          if (prev.length === 0) return prev;
          const [latest, ...rest] = prev;
          return [
            {
              ...latest,
              coinsEarned: latest.coinsEarned + placement.baseCoins,
              pointsEarned: latest.pointsEarned + placement.basePoints,
            },
            ...rest,
          ];
        });
        setRoundCoinsDoubled(true);
        playChime('complete', settings.soundEnabled);
        showToast(
          t.doubleBonusToast
            .replace('{coins}', String(placement.baseCoins))
            .replace('{pts}', String(placement.basePoints))
        );
        return;
      }
      if (placement.kind === 'save-streak') {
        setSaveStreakGrantToken((n) => n + 1);
        playChime('complete', settings.soundEnabled);
        showToast(t.streakSavedToastShort);
      }
    },
    [roundCoinsDoubled, settings.soundEnabled, showToast, t]
  );

  const triggerRewardedAd = useCallback(
    async (placement: RewardAdPlacement) => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        showToast(t.offlineAdUnavailableToast);
        return;
      }
      stopSpeaking();
      setIsSpeaking(false);
      const nativeOutcome = await tryShowNativeRewardedAd();
      if (nativeOutcome === 'rewarded') {
        applyRewardedAdOutcome(placement);
        return;
      }
      if (nativeOutcome === 'dismissed') {
        showToast(t.watchFullVideoToast);
        return;
      }
      setPendingRewardAd(placement);
    },
    [applyRewardedAdOutcome, showToast, t.offlineAdUnavailableToast, t.watchFullVideoToast]
  );

  const handleStartNewRound = () => {
    stopSpeaking();
    setIsSpeaking(false);
    void fetchGeminiQuizRound(
      lang,
      settings,
      askedQuestions,
      useCustomBookFilter ? undefined : activeCategoryId
    );
  };

  const handleRetryQuizHistory = (entry: QuizHistoryEntry) => {
    stopSpeaking();
    setIsSpeaking(false);
    playChime('tap', entry.settingsSnapshot.soundEnabled);
    const nextSettings: QuizSettings = { ...entry.settingsSnapshot };
    setSettings(nextSettings);
    const targetCategoryId =
      !entry.useCustomBookFilter && entry.categoryId
        ? entry.categoryId
        : activeCategoryId;
    setUseCustomBookFilter(entry.useCustomBookFilter);
    if (!entry.useCustomBookFilter && entry.categoryId) {
      setActiveCategoryId(entry.categoryId);
    }
    setQuizDeck([]);
    setQuizError(null);
    setRoundCoinsDoubled(false);
    setIsQuizRoundOver(false);
    setScreen('main');
    setActiveTab('quiz');
    void fetchGeminiQuizRound(
      lang,
      nextSettings,
      askedQuestions,
      entry.useCustomBookFilter ? undefined : targetCategoryId
    );
  };

  const handleOpenSettings = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setPreviousTab(activeTab);
    setScreen('settings');
  };

  const handleSaveSettings = (nextSettings: QuizSettings) => {
    stopSpeaking();
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(nextSettings));
      localStorage.setItem('selectedBook', nextSettings.bookFilter);
      localStorage.setItem('voiceGender', nextSettings.voiceGender);
    } catch {
      // ignore storage errors
    }

    const customBookChosen = nextSettings.bookFilter !== 'all';
    setUseCustomBookFilter(customBookChosen);
    setQuizDeck([]);
    setQuizError(null);
    setRoundCoinsDoubled(false);
    setIsQuizRoundOver(false);
    setSettings(nextSettings);
    showToast(t.settingsSavedToast);

    setIsSpeaking(true);
    speakText(
      t.settingsSavedToast,
      lang,
      nextSettings.voiceGender,
      () => setIsSpeaking(false),
      {
        pitch: nextSettings.voicePitch,
        rate: nextSettings.voiceSpeed,
      }
    );

    setScreen('main');
    const destTab: MainTab = previousTab === 'profile' ? 'profile' : 'quiz';
    setActiveTab(destTab);
    if (destTab === 'quiz') {
      void fetchGeminiQuizRound(
        lang,
        nextSettings,
        askedQuestions,
        customBookChosen ? undefined : activeCategoryId
      );
    }
  };

  const handlePreviewVoice = (draftSettings: QuizSettings) => {
    setIsSpeaking(true);
    speakText(
      t.voiceUpdatedSample,
      lang,
      draftSettings.voiceGender,
      () => setIsSpeaking(false),
      {
        pitch: draftSettings.voicePitch,
        rate: draftSettings.voiceSpeed,
      }
    );
  };

  const handleBackNavigation = useCallback(() => {
    if (isExitModalOpen) {
      setIsExitModalOpen(false);
      return;
    }
    if (isPrivacyModalOpen) {
      setIsPrivacyModalOpen(false);
      return;
    }
    if (pendingRewardAd !== null) {
      setPendingRewardAd(null);
      return;
    }
    if (isBibleReaderOpen) {
      stopSpeaking();
      setIsSpeaking(false);
      setIsBibleReaderOpen(false);
      return;
    }
    if (isProfileModalOpen) {
      setPlayerProfile((prev) => ({ ...prev, isCustomized: true }));
      setIsProfileModalOpen(false);
      setIsFirstLaunchPrompt(false);
      return;
    }
    if (isLangModalOpen) {
      setIsLangModalOpen(false);
      return;
    }
    if (hasOpenChildSubModalRef.current) {
      hasOpenChildSubModalRef.current = false;
      setSubModalCloseToken((n) => n + 1);
      return;
    }
    if (screen === 'settings') {
      stopSpeaking();
      setIsSpeaking(false);
      setScreen('main');
      return;
    }
    if (screen === 'onboarding' && hasSavedLang) {
      setScreen('main');
      return;
    }
    if (screen === 'main' && activeTab === 'quiz') {
      stopSpeaking();
      setIsSpeaking(false);
      if (quizAbortRef.current) quizAbortRef.current.abort();
      setIsQuizLoading(false);
      setQuizError(null);
      setActiveTab('categories');
      return;
    }
    if (screen === 'main' && activeTab !== 'home') {
      stopSpeaking();
      setIsSpeaking(false);
      setActiveTab('home');
      return;
    }
    stopSpeaking();
    setIsSpeaking(false);
    setIsExitModalOpen(true);
  }, [
    activeTab,
    hasSavedLang,
    isBibleReaderOpen,
    isExitModalOpen,
    isLangModalOpen,
    isPrivacyModalOpen,
    isProfileModalOpen,
    pendingRewardAd,
    screen,
  ]);

  useEffect(() => {
    handleBackNavigationRef.current = handleBackNavigation;
  }, [handleBackNavigation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.history.state || !window.history.state.bibleQuestGuard) {
      try {
        window.history.pushState({ bibleQuestGuard: true }, '');
      } catch {
        // ignore restricted history environments
      }
    }

    const handlePopState = () => {
      if (allowWindowHistoryExitRef.current) {
        allowWindowHistoryExitRef.current = false;
        return;
      }
      try {
        window.history.pushState({ bibleQuestGuard: true }, '');
      } catch {
        // ignore restricted history environments
      }
      handleBackNavigationRef.current();
    };

    const handleNativeBack = () => {
      handleBackNavigationRef.current();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('bibleQuestBackButton', handleNativeBack);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('bibleQuestBackButton', handleNativeBack);
    };
  }, []);

  const handleConfirmExitApp = useCallback(async () => {
    setIsExitModalOpen(false);
    stopSpeaking();
    setIsSpeaking(false);
    const nativeExited = await exitNativeApp();
    if (!nativeExited) {
      allowWindowHistoryExitRef.current = true;
      showToast(t.exitAppWebToast);
      try {
        window.history.back();
      } catch {
        // ignore if single-entry history
      }
    }
  }, [showToast, t.exitAppWebToast]);

  const showMeadow =
    screen === 'settings' || (screen === 'main' && activeTab === 'quiz');
  const isActiveQuizGameplay =
    screen === 'main' && activeTab === 'quiz' && !isQuizRoundOver;
  const rawActiveCategory = getQuizCategoryById(activeCategoryId);
  const activeCategoryTitle = useCustomBookFilter
    ? settings.bookFilter === 'all'
      ? t.bookNames.all
      : getLocalizedBookName(settings.bookFilter, lang)
    : rawActiveCategory
      ? getLocalizedCategory(rawActiveCategory, lang).title
      : t.quizPacksTitle;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative h-dvh w-screen overflow-hidden flex flex-col select-none"
    >
      <SkyBackdrop showMeadow={showMeadow} />
      <OfflineIndicator t={t} lang={lang} />

      {screen !== 'onboarding' && (
        <TopBar
          profile={playerProfile}
          stats={stats}
          lang={lang}
          t={t}
          onSelectLanguage={handleSelectLanguage}
          onOpenProfileModal={() => {
            setIsFirstLaunchPrompt(false);
            setIsProfileModalOpen(true);
          }}
          onOpenLeaderboard={() => handleSelectTab('leaderboard')}
          isLangModalOpen={isLangModalOpen}
          onOpenLangModal={() => setIsLangModalOpen(true)}
          onCloseLangModal={() => setIsLangModalOpen(false)}
        />
      )}

      <main className="relative z-10 flex-1 min-h-0 flex flex-col overflow-hidden safe-x">
        {screen === 'onboarding' && (
          <OnboardingScreen
            currentLang={lang}
            hasSavedSelection={hasSavedLang}
            onSelectLanguage={handleSelectLanguage}
            t={t}
          />
        )}

        {screen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onPreviewVoice={handlePreviewVoice}
            onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
            onBack={() => {
              stopSpeaking();
              setIsSpeaking(false);
              setScreen('main');
            }}
            lang={lang}
            t={t}
          />
        )}

        {screen === 'main' && activeTab === 'home' && (
          <HomeScreen
            currentVerse={currentVerse}
            isVerseLoading={isVerseLoading}
            isAutoPaused={isAutoNextPaused}
            timerResetToken={verseTimerResetToken}
            onToggleAutoPaused={() => setIsAutoNextPaused((prev) => !prev)}
            onSelectVerse={navigateToVerse}
            onPrevVerse={handlePrevVerse}
            onRandomVerse={handleRandomVerse}
            onCopyVerse={handleCopyVerse}
            onShareVerse={handleShareVerse}
            onToggleBookmark={handleToggleBookmark}
            onToggleSpeak={handleStopAndSpeak}
            onGoToCategories={() => handleSelectTab('categories')}
            onGoToLeaderboard={() => handleSelectTab('leaderboard')}
            onOpenBibleReader={(bookId, chapter) => {
              stopSpeaking();
              setIsSpeaking(false);
              setReaderInitialBookId(bookId ?? currentVerse.bookId ?? 19);
              setReaderInitialChapter(chapter ?? currentVerse.chapter ?? 23);
              setIsBibleReaderOpen(true);
            }}
            onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
            onWatchFreeCoinsAd={() =>
              void triggerRewardedAd({ kind: 'free-coins', coins: 100 })
            }
            isSpeaking={isSpeaking}
            savedIds={savedVerses.map((v) => v.id)}
            lang={lang}
            t={t}
          />
        )}

        {screen === 'main' && activeTab === 'categories' && (
          <CategorySelectScreen
            unlockedCategories={unlockedCategories}
            activeCategoryId={activeCategoryId}
            totalCoins={stats.totalCoins}
            lang={lang}
            t={t}
            onSelectAndPlay={handleLaunchCategoryQuiz}
            onUnlockCategory={handleUnlockCategory}
            onWatchFreeCoinsAd={() =>
              void triggerRewardedAd({ kind: 'free-coins', coins: 100 })
            }
          />
        )}

        {screen === 'main' && activeTab === 'quiz' && (
          <QuizScreen
            questions={quizDeck}
            isLoading={isQuizLoading}
            errorMessage={quizError}
            categoryTitle={activeCategoryTitle}
            totalCoins={stats.totalCoins}
            currentStreak={stats.currentCorrectStreak}
            lang={lang}
            t={t}
            isSpeaking={isSpeaking}
            saveStreakGrantToken={saveStreakGrantToken}
            onStartQuizSpeech={handleStartQuizSpeech}
            onStopSpeech={handleStopSpeech}
            onPlaySound={handlePlaySound}
            onQuestionPlayed={handleQuestionPlayed}
            onSpendCoins={handleSpendCoins}
            onAnswerOutcome={handleAnswerOutcome}
            onFinishRound={handleFinishRound}
            onRoundOverChange={setIsQuizRoundOver}
            onStartNewRound={handleStartNewRound}
            onOpenCategories={() => handleSelectTab('categories')}
            onOpenSettings={handleOpenSettings}
            onWatchDoubleRoundAd={(baseCoins, basePoints) => {
              if (!roundCoinsDoubled && baseCoins > 0) {
                void triggerRewardedAd({
                  kind: 'double-round',
                  baseCoins,
                  basePoints,
                });
              }
            }}
            onWatchSaveStreakAd={() =>
              void triggerRewardedAd({ kind: 'save-streak' })
            }
            coinsDoubledForRound={roundCoinsDoubled}
          />
        )}

        {screen === 'main' && activeTab === 'treasury' && (
          <ScriptureTreasuryScreen
            unlockedCardIds={unlockedTreasuryIds}
            totalCoins={stats.totalCoins}
            savedVerses={savedVerses}
            lang={lang}
            t={t}
            onUnlockCard={handleUnlockTreasuryCard}
            onListen={(text) => {
              setIsSpeaking(true);
              speakText(
                text,
                lang,
                settings.voiceGender,
                () => setIsSpeaking(false),
                {
                  pitch: settings.voicePitch,
                  rate: settings.voiceSpeed,
                }
              );
            }}
            onCopyVerse={handleCopyVerse}
            onRemoveSaved={handleToggleBookmark}
            onSelectVerse={(verse) => {
              navigateToVerse(verse);
              handleSelectTab('home');
            }}
            onBrowseVerses={() => handleSelectTab('home')}
            onShowToast={showToast}
            closeSubModalToken={subModalCloseToken}
            onSubModalOpenChange={(open) => {
              hasOpenChildSubModalRef.current = open;
            }}
          />
        )}

        {screen === 'main' && activeTab === 'leaderboard' && (
          <LeaderboardScreen
            profile={playerProfile}
            stats={stats}
            lang={lang}
            t={t}
            onEditProfile={() => {
              setIsFirstLaunchPrompt(false);
              setIsProfileModalOpen(true);
            }}
            onStartQuiz={() => handleSelectTab('categories')}
          />
        )}

        {screen === 'main' && activeTab === 'profile' && (
          <ProfileScreen
            profile={playerProfile}
            stats={stats}
            lang={lang}
            settings={settings}
            quizHistory={quizHistory}
            t={t}
            onEditProfile={() => {
              setIsFirstLaunchPrompt(false);
              setIsProfileModalOpen(true);
            }}
            onOpenLeaderboard={() => handleSelectTab('leaderboard')}
            onOpenLanguagePicker={() => {
              stopSpeaking();
              setIsSpeaking(false);
              setScreen('onboarding');
            }}
            onOpenQuizSettings={handleOpenSettings}
            onRetryQuizHistory={handleRetryQuizHistory}
            onOpenQuizPacks={() => handleSelectTab('categories')}
            onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
            onToggleSound={() =>
              setSettings((prev) => ({
                ...prev,
                soundEnabled: !prev.soundEnabled,
              }))
            }
            onShowToast={showToast}
            closeSubModalToken={subModalCloseToken}
            onSubModalOpenChange={(open) => {
              hasOpenChildSubModalRef.current = open;
            }}
          />
        )}
      </main>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-[#14274E] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap max-w-[92vw] truncate"
        >
          {toast}
        </div>
      )}

      {isProfileModalOpen && (
        <PlayerProfileModal
          isOpen={isProfileModalOpen}
          profile={playerProfile}
          isFirstLaunchPrompt={isFirstLaunchPrompt}
          lang={lang}
          t={t}
          onSave={(next) => {
            setPlayerProfile(next);
            setIsProfileModalOpen(false);
            setIsFirstLaunchPrompt(false);
            playChime('tap', settings.soundEnabled);
            showToast(t.welcomeToast.replace('{name}', next.displayName));
          }}
          onClose={() => {
            setPlayerProfile((prev) => ({ ...prev, isCustomized: true }));
            setIsProfileModalOpen(false);
            setIsFirstLaunchPrompt(false);
          }}
        />
      )}

      <BibleReaderModal
        isOpen={isBibleReaderOpen}
        initialBookId={readerInitialBookId}
        initialChapter={readerInitialChapter}
        lang={lang}
        t={t}
        savedIds={savedVerses.map((v) => v.id)}
        isSpeaking={isSpeaking}
        onClose={() => {
          stopSpeaking();
          setIsSpeaking(false);
          setIsBibleReaderOpen(false);
        }}
        onToggleSpeak={handleStopAndSpeak}
        onCopyVerse={handleCopyVerse}
        onToggleBookmark={handleToggleBookmark}
        onSelectDailyVerse={(verse) => {
          navigateToVerse(verse);
          setIsBibleReaderOpen(false);
          handleSelectTab('home');
        }}
      />

      <RewardVideoAdModal
        placement={pendingRewardAd}
        lang={lang}
        t={t}
        onUserEarnedReward={() => {
          if (pendingRewardAd) applyRewardedAdOutcome(pendingRewardAd);
          setPendingRewardAd(null);
        }}
        onCancel={() => setPendingRewardAd(null)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        lang={lang}
        t={t}
        onClose={() => setIsPrivacyModalOpen(false)}
        onShowToast={showToast}
      />

      <ExitAppModal
        isOpen={isExitModalOpen}
        lang={lang}
        t={t}
        onConfirmExit={() => void handleConfirmExitApp()}
        onCancel={() => setIsExitModalOpen(false)}
      />

      <BottomChrome
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        lang={lang}
        t={t}
        showTabs={screen !== 'onboarding'}
        showBanner={screen !== 'onboarding' && !isActiveQuizGameplay}
        onAdClick={() => showToast(t.adBannerText)}
      />
    </div>
  );
}

export default App;
