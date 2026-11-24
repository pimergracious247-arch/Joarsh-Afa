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

export type BibleBookFilter = 'all' | string;

export type VoiceGender = 'female' | 'male' | 'teen' | 'kids';

export type TabId =
  | 'home'
  | 'categories'
  | 'quiz'
  | 'treasury'
  | 'leaderboard'
  | 'profile';

export type AppScreen = 'onboarding' | 'main' | 'settings';

export type BibleAvatarId = 'dove' | 'crown' | 'scroll' | 'shield' | 'olive';

export type QuizCategoryId =
  | 'genesis-creation'
  | 'life-of-jesus'
  | 'heroes-of-faith'
  | 'miracles-parables'
  | 'women-of-bible'
  | 'kings-judges'
  | 'major-minor-prophets'
  | 'acts-early-church'
  | 'psalms-proverbs'
  | 'revelation-hard';

export interface QuizCategory {
  id: QuizCategoryId;
  title: string;
  subtitle: string;
  unlockCost: number; // 0 = Free Starter Pack
  bookIds: number[];
  storyTheme: 'noah' | 'david' | 'whale' | 'shepherd' | 'bible';
  badgeLabel: string;
  hardMode?: boolean;
}

export interface PlayerProfile {
  displayName: string;
  avatarId: BibleAvatarId;
  isCustomized: boolean;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  displayName: string;
  avatarId: BibleAvatarId;
  totalPoints: number;
  perfectRounds: number;
  isCurrentUser?: boolean;
}

export interface TreasuryCard {
  id: string;
  reference: string;
  title: string;
  verseText: string;
  reflection: string;
  unlockCost: number;
  storyTheme: 'noah' | 'david' | 'whale' | 'shepherd' | 'bible';
  accentGradient: string;
}

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

export interface LocalizedVerseContent {
  reference: string;
  highlightPrefix: string;
  text: string;
  version: string;
  themes: [string, string];
}

export interface BibleVerse {
  id: string;
  book: string;
  bookId?: number;
  chapter?: number;
  verseNumber?: number;
  translations: Record<LanguageCode, LocalizedVerseContent>;
}

export interface DynamicVerseItem {
  id: string; // e.g. "43:3:16"
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  reference: string;
  highlightPrefix: string;
  text: string;
  version: string;
  themes: [string, string];
  meditation?: string;
  lang: LanguageCode;
}

export interface QuizSettings {
  ageGroup: AgeGroup;
  bookFilter: BibleBookFilter;
  voiceGender: VoiceGender;
  voicePitch?: number;
  voiceSpeed?: number;
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
