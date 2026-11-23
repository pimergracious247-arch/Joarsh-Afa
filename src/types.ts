export type LanguageCode =
  | 'en'
  | 'lg'
  | 'sw'
  | 'fr'
  | 'es'
  | 'pt'
  | 'de'
  | 'ar'
  | 'hi'
  | 'zh';

export type AgeGroup = 'kids' | 'teens' | 'adults';

export type BibleBookFilter =
  | 'all'
  | 'Genesis'
  | 'Exodus'
  | 'Psalms'
  | 'Matthew'
  | 'John'
  | 'Revelation';

export type VoiceGender = 'female' | 'male' | 'teen' | 'kids';

export type TabId = 'home' | 'quiz' | 'saved' | 'profile';

export type AppScreen = 'onboarding' | 'main' | 'settings';

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
  book: BibleBookFilter | 'Proverbs' | 'Romans' | 'Philippians' | 'Isaiah';
  translations: Record<LanguageCode, LocalizedVerseContent>;
}

export interface LocalizedQuizContent {
  question: string;
  options: [string, string, string, string];
  reference: string;
}

export interface QuizQuestion {
  id: string;
  book: BibleBookFilter | 'Jonah' | '1 Samuel';
  ageGroup: AgeGroup;
  illustration: string;
  illustrationAlt: string;
  correctIndex: 0 | 1 | 2 | 3;
  translations: Record<LanguageCode, LocalizedQuizContent>;
}

export interface QuizSettings {
  ageGroup: AgeGroup;
  bookFilter: BibleBookFilter;
  voiceGender: VoiceGender;
  soundEnabled: boolean;
}

export interface UserStats {
  totalStars: number;
  quizzesCompleted: number;
  streakDays: number;
  lastPlayedDate: string | null;
}
