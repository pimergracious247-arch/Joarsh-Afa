import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Clock,
  RotateCcw,
  Settings,
  Star,
  Volume2,
  X,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import { LanguageCode, QuizQuestion } from '../types';
import { UIStrings } from '../data/translations';

interface QuizScreenProps {
  questions: QuizQuestion[];
  lang: LanguageCode;
  t: UIStrings;
  isSpeaking: boolean;
  onSpeakQuestion: (text: string) => void;
  onPlaySound: (kind: 'correct' | 'wrong' | 'complete' | 'tap') => void;
  onFinishRound: (correctCount: number) => void;
  onStartNewRound: () => void;
  onOpenSettings: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

const OPTION_THEMES = [
  {
    bg: 'bg-[#49C946] hover:bg-[#3FB83C]',
    border: 'border-[#238820]',
    letterText: 'text-[#238820]',
  },
  {
    bg: 'bg-[#1696F2] hover:bg-[#0E85DC]',
    border: 'border-[#0B66AC]',
    letterText: 'text-[#0B66AC]',
  },
  {
    bg: 'bg-[#9753E8] hover:bg-[#8642D6]',
    border: 'border-[#6727B5]',
    letterText: 'text-[#6727B5]',
  },
  {
    bg: 'bg-[#FF8C1A] hover:bg-[#EB7C0E]',
    border: 'border-[#C85C00]',
    letterText: 'text-[#C85C00]',
  },
];

export const QuizScreen: React.FC<QuizScreenProps> = ({
  questions,
  lang,
  t,
  isSpeaking,
  onSpeakQuestion,
  onPlaySound,
  onFinishRound,
  onStartNewRound,
  onOpenSettings,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [answersRecord, setAnswersRecord] = useState<boolean[]>([]);
  const [isRoundOver, setIsRoundOver] = useState(false);

  const advanceTimerRef = useRef<number | null>(null);

  const total = questions.length;
  const activeQ = questions[currentIdx] || questions[0];
  const localizedQ = activeQ.translations[lang];
  const hasAnswered = selectedOption !== null || timedOut;

  useEffect(() => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setTimedOut(false);
    setSecondsLeft(30);
    setAnswersRecord([]);
    setIsRoundOver(false);
  }, [questions]);

  useEffect(() => {
    if (isRoundOver || hasAnswered) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setTimedOut(true);
          onPlaySound('wrong');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [currentIdx, isRoundOver, hasAnswered, onPlaySound]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const proceedToNext = (updatedRecord: boolean[]) => {
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    if (currentIdx + 1 >= total) {
      const score = updatedRecord.filter(Boolean).length;
      onPlaySound('complete');
      onFinishRound(score);
      setIsRoundOver(true);
    } else {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setTimedOut(false);
      setSecondsLeft(30);
    }
  };

  useEffect(() => {
    if (!timedOut) return;
    const updatedRecord = [...answersRecord, false];
    setAnswersRecord(updatedRecord);
    advanceTimerRef.current = window.setTimeout(() => {
      proceedToNext(updatedRecord);
    }, 1700);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedOut]);

  const handleSelectOption = (optIndex: number) => {
    if (hasAnswered) return;
    setSelectedOption(optIndex);
    const isCorrect = optIndex === activeQ.correctIndex;
    onPlaySound(isCorrect ? 'correct' : 'wrong');
    const updatedRecord = [...answersRecord, isCorrect];
    setAnswersRecord(updatedRecord);

    advanceTimerRef.current = window.setTimeout(() => {
      proceedToNext(updatedRecord);
    }, 1700);
  };

  const progressText = t.questionProgressPill
    .replace('{current}', String(currentIdx + 1))
    .replace('{total}', String(total));

  const completedCount = answersRecord.length;
  const completedLabel = t.completedProgress
    .replace('{done}', String(completedCount))
    .replace('{total}', String(total));

  if (isRoundOver) {
    const finalScore = answersRecord.filter(Boolean).length;
    return (
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-4 py-3 max-w-xl mx-auto w-full overflow-hidden"
      >
        <div className="w-full bg-white/95 rounded-[30px] p-5 sm:p-7 shadow-[0_14px_34px_-8px_rgba(30,58,138,0.18)] border-2 border-white flex flex-col items-center text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFE675] border-4 border-[#F5B935] flex items-center justify-center text-[#B45309] shadow-sm">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14274E] mt-3">
            {t.quizCompleteTitle}
          </h2>
          <p className="text-sm text-[#5C7299] mt-1">{t.quizCompleteSubtitle}</p>

          <div className="w-full grid grid-cols-2 gap-3 my-4">
            <div className="rounded-2xl bg-[#FFF6CC] border border-[#F3D877] p-3">
              <div className="text-xs font-semibold text-[#7A5400]">
                {t.scoreLabel}
              </div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#14274E] tabular-nums mt-0.5">
                {finalScore} / {total}
              </div>
            </div>
            <div className="rounded-2xl bg-[#E5F0FF] border border-[#B2CEFB] p-3">
              <div className="text-xs font-semibold text-[#164A9E]">
                {t.starsEarnedLabel}
              </div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#14274E] tabular-nums mt-0.5 flex items-center justify-center gap-1">
                <span>+{finalScore}</span>
                <Star className="w-6 h-6 fill-[#FFD038] text-[#E5A00D]" />
              </div>
            </div>
          </div>

          {/* Star Row */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {Array.from({ length: total }).map((_, idx) => {
              const earned = answersRecord[idx] === true;
              return (
                <Star
                  key={idx}
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                    earned
                      ? 'fill-[#FFD038] text-[#E5A00D]'
                      : 'fill-[#E2E8F0] text-[#CBD5E1]'
                  }`}
                />
              );
            })}
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onStartNewRound}
              className="flex-1 min-h-[48px] flex items-center justify-center gap-2 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-base shadow-[0_4px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.playAgain}</span>
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex-1 min-h-[48px] flex items-center justify-center gap-2 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] border-2 border-[#B0D4FA] text-[#14274E] font-display font-bold text-base transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>{t.quizSettingsBtn}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const circleRadius = 21;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeOffset =
    circleCircumference - (secondsLeft / 30) * circleCircumference;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-3.5 sm:px-5 py-1.5 sm:py-2.5 max-w-3xl mx-auto w-full overflow-hidden"
    >
      {/* Top Bar: Yellow Question Pill + Blue Speaker Button + Orange 30s Timer */}
      <div className="shrink-0 flex items-center justify-between gap-2 bg-[#FFE675] border-2 border-[#F5B935] rounded-2xl px-3 py-1.5 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-display text-base sm:text-xl font-extrabold text-[#164A9E] whitespace-nowrap">
            {progressText}
          </span>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label={t.quizSettingsBtn}
            className="w-8 h-8 rounded-xl bg-white/75 hover:bg-white text-[#164A9E] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              onSpeakQuestion(
                `${localizedQ.question}. ${localizedQ.options.join(', ')}`
              )
            }
            aria-label={t.listen}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white border-2 transition-transform active:scale-95 cursor-pointer ${
              isSpeaking
                ? 'bg-[#FF8C1A] border-[#C85C00]'
                : 'bg-[#4DA3FF] hover:bg-[#2F8FFF] border-[#2574D4]'
            }`}
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Circular Orange Countdown Timer */}
          <div
            className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-[#FF8C1A] border-2 border-[#C85C00] shadow-xs"
            aria-label={`${secondsLeft} seconds remaining`}
          >
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 48 48"
            >
              <circle
                cx="24"
                cy="24"
                r={circleRadius}
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                r={circleRadius}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeDasharray={circleCircumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="relative font-display text-sm sm:text-base font-extrabold text-white tabular-nums">
              {secondsLeft}
            </span>
            <Clock className="absolute -top-1 -right-1 w-3.5 h-3.5 text-white bg-[#E66A00] rounded-full p-0.5" />
          </div>
        </div>
      </div>

      {/* Illustration + Wooden Signboard Banner */}
      <div className="shrink-0 flex flex-col items-center my-1 sm:my-1.5">
        <div className="w-full max-w-md h-24 sm:h-32 md:h-36 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-[#CBE7FF]">
          <img
            src={activeQ.illustration}
            alt={activeQ.illustrationAlt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Rustic Wooden Signboard Banner */}
        <div className="wood-signboard relative -mt-3 w-full max-w-lg rounded-2xl px-4 py-2 sm:py-2.5 text-center">
          <span
            className="hidden sm:block absolute top-2 left-3 w-2 h-2 rounded-full bg-[#D7A86E] border border-[#4E2A0F]"
            aria-hidden="true"
          />
          <span
            className="hidden sm:block absolute top-2 right-3 w-2 h-2 rounded-full bg-[#D7A86E] border border-[#4E2A0F]"
            aria-hidden="true"
          />
          <h2 className="font-display text-base sm:text-xl font-extrabold text-[#FFF8E7] leading-snug text-balance">
            {localizedQ.question}
          </h2>
        </div>
      </div>

      {/* Answer Feedback Ribbon (only visible after selection/timeout, compact height) */}
      <div className="shrink-0 min-h-[24px] flex items-center justify-center">
        {hasAnswered ? (
          <div className="flex items-center gap-2 bg-white/95 border border-[#BFD9FA] rounded-full px-3 py-0.5 shadow-xs">
            <span
              className={`text-xs font-extrabold ${
                selectedOption === activeQ.correctIndex
                  ? 'text-[#1E7E1C]'
                  : 'text-[#C85C00]'
              }`}
            >
              {timedOut
                ? t.timesUpFeedback
                : selectedOption === activeQ.correctIndex
                ? t.correctFeedback
                : t.wrongFeedback}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-bold text-[#14274E]">
              {t.referenceLabel}: {localizedQ.reference}
            </span>
            <button
              type="button"
              onClick={() => proceedToNext(answersRecord)}
              className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#2F8FFF] hover:underline cursor-pointer ms-1"
            >
              <span>{t.nextQuestion}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-[#5C7299] opacity-0 select-none">
            ·
          </span>
        )}
      </div>

      {/* 4 Stacked Colorful Answer Pills (A Green, B Blue, C Purple, D Orange) */}
      <div className="flex-1 min-h-0 flex flex-col justify-center gap-1.5 sm:gap-2 max-w-lg mx-auto w-full">
        {localizedQ.options.map((optionText, idx) => {
          const theme = OPTION_THEMES[idx];
          const isChosen = selectedOption === idx;
          const isCorrect = activeQ.correctIndex === idx;

          let stateClasses = `${theme.bg} ${theme.border}`;
          if (hasAnswered) {
            if (isCorrect) {
              stateClasses =
                'bg-[#49C946] border-[#1A6D18] ring-2 ring-white scale-[1.01]';
            } else if (isChosen) {
              stateClasses =
                'bg-[#EF4444] border-[#991B1B] ring-2 ring-white';
            } else {
              stateClasses = `${theme.bg} ${theme.border} opacity-55`;
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`w-full min-h-[42px] sm:min-h-[48px] flex items-center justify-between gap-3 rounded-full border-2 px-2.5 sm:px-3.5 py-1 shadow-[0_3px_0_rgba(20,39,78,0.18)] transition-all duration-150 cursor-pointer disabled:cursor-default ${stateClasses}`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <span
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center font-display text-sm sm:text-base font-extrabold shrink-0 ${theme.letterText}`}
                >
                  {OPTION_LETTERS[idx]}
                </span>
                <span className="font-display text-sm sm:text-lg font-bold text-white text-start truncate">
                  {optionText}
                </span>
              </div>

              {hasAnswered && isCorrect && (
                <span className="w-6 h-6 rounded-full bg-white text-[#1E7E1C] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
              )}
              {hasAnswered && isChosen && !isCorrect && (
                <span className="w-6 h-6 rounded-full bg-white text-[#DC2626] flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 stroke-[3]" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 6-Star Progress Tracker */}
      <div className="shrink-0 flex flex-col items-center pt-1 pb-0.5">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {Array.from({ length: total }).map((_, idx) => {
            const answered = idx < answersRecord.length;
            const correct = answersRecord[idx] === true;
            const isCurrent = idx === currentIdx && !hasAnswered;
            return (
              <Star
                key={idx}
                className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform ${
                  answered
                    ? correct
                      ? 'fill-[#FFD038] text-[#E5A00D] scale-110'
                      : 'fill-[#FDBA74] text-[#EA580C]'
                    : isCurrent
                    ? 'fill-[#FFF1A8] text-[#E5A00D]'
                    : 'fill-white/70 text-[#CBD5E1]'
                }`}
              />
            );
          })}
        </div>
        <span className="text-[11px] sm:text-xs font-bold text-[#14274E] mt-0.5 tabular-nums">
          {completedLabel}
        </span>
      </div>
    </div>
  );
};
