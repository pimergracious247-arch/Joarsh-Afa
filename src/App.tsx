import { useCallback, useEffect, useState } from 'react';
import {
  AppScreen,
  BibleVerse,
  LanguageCode,
  QuizQuestion,
  QuizSettings,
  TabId,
  UserStats,
} from './types';
import { TRANSLATIONS } from './data/translations';
import { BIBLE_VERSES } from './data/verses';
import { selectQuizQuestions } from './data/quizQuestions';
import { playChime, speakText, stopSpeaking } from './utils/speechAndAudio';
import { SkyBackdrop } from './components/SkyBackdrop';
import { BottomChrome } from './components/BottomChrome';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ProfileScreen, SavedScreen } from './components/SavedAndProfile';

const STORAGE_KEYS = {
  lang: 'sunbeam_lang_v1',
  saved: 'sunbeam_saved_v1',
  settings: 'sunbeam_settings_v1',
  stats: 'sunbeam_stats_v1',
};

const DEFAULT_SETTINGS: QuizSettings = {
  ageGroup: 'adults',
  bookFilter: 'all',
  voiceGender: 'female',
  soundEnabled: true,
};

const DEFAULT_STATS: UserStats = {
  totalStars: 12,
  quizzesCompleted: 2,
  streakDays: 3,
  lastPlayedDate: null,
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

export default function App() {
  const [lang, setLang] = useState<LanguageCode>(() =>
    loadJson<LanguageCode>(STORAGE_KEYS.lang, 'en')
  );
  const [screen, setScreen] = useState<AppScreen>('onboarding');
  const [previousTab, setPreviousTab] = useState<TabId>('home');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [verseIndex, setVerseIndex] = useState<number>(0);
  const [verseHistory, setVerseHistory] = useState<number[]>([]);
  const [seenVerseIndices, setSeenVerseIndices] = useState<number[]>([0]);
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    loadJson<string[]>(STORAGE_KEYS.saved, ['john-3-16', 'psalm-23-1'])
  );
  const [settings, setSettings] = useState<QuizSettings>(() =>
    loadJson<QuizSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  );
  const [stats, setStats] = useState<UserStats>(() =>
    loadJson<UserStats>(STORAGE_KEYS.stats, DEFAULT_STATS)
  );
  const [initialQuiz] = useState(() =>
    selectQuizQuestions(settings.ageGroup, settings.bookFilter, 6, [])
  );
  const [quizDeck, setQuizDeck] = useState<QuizQuestion[]>(initialQuiz.questions);
  const [usedQuizIds, setUsedQuizIds] = useState<string[]>(() =>
    initialQuiz.questions.map((q) => q.id)
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.lang, JSON.stringify(lang));
    } catch {
      // ignore storage quota errors
    }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

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
        speakText(text, lang, settings.voiceGender, () => {
          setIsSpeaking(false);
        });
      }
    },
    [isSpeaking, lang, settings.voiceGender]
  );

  const handleSelectLanguage = (chosen: LanguageCode) => {
    stopSpeaking();
    setIsSpeaking(false);
    playChime('tap', settings.soundEnabled);
    setLang(chosen);
    setScreen('main');
    setActiveTab('home');
  };

  const handleSelectTab = (tab: TabId) => {
    stopSpeaking();
    setIsSpeaking(false);
    playChime('tap', settings.soundEnabled);
    setScreen('main');
    setActiveTab(tab);
  };

  const navigateToVerse = (nextIndex: number) => {
    stopSpeaking();
    setIsSpeaking(false);
    if (nextIndex === verseIndex) return;
    setVerseHistory((prev) => [...prev, verseIndex]);
    setSeenVerseIndices((prev) =>
      prev.includes(nextIndex) ? prev : [...prev, nextIndex]
    );
    setVerseIndex(nextIndex);
  };

  const handlePrevVerse = () => {
    stopSpeaking();
    setIsSpeaking(false);
    playChime('tap', settings.soundEnabled);
    if (verseHistory.length > 0) {
      const realPrevious = verseHistory[verseHistory.length - 1];
      setVerseHistory((prev) => prev.slice(0, -1));
      setVerseIndex(realPrevious);
    } else {
      setVerseIndex(
        (prev) => (prev - 1 + BIBLE_VERSES.length) % BIBLE_VERSES.length
      );
    }
  };

  const handleRandomVerse = () => {
    playChime('tap', settings.soundEnabled);
    if (BIBLE_VERSES.length <= 1) return;

    const allIndices = BIBLE_VERSES.map((_, idx) => idx);
    let candidates = allIndices.filter(
      (idx) => !seenVerseIndices.includes(idx) && idx !== verseIndex
    );

    let resetCycle = false;
    if (candidates.length === 0) {
      resetCycle = true;
      candidates = allIndices.filter((idx) => idx !== verseIndex);
    }

    const next = candidates[Math.floor(Math.random() * candidates.length)];
    stopSpeaking();
    setIsSpeaking(false);
    setVerseHistory((prev) => [...prev, verseIndex]);
    setSeenVerseIndices((prev) =>
      resetCycle ? [verseIndex, next] : [...prev, next]
    );
    setVerseIndex(next);
  };

  const handleCopyVerse = async (verse: BibleVerse) => {
    const content = verse.translations[lang];
    const formatted = `"${content.text}" — ${content.reference} (${content.version})`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formatted);
      }
      showToast(t.copiedToast);
    } catch {
      showToast(t.copiedToast);
    }
  };

  const handleShareVerse = async (verse: BibleVerse) => {
    const content = verse.translations[lang];
    const formatted = `"${content.text}" — ${content.reference}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.reference,
          text: formatted,
        });
        return;
      } catch {
        // User cancelled or share unavailable — fallback to clipboard
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

  const handleToggleBookmark = (verseId: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(verseId);
      if (exists) {
        showToast(t.removedToast);
        return prev.filter((id) => id !== verseId);
      } else {
        playChime('tap', settings.soundEnabled);
        showToast(t.bookmarkedToast);
        return [verseId, ...prev];
      }
    });
  };

  const handlePlaySound = useCallback(
    (kind: 'correct' | 'wrong' | 'complete' | 'tap') => {
      playChime(kind, settings.soundEnabled);
    },
    [settings.soundEnabled]
  );

  const handleFinishRound = useCallback((correctCount: number) => {
    const today = new Date().toISOString().slice(0, 10);
    setStats((prev) => {
      const nextStreak =
        prev.lastPlayedDate === today ? prev.streakDays : prev.streakDays + 1;
      return {
        totalStars: prev.totalStars + correctCount,
        quizzesCompleted: prev.quizzesCompleted + 1,
        streakDays: Math.max(1, nextStreak),
        lastPlayedDate: today,
      };
    });
  }, []);

  const drawNextQuizDeck = (nextSettings: QuizSettings) => {
    const { questions, resetUsed } = selectQuizQuestions(
      nextSettings.ageGroup,
      nextSettings.bookFilter,
      6,
      usedQuizIds
    );
    const drawnIds = questions.map((q) => q.id);
    setUsedQuizIds((prev) => (resetUsed ? drawnIds : [...prev, ...drawnIds]));
    setQuizDeck(questions);
  };

  const handleStartNewRound = () => {
    stopSpeaking();
    setIsSpeaking(false);
    drawNextQuizDeck(settings);
  };

  const handleOpenSettings = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setPreviousTab(activeTab);
    setScreen('settings');
  };

  const handleSaveSettings = (nextSettings: QuizSettings) => {
    stopSpeaking();
    setIsSpeaking(false);
    setSettings(nextSettings);
    drawNextQuizDeck(nextSettings);
    showToast(t.settingsSavedToast);
    setScreen('main');
    setActiveTab(previousTab === 'profile' ? 'profile' : 'quiz');
  };

  const savedVersesList = savedIds
    .map((id) => BIBLE_VERSES.find((v) => v.id === id))
    .filter((v): v is BibleVerse => Boolean(v));

  const showMeadow =
    screen === 'settings' || (screen === 'main' && activeTab === 'quiz');

  return (
    <div className="relative h-dvh w-screen overflow-hidden flex flex-col select-none">
      <SkyBackdrop showMeadow={showMeadow} />

      {/* Main Content Area (Zero Scroll) */}
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
            onBack={() => setScreen('main')}
            lang={lang}
            t={t}
          />
        )}

        {screen === 'main' && activeTab === 'home' && (
          <HomeScreen
            verses={BIBLE_VERSES}
            currentIndex={verseIndex}
            onSelectIndex={navigateToVerse}
            onPrevVerse={handlePrevVerse}
            onRandomVerse={handleRandomVerse}
            onCopyVerse={handleCopyVerse}
            onShareVerse={handleShareVerse}
            onToggleBookmark={handleToggleBookmark}
            onToggleSpeak={handleStopAndSpeak}
            onGoToQuiz={() => handleSelectTab('quiz')}
            isSpeaking={isSpeaking}
            savedIds={savedIds}
            lang={lang}
            t={t}
          />
        )}

        {screen === 'main' && activeTab === 'quiz' && (
          <QuizScreen
            questions={quizDeck}
            lang={lang}
            t={t}
            isSpeaking={isSpeaking}
            onSpeakQuestion={handleStopAndSpeak}
            onPlaySound={handlePlaySound}
            onFinishRound={handleFinishRound}
            onStartNewRound={handleStartNewRound}
            onOpenSettings={handleOpenSettings}
          />
        )}

        {screen === 'main' && activeTab === 'saved' && (
          <SavedScreen
            savedVerses={savedVersesList}
            lang={lang}
            t={t}
            onListen={(text) => {
              setIsSpeaking(true);
              speakText(text, lang, settings.voiceGender, () =>
                setIsSpeaking(false)
              );
            }}
            onCopy={handleCopyVerse}
            onRemove={handleToggleBookmark}
            onBrowseVerses={() => handleSelectTab('home')}
          />
        )}

        {screen === 'main' && activeTab === 'profile' && (
          <ProfileScreen
            stats={stats}
            lang={lang}
            settings={settings}
            t={t}
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
          />
        )}
      </main>

      {/* Non-blocking Toast Confirmation */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#14274E] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap"
        >
          {toast}
        </div>
      )}

      {/* Persistent 4-Tab Bottom Navigation + Slim Banner Ad Strip */}
      <BottomChrome
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        t={t}
        savedCount={savedIds.length}
        showTabs={screen !== 'onboarding'}
        onAdClick={() => showToast(t.adBannerText)}
      />
    </div>
  );
}
