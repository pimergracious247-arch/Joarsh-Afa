import type React from 'react';
import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { LANGUAGES, type UIStrings } from '../data/translations';
import type { LanguageCode } from '../types';
import { preloadSpeechVoices, warmUpSpeechGesture } from '../utils/speechAndAudio';
import { StorySceneSvg } from './StorySceneSvg';

const LANGUAGE_CARD_STYLES: Record<LanguageCode, { bg: string; border: string; text: string }> = {
  en: { bg: 'bg-[#BCE0FF]', border: 'border-[#90C5FA]', text: 'text-[#153E7E]' },
  fr: { bg: 'bg-[#C3DFFF]', border: 'border-[#96C1F9]', text: 'text-[#174082]' },
  pt: { bg: 'bg-[#C1E8AC]', border: 'border-[#92CF74]', text: 'text-[#1E621D]' },
  ar: { bg: 'bg-[#FBEAD2]', border: 'border-[#E6C99E]', text: 'text-[#166634]' },
  hi: { bg: 'bg-[#FFD3B8]', border: 'border-[#F0A87E]', text: 'text-[#8A3B12]' },
  it: { bg: 'bg-[#FFD7CE]', border: 'border-[#F4A595]', text: 'text-[#8F2418]' },
  sw: { bg: 'bg-[#BFEAD2]', border: 'border-[#7FD0A5]', text: 'text-[#115E38]' },
  es: { bg: 'bg-[#FFE5B8]', border: 'border-[#F3BC65]', text: 'text-[#7A4400]' },
  de: { bg: 'bg-[#E2D6FF]', border: 'border-[#B9A1F7]', text: 'text-[#3F2182]' },
  zh: { bg: 'bg-[#FFD5E5]', border: 'border-[#F39CBE]', text: 'text-[#8A1B47]' },
};

interface OnboardingScreenProps {
  currentLang: LanguageCode;
  hasSavedSelection?: boolean;
  onSelectLanguage: (lang: LanguageCode) => void;
  t: UIStrings;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  currentLang,
  hasSavedSelection = false,
  onSelectLanguage,
  t,
}) => {
  // Warm up speech synthesis voices as soon as the language screen renders
  useEffect(() => {
    preloadSpeechVoices();
  }, []);

  return (
    <div
      dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-between px-4 py-3 sm:py-4 max-w-2xl mx-auto w-full overflow-hidden"
    >
      <div className="w-full flex flex-col items-center shrink-0">
        <div className="relative w-40 h-16 sm:w-56 sm:h-24 md:w-64 md:h-28 rounded-3xl overflow-hidden shadow-[0_10px_28px_-6px_rgba(30,58,138,0.2)] border-2 border-white/80 bg-[#CBE7FF]">
          <StorySceneSvg theme="bible" label={t.storyBibleAlt} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#DCEEFF]/20 via-transparent to-transparent" />
        </div>
        <p className="font-display text-xs sm:text-sm font-extrabold text-[#1D4ED8] mt-1 tracking-tight text-center">
          {t.appTitle}
        </p>
        <h1
          className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold text-[#163A7A] mt-0.5 text-center tracking-tight text-balance"
          style={{ textShadow: '0 2px 0 rgba(255,255,255,0.95), 0 0 12px rgba(255,255,255,0.85)' }}
        >
          {t.chooseLanguageTitle}
        </h1>
      </div>

      <div className="w-full flex-1 min-h-0 overflow-hidden py-1.5 px-0.5 flex items-center justify-center">
        <div className="w-full grid grid-cols-2 gap-2 sm:gap-2.5 max-w-xl">
          {LANGUAGES.map((lang) => {
            const style = LANGUAGE_CARD_STYLES[lang.code] || LANGUAGE_CARD_STYLES.en;
            const isSelected = hasSavedSelection && currentLang === lang.code;
            const showNativeSub = lang.nativeName !== lang.name;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  warmUpSpeechGesture();
                  onSelectLanguage(lang.code);
                }}
                className={`relative min-h-[48px] sm:min-h-[58px] flex items-center justify-between gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-[18px] border-2 shadow-[0_4px_0_rgba(20,39,78,0.09)] active:translate-y-[1px] transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#163A7A] ${style.bg} ${style.border} ${
                  isSelected
                    ? 'ring-2 ring-[#163A7A] ring-offset-2 ring-offset-[#DCEEFF]'
                    : 'hover:brightness-[0.98]'
                }`}
              >
                <div className="flex flex-col items-start min-w-0 text-start">
                  <span
                    className={`font-display text-sm sm:text-lg font-extrabold leading-tight truncate max-w-full ${style.text}`}
                  >
                    {lang.nativeName}
                  </span>
                  {showNativeSub && (
                    <span
                      className={`text-[11px] sm:text-xs font-semibold leading-tight opacity-85 truncate max-w-full ${style.text}`}
                    >
                      {lang.name}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <span
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#163A7A] text-white flex items-center justify-center shrink-0"
                    aria-label={t.selectedLabel}
                  >
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="shrink-0 text-xs sm:text-sm font-semibold text-[#1E3A8A] text-center pb-0.5">
        {t.chooseLanguageFooter}
      </p>
    </div>
  );
};
