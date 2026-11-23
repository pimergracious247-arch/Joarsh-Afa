import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Cloud,
  Feather,
  Flame,
  Fish,
  Headphones,
  Mic,
  Music,
  Shield,
  Smile,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  AgeGroup,
  BibleBookFilter,
  LanguageCode,
  QuizSettings,
  VoiceGender,
} from '../types';
import { UIStrings } from '../data/translations';

interface SettingsScreenProps {
  settings: QuizSettings;
  onSaveSettings: (next: QuizSettings) => void;
  onBack: () => void;
  lang: LanguageCode;
  t: UIStrings;
}

const BOOK_PILLS: {
  id: Exclude<BibleBookFilter, 'all'>;
  bg: string;
  activeBg: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'Genesis',
    bg: 'bg-[#FFD8AE] border-[#F0B87D] text-[#7A3B09]',
    activeBg: 'bg-[#FFC182] border-[#14274E] text-[#14274E]',
    icon: <Feather className="w-3.5 h-3.5 shrink-0" />,
  },
  {
    id: 'Exodus',
    bg: 'bg-[#FFCBD0] border-[#EE9EA7] text-[#7F1D2B]',
    activeBg: 'bg-[#FFA9B2] border-[#14274E] text-[#14274E]',
    icon: <Flame className="w-3.5 h-3.5 shrink-0" />,
  },
  {
    id: 'Psalms',
    bg: 'bg-[#B7E9E2] border-[#84CFC5] text-[#0E5851]',
    activeBg: 'bg-[#8FDCD1] border-[#14274E] text-[#14274E]',
    icon: <Music className="w-3.5 h-3.5 shrink-0" />,
  },
  {
    id: 'Matthew',
    bg: 'bg-[#FFE7A3] border-[#EBC663] text-[#6B4E07]',
    activeBg: 'bg-[#FFD76E] border-[#14274E] text-[#14274E]',
    icon: <Sparkles className="w-3.5 h-3.5 shrink-0" />,
  },
  {
    id: 'John',
    bg: 'bg-[#D7C8FF] border-[#B69CF6] text-[#452483]',
    activeBg: 'bg-[#C0A9FF] border-[#14274E] text-[#14274E]',
    icon: <Fish className="w-3.5 h-3.5 shrink-0" />,
  },
  {
    id: 'Revelation',
    bg: 'bg-[#CBD6FF] border-[#9BB0FA] text-[#1E3A8A]',
    activeBg: 'bg-[#AEC0FF] border-[#14274E] text-[#14274E]',
    icon: <Cloud className="w-3.5 h-3.5 shrink-0" />,
  },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onSaveSettings,
  onBack,
  lang,
  t,
}) => {
  const [draft, setDraft] = useState<QuizSettings>(settings);

  const ageOptions: {
    id: AgeGroup;
    label: string;
    range: string;
    bg: string;
  }[] = [
    {
      id: 'kids',
      label: t.ageKids,
      range: t.ageKidsRange,
      bg: 'bg-[#FFE89E] border-[#F0CA65]',
    },
    {
      id: 'teens',
      label: t.ageTeens,
      range: t.ageTeensRange,
      bg: 'bg-[#D3C2F8] border-[#B297F0]',
    },
    {
      id: 'adults',
      label: t.ageAdults,
      range: t.ageAdultsRange,
      bg: 'bg-[#B8E6A3] border-[#89C86E]',
    },
  ];

  const voiceOptions: {
    id: VoiceGender;
    label: string;
    bg: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'female',
      label: t.voiceFemale,
      bg: 'bg-[#FFC2CC] border-[#EF96A5] text-[#6E1A2A]',
      icon: <UserCheck className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'male',
      label: t.voiceMale,
      bg: 'bg-[#B8D9FF] border-[#88B8F2] text-[#153E7E]',
      icon: <Shield className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'teen',
      label: t.voiceTeen,
      bg: 'bg-[#FFD5A8] border-[#F0B270] text-[#7A3B09]',
      icon: <Headphones className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'kids',
      label: t.voiceKids,
      bg: 'bg-[#C1E8AC] border-[#90CB72] text-[#1E5C1D]',
      icon: <Smile className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-3.5 sm:px-5 py-1.5 sm:py-2.5 max-w-3xl mx-auto w-full overflow-hidden"
    >
      {/* Header: Cloud icon + Settings pill + Open Bible & Cross badge */}
      <header className="shrink-0 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={t.previous}
          className="w-10 h-10 rounded-full bg-white/95 hover:bg-white border border-[#BFD9FA] text-[#14274E] flex items-center justify-center shadow-xs cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative flex items-center gap-2.5 bg-white/95 border-2 border-white rounded-full px-4 py-1.5 shadow-[0_6px_18px_rgba(20,39,78,0.1)]">
          {/* Open Bible & Cross mini badge */}
          <div
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF4C4] border border-[#F2CE5B] text-[#B45309]"
            aria-hidden="true"
          >
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="w-8 h-8 rounded-full bg-[#BCE0FF] flex items-center justify-center text-[#164A9E]">
            <Cloud className="w-5 h-5 fill-white text-[#2F8FFF]" />
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#164A9E] tracking-tight">
            {t.settingsTitle}
          </h1>
        </div>

        <div className="w-10 shrink-0" aria-hidden="true" />
      </header>

      {/* Main 3 Settings Cards (responsive grid on tablet/desktop, crisp compact stack on mobile) */}
      <div className="flex-1 min-h-0 flex flex-col justify-evenly gap-1.5 sm:gap-2.5 my-1 sm:my-2">
        {/* Card 1: 1. Age of User */}
        <section className="bg-white/95 rounded-[24px] p-3 sm:p-4 shadow-[0_6px_20px_-6px_rgba(30,58,138,0.12)] border border-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-full bg-[#FFE89E] flex items-center justify-center text-[#8A5600] shrink-0">
              <Smile className="w-4 h-4" />
            </span>
            <h2 className="font-display text-sm sm:text-base font-extrabold text-[#14274E]">
              {t.ageCardTitle}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {ageOptions.map((opt) => {
              const isActive = draft.ageGroup === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, ageGroup: opt.id })}
                  className={`relative rounded-2xl border-2 px-2 py-1.5 sm:py-2.5 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    opt.bg
                  } ${
                    isActive
                      ? 'border-[#14274E] ring-1 ring-[#14274E] shadow-xs'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  {isActive && (
                    <span
                      className="absolute -top-2 -right-1.5 w-5 h-5 rounded-full bg-[#2A8CFF] text-white border-2 border-white flex items-center justify-center shadow-xs"
                      aria-label="Active"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                  <span className="font-display text-xs sm:text-sm font-extrabold text-[#14274E] leading-tight">
                    {opt.label}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-[#334155] tabular-nums">
                    {opt.range}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Card 2: 2. Book of the Bible */}
        <section className="bg-white/95 rounded-[24px] p-3 sm:p-4 shadow-[0_6px_20px_-6px_rgba(30,58,138,0.12)] border border-white">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-full bg-[#D4E9FF] flex items-center justify-center text-[#164A9E] shrink-0">
                <BookOpen className="w-4 h-4" />
              </span>
              <h2 className="font-display text-sm sm:text-base font-extrabold text-[#14274E] truncate">
                {t.bookCardTitle}
              </h2>
            </div>

            <select
              aria-label={t.bookCardTitle}
              value={draft.bookFilter}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  bookFilter: e.target.value as BibleBookFilter,
                })
              }
              className="rounded-full bg-[#F1F6FF] border border-[#BFD9FA] px-3 py-1 text-xs sm:text-sm font-bold text-[#14274E] focus:outline-none focus:ring-2 focus:ring-[#2A8CFF] cursor-pointer"
            >
              <option value="all">{t.bookNames.all}</option>
              <option value="Genesis">{t.bookNames.Genesis}</option>
              <option value="Exodus">{t.bookNames.Exodus}</option>
              <option value="Psalms">{t.bookNames.Psalms}</option>
              <option value="Matthew">{t.bookNames.Matthew}</option>
              <option value="John">{t.bookNames.John}</option>
              <option value="Revelation">{t.bookNames.Revelation}</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {BOOK_PILLS.map((pill) => {
              const isSelected = draft.bookFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      bookFilter: isSelected ? 'all' : pill.id,
                    })
                  }
                  className={`min-h-[34px] sm:min-h-[38px] rounded-full border-2 px-2 py-1 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    isSelected ? `${pill.activeBg} shadow-xs` : pill.bg
                  }`}
                >
                  {pill.icon}
                  <span className="truncate">{t.bookNames[pill.id]}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Card 3: 3. Voice Gender */}
        <section className="bg-white/95 rounded-[24px] p-3 sm:p-4 shadow-[0_6px_20px_-6px_rgba(30,58,138,0.12)] border border-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-full bg-[#FFD4DD] flex items-center justify-center text-[#9E1C3F] shrink-0">
              <Mic className="w-4 h-4" />
            </span>
            <h2 className="font-display text-sm sm:text-base font-extrabold text-[#14274E]">
              {t.voiceCardTitle}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {voiceOptions.map((voice) => {
              const isSelected = draft.voiceGender === voice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, voiceGender: voice.id })}
                  className={`relative min-h-[38px] sm:min-h-[44px] rounded-full border-2 px-3 py-1 flex items-center justify-between gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    voice.bg
                  } ${
                    isSelected
                      ? 'border-[#14274E] ring-1 ring-[#14274E] shadow-xs'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {voice.icon}
                    <span className="truncate">{voice.label}</span>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#14274E] text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Save Settings Full-Width Bright Blue Pill Button */}
      <div className="shrink-0 pb-0.5">
        <button
          type="button"
          onClick={() => onSaveSettings(draft)}
          className="w-full min-h-[46px] sm:min-h-[52px] rounded-full bg-[#2C88FF] hover:bg-[#1B78F0] text-white font-display text-base sm:text-lg font-extrabold flex items-center justify-center gap-2 shadow-[0_4px_0_#1662C6] active:translate-y-[1px] transition-all cursor-pointer"
        >
          <span>{t.saveSettings}</span>
          <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
            <Check className="w-4 h-4 stroke-[3]" />
          </span>
        </button>
      </div>
    </div>
  );
};
