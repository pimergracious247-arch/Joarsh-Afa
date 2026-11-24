import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppScreen,
  DynamicVerseItem,
  LanguageCode,
  PlayerProfile,
  QuizCategory,
  QuizCategoryId,
  QuizSettings,
  RewardAdPlacement,
  TabId,
  TreasuryCard,
  UserStats,
} from './types';
import { TRANSLATIONS } from './data/translations';
import { BIBLE_BOOKS } from './data/bibleBooks';
import { BIBLE_VERSES } from './data/verses';
import {
  FREE_CATEGORY_IDS,
  getQuizCategoryById,
} from './data/categories';
import { STORY_THEME_META, StoryTheme } from './data/illustrations';
import {
  playChime,
  speakText,
  stopSpeaking,
  VOICE_PRESETS,
} from './utils/speechAndAudio';
import { tryShowNativeRewardedAd } from './utils/admobBridge';
import { SkyBackdrop } from './components/SkyBackdrop';
import { TopBar } from './components/TopBar';
import { BottomChrome } from './components/BottomChrome';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { CategorySelectScreen } from './components/CategorySelectScreen';
import { ActiveQuizQuestion, QuizScreen } from './components/QuizScreen';
import { ScriptureTreasuryScreen } from './components/ScriptureTreasuryScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ProfileScreen } from './components/SavedAndProfile';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { RewardVideoAdModal } from './components/RewardVideoAdModal';
import { OfflineIndicator } from './components/PWAComponents';
import {
  getSavedVersesFromIDB,
  getViewedVerses,
  MAX_VIEWED_VERSES,
  recordViewedVerse,
  syncSavedVersesToIDB,
} from './utils/offlineVerseStore';

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
};

const DEFAULT_SETTINGS: QuizSettings = {
  ageGroup: 'adults',
  bookFilter: 'all',
  voiceGender: 'female',
  voicePitch: VOICE_PRESETS.female.pitch,
  voiceSpeed: VOICE_PRESETS.female.rate,
  soundEnabled: true,
};

const DEFAULT_STATS: UserStats = {
  totalCoins: 50,
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
  displayName: 'Bible Pilgrim',
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
    const parsed = JSON.parse(raw) as Partial<UserStats> & { totalStars?: number };
    const migratedCoins =
      typeof parsed.totalCoins === 'number'
        ? parsed.totalCoins
        : typeof parsed.totalStars === 'number'
        ? parsed.totalStars * 10
        : DEFAULT_STATS.totalCoins;
    return {
      totalCoins: migratedCoins,
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

function loadUnlockedCategories(): QuizCategoryId[] {
  const saved = loadJson<QuizCategoryId[]>(
    STORAGE_KEYS.unlockedCategories,
    FREE_CATEGORY_IDS
  );
  const merged = new Set<QuizCategoryId>([...FREE_CATEGORY_IDS, ...saved]);
  return Array.from(merged);
}

function getStarterVerseItem(index: number, lang: LanguageCode): DynamicVerseItem {
  const safe = BIBLE_VERSES[index] || BIBLE_VERSES[0];
  const content = safe.translations[lang];
  const bookMeta =
    BIBLE_BOOKS.find((b) => b.name.toLowerCase() === safe.book.toLowerCase()) ||
    BIBLE_BOOKS[42];
  const refParts = content.reference.match(/(\d+)[:,](\d+)/);
  const chapter = refParts ? parseInt(refParts[1], 10) : 3;
  const verse = refParts ? parseInt(refParts[2], 10) : 16;

  return {
    id: `${bookMeta.id}:${chapter}:${verse}`,
    bookId: bookMeta.id,
    bookName: bookMeta.name,
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

function mapThemeToIllustration(theme: string): {
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
    alt: STORY_THEME_META[validTheme].alt,
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

function loadLang(): LanguageCode {
  const saved = loadJson<string>(STORAGE_KEYS.lang, 'en');
  return VALID_LANGS.has(saved as LanguageCode) ? (saved as LanguageCode) : 'en';
}

export default function App() {
  const [lang, setLang] = useState<LanguageCode>(() => loadLang());
  const [screen, setScreen] = useState<AppScreen>('onboarding');
  const [previousTab, setPreviousTab] = useState<TabId>('home');
  const [activeTab, setActiveTab] = useState<TabId>('home');

  const [currentVerse, setCurrentVerse] = useState<DynamicVerseItem>(() =>
    getStarterVerseItem(0, loadLang())
  );
  const [verseHistory, setVerseHistory] = useState<DynamicVerseItem[]>([]);
  const [seenVerses, setSeenVerses] = useState<string[]>(() =>
    loadJson<string[]>(STORAGE_KEYS.seenVerses, ['43:3:16'])
  );
  const [isVerseLoading, setIsVerseLoading] = useState(false);
  const [isAutoNextPaused, setIsAutoNextPaused] = useState(false);
  const [verseTimerResetToken, setVerseTimerResetToken] = useState(0);

  const [savedVerses, setSavedVerses] = useState<DynamicVerseItem[]>(() =>
    loadJson<DynamicVerseItem[]>(STORAGE_KEYS.savedVerses, [
      getStarterVerseItem(0, loadLang()),
      getStarterVerseItem(1, loadLang()),
    ])
  );

  const [settings, setSettings] = useState<QuizSettings>(() =>
    loadInitialSettings()
  );
  const [stats, setStats] = useState<UserStats>(() => loadStats());
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() =>
    loadJson<PlayerProfile>(STORAGE_KEYS.profile, DEFAULT_PROFILE)
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFirstLaunchPrompt, setIsFirstLaunchPrompt] = useState(false);

  const [unlockedCategories, setUnlockedCategories] = useState<
    QuizCategoryId[]
  >(() => loadUnlockedCategories());
  const [activeCategoryId, setActiveCategoryId] = useState<QuizCategoryId>(() =>
    loadJson<QuizCategoryId>(STORAGE_KEYS.activeCategory, 'genesis-creation')
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
  const [quizDeck, setQuizDeck] = useState<ActiveQuizQuestion[]>([]);
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
  const totalCoinsRef = useRef(stats.totalCoins);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.lang, JSON.stringify(lang));
    } catch {
      // ignore
    }
  }, [lang]);

  useEffect(() => {
    let cancelled = false;
    getSavedVersesFromIDB().then((idbSaved) => {
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
      localStorage.setItem(
        STORAGE_KEYS.savedVerses,
        JSON.stringify(savedVerses)
      );
    } catch {
      // ignore
    }
    void syncSavedVersesToIDB(savedVerses);
  }, [savedVerses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.seenVerses, JSON.stringify(seenVerses));
    } catch {
      // ignore
    }
  }, [seenVerses]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.askedQuestions,
        JSON.stringify(askedQuestions)
      );
    } catch {
      // ignore
    }
  }, [askedQuestions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
      localStorage.setItem('selectedBook', settings.bookFilter);
      localStorage.setItem('voiceGender', settings.voiceGender);
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    totalCoinsRef.current = stats.totalCoins;
    try {
      localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(playerProfile));
    } catch {
      // ignore
    }
  }, [playerProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.unlockedCategories,
        JSON.stringify(unlockedCategories)
      );
    } catch {
      // ignore
    }
  }, [unlockedCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.activeCategory,
        JSON.stringify(activeCategoryId)
      );
    } catch {
      // ignore
    }
  }, [activeCategoryId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.unlockedTreasury,
        JSON.stringify(unlockedTreasuryIds)
      );
    } catch {
      // ignore
    }
  }, [unlockedTreasuryIds]);

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
      if (isSpeaking) {
        stopSpeaking();
        setIsSpeaking(false);
      } else {
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
      void speakText(
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

  // Call Live Quiz Engine on the server with exponential backoff on transient failures
  const fetchGeminiQuizRound = useCallback(
    async (
      targetLang: LanguageCode,
      targetSettings: QuizSettings,
      excludeQuestions: string[],
      categoryId?: QuizCategoryId
    ) => {
      if (quizAbortRef.current) {
        quizAbortRef.current.abort();
      }
      const controller = new AbortController();
      quizAbortRef.current = controller;
      const reqId = ++quizRequestSeqRef.current;

      setIsQuizLoading(true);
      setQuizError(null);
      setIsQuizRoundOver(false);
      setQuizDeck([]);

      const MAX_RETRIES = 3;
      const BASE_DELAY_MS = 800;

      const waitWithAbort = (ms: number, signal: AbortSignal) =>
        new Promise<void>((resolve, reject) => {
          if (signal.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
            return;
          }
          const onAbort = () => {
            window.clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
          };
          const timer = window.setTimeout(() => {
            signal.removeEventListener('abort', onAbort);
            resolve();
          }, ms);
          signal.addEventListener('abort', onAbort, { once: true });
        });

      const isNonTransientError = (status: number, message: string): boolean => {
        if (
          /GEMINI_API_KEY is not set|API_KEY_INVALID|PERMISSION_DENIED/i.test(
            message
          )
        ) {
          return true;
        }
        return (
          status === 400 ||
          status === 401 ||
          status === 403 ||
          status === 404 ||
          status === 422
        );
      };

      try {
        let lastErrorMessage = 'Unable to reach quiz service.';

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          if (controller.signal.aborted || reqId !== quizRequestSeqRef.current) {
            return;
          }

          let retryAfterMs: number | null = null;
          let shouldRetry = false;

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
              signal: controller.signal,
            });

            const retryAfterHeader = resp.headers.get('Retry-After');
            if (retryAfterHeader && /^\d+$/.test(retryAfterHeader.trim())) {
              retryAfterMs = Math.min(
                10000,
                parseInt(retryAfterHeader.trim(), 10) * 1000
              );
            }

            const rawBody = await resp.text();
            let data: {
              questions?: Array<{
                id: string;
                question: string;
                options: [string, string, string, string];
                correctIndex: 0 | 1 | 2 | 3;
                reference: string;
                storyTheme: string;
              }>;
              error?: string;
            } = {};
            try {
              data = rawBody ? JSON.parse(rawBody) : {};
            } catch {
              const parseMessage = resp.ok
                ? 'Invalid response format from quiz generator.'
                : `Quiz request failed (${resp.status}).`;
              const err = new Error(parseMessage) as Error & {
                status?: number;
                retryable?: boolean;
              };
              err.status = resp.status;
              err.retryable = !isNonTransientError(resp.status, parseMessage);
              throw err;
            }

            if (reqId !== quizRequestSeqRef.current) return;

            if (
              !resp.ok ||
              !Array.isArray(data.questions) ||
              data.questions.length === 0
            ) {
              const apiMessage =
                data.error || 'Could not generate quiz questions.';
              const err = new Error(apiMessage) as Error & {
                status?: number;
                retryable?: boolean;
              };
              err.status = resp.status;
              err.retryable = !isNonTransientError(resp.status, apiMessage);
              throw err;
            }

            const mapped: ActiveQuizQuestion[] = data.questions.map((q) => {
              const art = mapThemeToIllustration(q.storyTheme);
              return {
                id: q.id,
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
                reference: q.reference,
                storyTheme: art.storyTheme,
                illustrationAlt: art.alt,
              };
            });
            setRoundCoinsDoubled(false);
            setQuizDeck(mapped);
            return;
          } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
              return;
            }
            if (reqId !== quizRequestSeqRef.current) return;

            const typedErr = err as Error & { retryable?: boolean };
            lastErrorMessage =
              typedErr instanceof Error
                ? typedErr.message
                : 'Unable to reach quiz service.';
            shouldRetry = typedErr.retryable !== false;
          }

          if (!shouldRetry || attempt === MAX_RETRIES) {
            setQuizDeck([]);
            setQuizError(lastErrorMessage);
            return;
          }

          const exponentialMs = BASE_DELAY_MS * Math.pow(2, attempt);
          const jitterMs = Math.floor(Math.random() * 250);
          const delayMs = retryAfterMs ?? exponentialMs + jitterMs;
          await waitWithAbort(delayMs, controller.signal);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (reqId !== quizRequestSeqRef.current) return;
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to reach quiz service.';
        setQuizDeck([]);
        setQuizError(message);
      } finally {
        if (reqId === quizRequestSeqRef.current) {
          setIsQuizLoading(false);
        }
      }
    },
    []
  );

  const handleSelectLanguage = async (chosen: LanguageCode) => {
    stopSpeaking();
    setIsSpeaking(false);
    playChime('tap', settings.soundEnabled);
    if (quizAbortRef.current) {
      quizAbortRef.current.abort();
    }
    quizRequestSeqRef.current += 1;
    setIsQuizLoading(false);
    setQuizDeck([]);
    setQuizError(null);
    setLang(chosen);
    setScreen('main');
    setActiveTab('home');

    if (!playerProfile.isCustomized) {
      setIsFirstLaunchPrompt(true);
      setIsProfileModalOpen(true);
    }

    const starterIdx = BIBLE_VERSES.findIndex((v) => {
      const item = getStarterVerseItem(
        BIBLE_VERSES.indexOf(v),
        lang
      );
      return item.id === currentVerse.id;
    });
    if (starterIdx >= 0) {
      setCurrentVerse(getStarterVerseItem(starterIdx, chosen));
    } else {
      setIsVerseLoading(true);
      try {
        const resp = await fetch(
          `/api/bible/verse?book=${currentVerse.bookId}&chapter=${currentVerse.chapter}&verse=${currentVerse.verse}&lang=${chosen}`
        );
        if (resp.ok) {
          const updated = (await resp.json()) as DynamicVerseItem;
          if (updated.text) setCurrentVerse(updated);
        }
      } catch {
        // keep current verse
      } finally {
        setIsVerseLoading(false);
      }
    }
  };

  const handleSelectTab = (tab: TabId) => {
    stopSpeaking();
    setIsSpeaking(false);
    playChime('tap', settings.soundEnabled);
    setScreen('main');
    setActiveTab(tab);

    if (tab === 'quiz' && quizDeck.length === 0 && !isQuizLoading) {
      fetchGeminiQuizRound(
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
    fetchGeminiQuizRound(lang, nextSettings, askedQuestions, category.id);
  };

  const handleUnlockCategory = (category: QuizCategory) => {
    if (unlockedCategories.includes(category.id)) {
      handleLaunchCategoryQuiz(category);
      return;
    }
    if (totalCoinsRef.current < category.unlockCost) {
      showToast(
        `Need ${category.unlockCost} coins to unlock ${category.title}. Watch a video for +100 free coins!`
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
    showToast(`Unlocked ${category.title}!`);
    handleLaunchCategoryQuiz(category);
  };

  const handleUnlockTreasuryCard = (card: TreasuryCard) => {
    if (unlockedTreasuryIds.includes(card.id)) return;
    if (totalCoinsRef.current < card.unlockCost) {
      showToast(
        `Need ${card.unlockCost} coins to unlock ${card.reference}.`
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
    showToast(`${card.reference} unlocked in your Scripture Treasury!`);
  };

  const navigateToVerse = useCallback((nextVerse: DynamicVerseItem) => {
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
      setCurrentVerse(realPrevious);
    } else {
      const fallbackIdx =
        (BIBLE_VERSES.findIndex((_, i) =>
          getStarterVerseItem(i, lang).id === currentVerse.id
        ) -
          1 +
          BIBLE_VERSES.length) %
        BIBLE_VERSES.length;
      setCurrentVerse(getStarterVerseItem(fallbackIdx, lang));
    }
  };

  const handleRandomVerse = useCallback(
    async (silent = false) => {
      stopSpeaking();
      setIsSpeaking(false);
      if (!silent) {
        playChime('tap', settings.soundEnabled);
      }
      setVerseTimerResetToken((n) => n + 1);
      setIsVerseLoading(true);

      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          throw new Error('Offline mode');
        }
        const randomBook =
          BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
        const randomChapter =
          Math.floor(Math.random() * randomBook.chapters) + 1;

        const resp = await fetch(
          `/api/bible/verse?book=${randomBook.id}&chapter=${randomChapter}&lang=${encodeURIComponent(
            lang
          )}&random=1&seen=${encodeURIComponent(seenVerses.slice(-50).join(','))}`
        );
        const data = (await resp.json()) as DynamicVerseItem & { error?: string };
        if (!resp.ok || !data.text) {
          throw new Error(data.error || 'Could not load random verse.');
        }

        if (seenVerses.includes(data.id)) {
          const retryBook =
            BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
          const retryChapter =
            Math.floor(Math.random() * retryBook.chapters) + 1;
          const retryResp = await fetch(
            `/api/bible/verse?book=${retryBook.id}&chapter=${retryChapter}&lang=${encodeURIComponent(
              lang
            )}&random=1&seen=${encodeURIComponent(seenVerses.slice(-50).join(','))}`
          );
          const retryData = (await retryResp.json()) as DynamicVerseItem;
          if (retryResp.ok && retryData.text) {
            navigateToVerse(retryData);
            return;
          }
        }

        navigateToVerse(data);
      } catch {
        const cachedViewed = await getViewedVerses(MAX_VIEWED_VERSES);
        const starterItems = BIBLE_VERSES.map((_, idx) =>
          getStarterVerseItem(idx, lang)
        );
        const combinedPoolMap = new Map<string, DynamicVerseItem>();
        for (const v of [...cachedViewed, ...savedVerses, ...starterItems]) {
          if (!combinedPoolMap.has(v.id)) {
            combinedPoolMap.set(v.id, v);
          }
        }
        const candidates = Array.from(combinedPoolMap.values()).filter(
          (item) => item.id !== currentVerse.id
        );
        const sameLang = candidates.filter((item) => item.lang === lang);
        const pool = sameLang.length > 0 ? sameLang : candidates;
        const picked = pool[Math.floor(Math.random() * pool.length)];
        if (picked) {
          navigateToVerse(picked);
        }
      } finally {
        setIsVerseLoading(false);
      }
    },
    [
      currentVerse.id,
      lang,
      navigateToVerse,
      savedVerses,
      seenVerses,
      settings.soundEnabled,
    ]
  );

  const handleCopyVerse = async (verse: DynamicVerseItem) => {
    const formatted = `"${verse.text}" — ${verse.reference} (${verse.version})`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formatted);
      }
    } catch {
      // ignore
    }
    showToast(t.copiedToast);
  };

  const handleShareVerse = async (verse: DynamicVerseItem) => {
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
      // ignore
    }
    showToast(t.sharedToast);
  };

  const handleToggleBookmark = (verse: DynamicVerseItem) => {
    setSavedVerses((prev) => {
      const exists = prev.some((v) => v.id === verse.id);
      if (exists) {
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
    (kind: 'correct' | 'wrong' | 'complete' | 'tap') => {
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
      _correctCount: number,
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
    },
    []
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
        showToast(`+${placement.coins} Free Coins added!`);
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
        setRoundCoinsDoubled(true);
        playChime('complete', settings.soundEnabled);
        showToast(
          `2x Bonus! +${placement.baseCoins} coins & +${placement.basePoints} pts`
        );
        return;
      }

      if (placement.kind === 'save-streak') {
        setSaveStreakGrantToken((n) => n + 1);
        playChime('complete', settings.soundEnabled);
        showToast('Streak saved! Continue answering.');
      }
    },
    [roundCoinsDoubled, settings.soundEnabled, showToast]
  );

  const triggerRewardedAd = useCallback(
    async (placement: RewardAdPlacement) => {
      stopSpeaking();
      setIsSpeaking(false);
      const nativeOutcome = await tryShowNativeRewardedAd();
      if (nativeOutcome === 'rewarded') {
        applyRewardedAdOutcome(placement);
        return;
      }
      if (nativeOutcome === 'dismissed') {
        showToast('Watch the full video to claim your reward.');
        return;
      }
      setPendingRewardAd(placement);
    },
    [applyRewardedAdOutcome, showToast]
  );

  const handleStartNewRound = () => {
    stopSpeaking();
    setIsSpeaking(false);
    fetchGeminiQuizRound(
      lang,
      settings,
      askedQuestions,
      useCustomBookFilter ? undefined : activeCategoryId
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
      // ignore
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
    const destTab = previousTab === 'profile' ? 'profile' : 'quiz';
    setActiveTab(destTab);
    if (destTab === 'quiz') {
      fetchGeminiQuizRound(
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

  const showMeadow =
    screen === 'settings' || (screen === 'main' && activeTab === 'quiz');

  const isActiveQuizGameplay =
    screen === 'main' && activeTab === 'quiz' && !isQuizRoundOver;

  const activeCategoryTitle = useCustomBookFilter
    ? settings.bookFilter === 'all'
      ? t.bookNames.all
      : settings.bookFilter
    : getQuizCategoryById(activeCategoryId)?.title ?? 'Bible Quiz';

  return (
    <div className="relative h-dvh w-screen overflow-hidden flex flex-col select-none">
      <SkyBackdrop showMeadow={showMeadow} />
      <OfflineIndicator />

      {screen !== 'onboarding' && (
        <TopBar
          profile={playerProfile}
          stats={stats}
          onOpenProfileModal={() => {
            setIsFirstLaunchPrompt(false);
            setIsProfileModalOpen(true);
          }}
          onOpenLeaderboard={() => handleSelectTab('leaderboard')}
        />
      )}

      <main className="relative z-10 flex-1 min-h-0 flex flex-col overflow-hidden">
        {screen === 'onboarding' && (
          <OnboardingScreen
            currentLang={lang}
            onSelectLanguage={handleSelectLanguage}
            t={t}
          />
        )}

        {screen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onPreviewVoice={handlePreviewVoice}
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
          />
        )}

        {screen === 'main' && activeTab === 'leaderboard' && (
          <LeaderboardScreen
            profile={playerProfile}
            stats={stats}
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
            onToggleSound={() =>
              setSettings((prev) => ({
                ...prev,
                soundEnabled: !prev.soundEnabled,
              }))
            }
            onShowToast={showToast}
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
          onSave={(next) => {
            setPlayerProfile(next);
            setIsProfileModalOpen(false);
            setIsFirstLaunchPrompt(false);
            playChime('tap', settings.soundEnabled);
            showToast(`Welcome, ${next.displayName}!`);
          }}
          onClose={() => {
            setPlayerProfile((prev) => ({ ...prev, isCustomized: true }));
            setIsProfileModalOpen(false);
            setIsFirstLaunchPrompt(false);
          }}
        />
      )}

      <RewardVideoAdModal
        placement={pendingRewardAd}
        t={t}
        onUserEarnedReward={() => {
          if (pendingRewardAd) {
            applyRewardedAdOutcome(pendingRewardAd);
          }
          setPendingRewardAd(null);
        }}
        onCancel={() => setPendingRewardAd(null)}
      />

      <BottomChrome
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        t={t}
        showTabs={screen !== 'onboarding'}
        showBanner={screen !== 'onboarding' && !isActiveQuizGameplay}
        onAdClick={() => showToast(t.adBannerText)}
      />
    </div>
  );
}
