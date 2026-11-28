export type LanguageCode =
  | 'en'
  | 'it'
  | 'sw'
  | 'fr'
  | 'es'
  | 'pt'
  | 'de'
  | 'ar'
  | 'hi'
  | 'zh';

export type AgeGroup = 'kids' | 'teens' | 'adults';
export type VoiceGender = 'female' | 'male' | 'teen' | 'kids';
export type StoryTheme = 'noah' | 'david' | 'whale' | 'shepherd' | 'bible';
export type AvatarId = 'dove' | 'crown' | 'scroll' | 'shield' | 'olive';
export type MainTab =
  | 'home'
  | 'categories'
  | 'quiz'
  | 'treasury'
  | 'leaderboard'
  | 'profile';
export type AppScreen = 'onboarding' | 'main' | 'settings';
export type LeaderboardMode = 'weekly' | 'alltime';

export type RewardAdPlacement =
  | { kind: 'free-coins'; coins: number }
  | { kind: 'double-round'; baseCoins: number; basePoints: number }
  | { kind: 'save-streak' };

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  pastelBg: string;
  pastelBorder: string;
  rtl?: boolean;
}

export interface BibleBookMeta {
  id: number;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export interface VerseTranslation {
  reference: string;
  highlightPrefix: string;
  text: string;
  version: string;
  themes: string[];
}

export interface BibleVerseEntry {
  id: string;
  book: string;
  bookId?: number;
  chapter?: number;
  verseNumber?: number;
  translations: Record<LanguageCode, VerseTranslation>;
}

export interface VerseItem {
  id: string;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  reference: string;
  highlightPrefix: string;
  text: string;
  version: string;
  themes: string[];
  meditation?: string;
  lang: LanguageCode;
}

export interface QuizCategory {
  id: string;
  title: string;
  subtitle: string;
  unlockCost: number;
  bookIds: number[];
  storyTheme: StoryTheme;
  badgeLabel: string;
  hardMode?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  reference: string;
  storyTheme: StoryTheme;
  illustrationAlt: string;
}

export interface QuizSettings {
  ageGroup: AgeGroup;
  bookFilter: string;
  voiceGender: VoiceGender;
  voicePitch: number;
  voiceSpeed: number;
  soundEnabled: boolean;
}

export interface UserStats {
  totalCoins: number;
  totalScore: number;
  weeklyScore: number;
  bestStreak: number;
  currentCorrectStreak: number;
  perfectRounds: number;
  quizzesCompleted: number;
  streakDays: number;
  lastPlayedDate: string | null;
}

export interface PlayerProfile {
  displayName: string;
  avatarId: AvatarId;
  isCustomized: boolean;
}

export interface TreasuryCard {
  id: string;
  reference: string;
  title: string;
  verseText: string;
  reflection: string;
  unlockCost: number;
  storyTheme: StoryTheme;
  accentGradient: string;
}

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatarId: AvatarId;
  totalPoints: number;
  perfectRounds: number;
  isCurrentUser: boolean;
  rank: number;
}

export interface QuizHistoryEntry {
  id: string;
  timestamp: number;
  score: number;
  total: number;
  coinsEarned: number;
  pointsEarned: number;
  isPerfect: boolean;
  categoryId: string | null;
  useCustomBookFilter: boolean;
  settingsSnapshot: QuizSettings;
}
