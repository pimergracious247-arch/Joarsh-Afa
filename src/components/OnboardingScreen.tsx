import React from 'react';
import { Check } from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGES, UIStrings } from '../data/translations';
import { StorySceneSvg } from './StorySceneSvg';

interface OnboardingScreenProps {
  currentLang: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  t: UIStrings;
}

const LANGUAGE_CARD_STYLES: Record<
  LanguageCode,
  { bg: string; border: string; text: string }
> = {
  en: { bg: 'bg-[#BCE0FF]', border: 'border-[#90C5FA]', text: 'text-[#153E7E]' },
  it: { bg: 'bg-[#DFCBFF]', border: 'border-[#C19FF7]', text: 'text-[#4D2584]' },
  sw: { bg: 'bg-[#B5EAE4]', border: 'border-[#84CFC6]', text: 'text-[#0E5E59]' },
  fr: { bg: 'bg-[#C3DFFF]', border: 'border-[#96C1F9]', text: 'text-[#174082]' },
  es: { bg: 'bg-[#FFD4A8]', border: 'border-[#F2B172]', text: 'text-[#8F3E0B]' },
  pt: { bg: 'bg-[#C1E8AC]', border: 'border-[#92CF74]', text: 'text-[#1E621D]' },
  de: { bg: 'bg-[#FFEAA3]', border: 'border-[#ECC960]', text: 'text-[#59460A]' },
  ar: { bg: 'bg-[#FBEAD2]', border: 'border-[#E6C99E]', text: 'text-[#166634]' },
  hi: { bg: 'bg-[#FFD3B8]', border: 'border-[#F0A87E]', text: 'text-[#8A3B12]' },
  zh: { bg: 'bg-[#FFA8B1]', border: 'border-[#E97A86]', text: 'text-[#7A1821]' },
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  currentLang,
  onSelectLanguage,
  t,
}) => {
  return (
    <div
      dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-between px-4 py-2 sm:py-4 max-w-2xl mx-auto w-full overflow-hidden"
    >
      {/* Hero Illustrated Open Bible with Golden Cross */}
      <div className="w-full flex flex-col items-center shrink-0">
        <div className="relative w-52 h-24 sm:w-64 sm:h-32 md:w-72 md:h-36 rounded-3xl overflow-hidden shadow-[0_10px_28px_-6px_rgba(30,58,138,0.2)] border-2 border-white/80 bg-[#CBE7FF]">
          <StorySceneSvg
            theme="bible"
            label="Open Bible with glowing golden cross resting on soft sky clouds"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#DCEEFF]/20 via-transparent to-transparent" />
        </div>

        <p className="font-display text-sm sm:text-base font-extrabold text-[#1D4ED8] mt-1.5 tracking-tight text-center">
          Bible Quest Daily verse and Quiz
        </p>

        <h1
          className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#163A7A] mt-0.5 sm:mt-1 text-center tracking-tight text-balance"
          style={{
            textShadow:
              '0 2px 0 rgba(255,255,255,0.95), 0 0 12px rgba(255,255,255,0.85)',
          }}
        >
          {t.chooseLanguageTitle}
        </h1>
      </div>

      {/* 2-Column Pastel Language Pill Grid */}
      <div className="w-full flex-1 min-h-0 flex items-center justify-center py-1.5 sm:py-2">
        <div className="w-full grid grid-cols-2 gap-2 sm:gap-3">
          {LANGUAGES.map((lang) => {
            const style = LANGUAGE_CARD_STYLES[lang.code];
            const isSelected = currentLang === lang.code;
            const showNativeSub = lang.nativeName !== lang.name;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang.code)}
                className={`relative min-h-[50px] sm:min-h-[58px] flex items-center justify-between gap-2.5 px-4 sm:px-5 py-2 rounded-[20px] border-2 shadow-[0_3px_0_rgba(20,39,78,0.08)] active:translate-y-[1px] transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#163A7A] ${style.bg} ${style.border} ${
                  isSelected ? 'ring-2 ring-[#163A7A] ring-offset-2 ring-offset-[#DCEEFF]' : 'hover:brightness-[0.98]'
                }`}
              >
                <div className="flex flex-col items-start min-w-0 text-start">
                  <span
                    className={`font-display text-sm sm:text-base font-bold leading-tight truncate max-w-full ${style.text}`}
                  >
                    {lang.name}
                  </span>
                  {showNativeSub && (
                    <span
                      className={`text-[11px] sm:text-xs font-semibold leading-tight opacity-80 ${style.text}`}
                    >
                      {lang.nativeName}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <span
                    className="w-5 h-5 rounded-full bg-[#163A7A] text-white flex items-center justify-center shrink-0"
                    aria-label="Selected"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Prompt */}
      <p className="shrink-0 text-xs sm:text-sm font-semibold text-[#1E3A8A] text-center pb-1">
        {t.chooseLanguageFooter}
      </p>
    </div>
  );
};
