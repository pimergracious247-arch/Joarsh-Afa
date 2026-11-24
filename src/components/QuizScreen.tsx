import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Flame,
  Layers,
  Loader2,
  Play,
  RotateCcw,
  Settings,
  Snowflake,
  Sparkles,
  Split,
  Trophy,
  Volume2,
  X,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { UIStrings } from '../data/translations';
import { StoryTheme } from '../data/illustrations';
import { StorySceneSvg } from './StorySceneSvg';
import { GoldCoinIcon } from './GoldCoinIcon';

const COINS_PER_CORRECT = 10;
const POINTS_PER_CORRECT = 100;
const PERFECT_BONUS_COINS = 20;
const PERFECT_BONUS_POINTS = 200;

const QUESTION_DURATION_SECONDS = 15;
const TIMER_FREEZE_PAUSE_SECONDS = 10;
const TIMER_FREEZE_ADD_SECONDS = 15;

const LIFELINE_5050_COST = 25;
const LIFELINE_FREEZE_COST = 30;
const LIFELINE_CLUE_COST = 40;
const SAVE_STREAK_COIN_COST = 50;

export interface ActiveQuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  reference: string;
  storyTheme: StoryTheme;
  illustrationAlt: string;
}

interface QuizScreenProps {
  questions: ActiveQuizQuestion[];
  isLoading: boolean;
  errorMessage: string | null;
  categoryTitle: string;
  totalCoins: number;
  currentStreak: number;
  lang: LanguageCode;
  t: UIStrings;
  isSpeaking: boolean;
  saveStreakGrantToken: number;
  onStartQuizSpeech: (text: string, onDone?: () => void) => void;
  onStopSpeech: () => void;
  onPlaySound: (kind: 'correct' | 'wrong' | 'complete' | 'tap') => void;
  onQuestionPlayed: (questionText: string) => void;
  onSpendCoins: (amount: number, reasonToast: string) => boolean;
  onAnswerOutcome: (isCorrect: boolean) => void;
  onFinishRound: (
    correctCount: number,
    coinsEarned: number,
    pointsEarned: number,
    isPerfect: boolean
  ) => void;
  onRoundOverChange: (isOver: boolean) => void;
  onStartNewRound: () => void;
  onOpenCategories: () => void;
  onOpenSettings: () => void;
  onWatchDoubleRoundAd: (baseCoins: number, basePoints: number) => void;
  onWatchSaveStreakAd: () => void;
  coinsDoubledForRound: boolean;
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
  isLoading,
  errorMessage,
  categoryTitle,
  totalCoins,
  currentStreak,
  lang,
  t,
  isSpeaking,
  saveStreakGrantToken,
  onStartQuizSpeech,
  onStopSpeech,
  onPlaySound,
  onQuestionPlayed,
  onSpendCoins,
  onAnswerOutcome,
  onFinishRound,
  onRoundOverChange,
  onStartNewRound,
  onOpenCategories,
  onOpenSettings,
  onWatchDoubleRoundAd,
  onWatchSaveStreakAd,
  coinsDoubledForRound,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_DURATION_SECONDS);
  const [questionMaxSeconds, setQuestionMaxSeconds] = useState(
    QUESTION_DURATION_SECONDS
  );
  const [freezeSecondsLeft, setFreezeSecondsLeft] = useState(0);
  const [isTimerArmed, setIsTimerArmed] = useState(false);
  const [answersRecord, setAnswersRecord] = useState<boolean[]>([]);
  const [isRoundOver, setIsRoundOver] = useState(false);

  // Lifelines state per question
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);
  const [used5050, setUsed5050] = useState(false);
  const [usedFreeze, setUsedFreeze] = useState(false);
  const [showVerseClue, setShowVerseClue] = useState(false);

  // Wrong answer / Out of time Save Streak Popup
  const [streakRescueState, setStreakRescueState] = useState<{
    reason: 'wrong' | 'timeout';
    wrongOptionIdx: number | null;
  } | null>(null);

  const advanceTimerRef = useRef<number | null>(null);
  const onStartQuizSpeechRef = useRef(onStartQuizSpeech);
  const onStopSpeechRef = useRef(onStopSpeech);
  const lastHandledGrantTokenRef = useRef(saveStreakGrantToken);

  useEffect(() => {
    onStartQuizSpeechRef.current = onStartQuizSpeech;
    onStopSpeechRef.current = onStopSpeech;
  }, [onStartQuizSpeech, onStopSpeech]);

  useEffect(() => {
    onRoundOverChange(isRoundOver);
  }, [isRoundOver, onRoundOverChange]);

  const total = questions.length;
  const activeQ = questions[currentIdx];
  const hasAnswered = selectedOption !== null || timedOut;
  const isResolvingMiss = streakRescueState !== null;

  const resetQuestionHelpers = () => {
    setEliminatedIndices([]);
    setUsed5050(false);
    setUsedFreeze(false);
    setShowVerseClue(false);
    setFreezeSecondsLeft(0);
    setStreakRescueState(null);
  };

  useEffect(() => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setTimedOut(false);
    setSecondsLeft(QUESTION_DURATION_SECONDS);
    setQuestionMaxSeconds(QUESTION_DURATION_SECONDS);
    setIsTimerArmed(false);
    setAnswersRecord([]);
    setIsRoundOver(false);
    resetQuestionHelpers();
  }, [questions]);

  // Speak each active question automatically and start timer only after speech completes
  useEffect(() => {
    if (
      isLoading ||
      errorMessage ||
      !activeQ ||
      isRoundOver ||
      hasAnswered ||
      isResolvingMiss
    ) {
      return;
    }

    let cancelled = false;
    setIsTimerArmed(false);

    const spokenText = `${activeQ.question}. A: ${activeQ.options[0]}. B: ${activeQ.options[1]}. C: ${activeQ.options[2]}. D: ${activeQ.options[3]}.`;
    onStartQuizSpeechRef.current(spokenText, () => {
      if (!cancelled) {
        setIsTimerArmed(true);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQ?.id, isLoading, errorMessage, isRoundOver]);

  // Timer countdown (respects Time Freeze pause window + Save Streak popup pause)
  useEffect(() => {
    if (
      isLoading ||
      errorMessage ||
      !activeQ ||
      isRoundOver ||
      hasAnswered ||
      isResolvingMiss ||
      !isTimerArmed
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      if (freezeSecondsLeft > 0) {
        setFreezeSecondsLeft((f) => Math.max(0, f - 1));
        return;
      }

      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          onPlaySound('wrong');
          setStreakRescueState({ reason: 'timeout', wrongOptionIdx: null });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [
    currentIdx,
    isLoading,
    errorMessage,
    activeQ,
    isRoundOver,
    hasAnswered,
    isResolvingMiss,
    isTimerArmed,
    freezeSecondsLeft,
    onPlaySound,
  ]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        window.clearTimeout(advanceTimerRef.current);
      }
      onStopSpeechRef.current();
    };
  }, []);

  // Grant second chance when user finishes watching Rewarded Video for Save Your Streak
  useEffect(() => {
    if (
      saveStreakGrantToken > lastHandledGrantTokenRef.current &&
      streakRescueState
    ) {
      lastHandledGrantTokenRef.current = saveStreakGrantToken;
      applyStreakRescueContinue();
    } else {
      lastHandledGrantTokenRef.current = saveStreakGrantToken;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveStreakGrantToken]);

  const applyStreakRescueContinue = () => {
    if (!streakRescueState) return;
    const { reason, wrongOptionIdx } = streakRescueState;

    if (wrongOptionIdx !== null) {
      setEliminatedIndices((prev) =>
        prev.includes(wrongOptionIdx) ? prev : [...prev, wrongOptionIdx]
      );
    }
    if (reason === 'timeout' || secondsLeft <= 3) {
      setSecondsLeft((prev) => {
        const next = prev + 15;
        setQuestionMaxSeconds((maxPrev) => Math.max(maxPrev, next));
        return next;
      });
    }
    setStreakRescueState(null);
    setIsTimerArmed(true);
  };

  const handleSpendSaveStreakCoins = () => {
    if (!streakRescueState) return;
    if (!onSpendCoins(SAVE_STREAK_COIN_COST, 'Streak saved! Continue round (-50 coins)')) {
      onPlaySound('wrong');
      return;
    }
    onPlaySound('tap');
    applyStreakRescueContinue();
  };

  const handleDeclineStreakRescue = () => {
    if (!streakRescueState || !activeQ) return;
    const { reason, wrongOptionIdx } = streakRescueState;
    setStreakRescueState(null);

    onQuestionPlayed(activeQ.question);
    onAnswerOutcome(false);

    if (reason === 'timeout') {
      setTimedOut(true);
    } else if (wrongOptionIdx !== null) {
      setSelectedOption(wrongOptionIdx);
    }

    const updatedRecord = [...answersRecord, false];
    setAnswersRecord(updatedRecord);

    advanceTimerRef.current = window.setTimeout(() => {
      proceedToNext(updatedRecord);
    }, 1500);
  };

  const proceedToNext = (updatedRecord: boolean[]) => {
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    onStopSpeech();

    if (currentIdx + 1 >= total) {
      const score = updatedRecord.filter(Boolean).length;
      const isPerfect = total === 6 && score === 6;
      const coinsEarned =
        score * COINS_PER_CORRECT + (isPerfect ? PERFECT_BONUS_COINS : 0);
      const pointsEarned =
        score * POINTS_PER_CORRECT + (isPerfect ? PERFECT_BONUS_POINTS : 0);

      onPlaySound('complete');
      onFinishRound(score, coinsEarned, pointsEarned, isPerfect);
      setIsRoundOver(true);
    } else {
      setIsTimerArmed(false);
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setTimedOut(false);
      setSecondsLeft(QUESTION_DURATION_SECONDS);
      setQuestionMaxSeconds(QUESTION_DURATION_SECONDS);
      resetQuestionHelpers();
    }
  };

  const handleLifeline5050 = () => {
    if (!activeQ || used5050 || hasAnswered || isResolvingMiss) return;
    if (!onSpendCoins(LIFELINE_5050_COST, '50/50 Hint used! 2 wrong answers removed (-25 coins)')) {
      onPlaySound('wrong');
      return;
    }
    const wrongIndices = [0, 1, 2, 3].filter(
      (i) => i !== activeQ.correctIndex && !eliminatedIndices.includes(i)
    );
    const shuffled = [...wrongIndices].sort(() => Math.random() - 0.5);
    const toRemove = shuffled.slice(0, 2);
    setEliminatedIndices((prev) => [...prev, ...toRemove]);
    setUsed5050(true);
    onPlaySound('tap');
  };

  const handleLifelineFreeze = () => {
    if (!activeQ || usedFreeze || hasAnswered || isResolvingMiss) return;
    if (!onSpendCoins(LIFELINE_FREEZE_COST, 'Time Freeze activated! Paused +15s (-30 coins)')) {
      onPlaySound('wrong');
      return;
    }
    setUsedFreeze(true);
    setFreezeSecondsLeft(TIMER_FREEZE_PAUSE_SECONDS);
    setSecondsLeft((prev) => {
      const next = prev + TIMER_FREEZE_ADD_SECONDS;
      setQuestionMaxSeconds((maxPrev) => Math.max(maxPrev, next));
      return next;
    });
    onPlaySound('tap');
  };

  const handleLifelineVerseClue = () => {
    if (!activeQ || showVerseClue || hasAnswered || isResolvingMiss) return;
    if (!onSpendCoins(LIFELINE_CLUE_COST, `Clue unlocked: ${activeQ.reference} (-40 coins)`)) {
      onPlaySound('wrong');
      return;
    }
    setShowVerseClue(true);
    onPlaySound('tap');
  };

  const handleToggleListen = () => {
    if (!activeQ) return;
    if (isSpeaking) {
      onStopSpeech();
      setIsTimerArmed(true);
    } else {
      const spokenText = `${activeQ.question}. A: ${activeQ.options[0]}. B: ${activeQ.options[1]}. C: ${activeQ.options[2]}. D: ${activeQ.options[3]}.`;
      onStartQuizSpeech(spokenText, () => {
        setIsTimerArmed(true);
      });
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (
      hasAnswered ||
      isResolvingMiss ||
      !activeQ ||
      eliminatedIndices.includes(optIndex)
    ) {
      return;
    }

    onStopSpeech();
    setIsTimerArmed(true);

    const isCorrect = optIndex === activeQ.correctIndex;
    if (!isCorrect) {
      onPlaySound('wrong');
      setStreakRescueState({ reason: 'wrong', wrongOptionIdx: optIndex });
      return;
    }

    setSelectedOption(optIndex);
    onQuestionPlayed(activeQ.question);
    onAnswerOutcome(true);
    onPlaySound('correct');

    const updatedRecord = [...answersRecord, true];
    setAnswersRecord(updatedRecord);

    advanceTimerRef.current = window.setTimeout(() => {
      proceedToNext(updatedRecord);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-4 py-4 max-w-lg mx-auto w-full"
      >
        <div className="w-full bg-white/95 rounded-[28px] p-6 shadow-[0_14px_34px_-8px_rgba(30,58,138,0.16)] border-2 border-white flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#FFE675] border-2 border-[#F5B935] flex items-center justify-center text-[#164A9E] mb-3">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E]">
            Loading {categoryTitle}...
          </h2>
          <p className="text-sm text-[#5C7299] mt-1">
            Preparing 6 fresh multiple-choice questions just for this pack.
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage && total === 0) {
    return (
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-4 py-4 max-w-lg mx-auto w-full"
      >
        <div className="w-full bg-white/95 rounded-[28px] p-6 shadow-[0_14px_34px_-8px_rgba(30,58,138,0.16)] border-2 border-white flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-[#FFE8EC] text-[#C81E3D] flex items-center justify-center mb-3">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-display text-xl font-extrabold text-[#14274E]">
            Unable to Load Quiz
          </h2>
          <p className="text-xs sm:text-sm text-[#5C7299] mt-1.5 break-words w-full">
            {errorMessage}
          </p>
          <div className="w-full flex flex-col sm:flex-row gap-2.5 mt-5">
            <button
              type="button"
              onClick={onStartNewRound}
              className="flex-1 min-h-[44px] rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={onOpenCategories}
              className="flex-1 min-h-[44px] rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] border border-[#B0D4FA] text-[#14274E] font-display font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>All Packs</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeQ) return null;

  if (isRoundOver) {
    const finalScore = answersRecord.filter(Boolean).length;
    const isPerfect = total === 6 && finalScore === 6;
    const baseCoins =
      finalScore * COINS_PER_CORRECT + (isPerfect ? PERFECT_BONUS_COINS : 0);
    const basePoints =
      finalScore * POINTS_PER_CORRECT + (isPerfect ? PERFECT_BONUS_POINTS : 0);
    const displayedCoins = coinsDoubledForRound ? baseCoins * 2 : baseCoins;
    const displayedPoints = coinsDoubledForRound ? basePoints * 2 : basePoints;

    return (
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-4 py-3 max-w-xl mx-auto w-full overflow-hidden"
      >
        <div className="w-full bg-white/95 rounded-[30px] p-5 sm:p-6 shadow-[0_14px_34px_-8px_rgba(30,58,138,0.18)] border-2 border-white flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#FFE675] border-4 border-[#F5B935] flex items-center justify-center text-[#B45309] shadow-sm">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14274E] mt-2.5">
            {isPerfect ? 'Perfect Round! 6/6' : t.quizCompleteTitle}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#5C7299] mt-0.5">
            {categoryTitle}
            {isPerfect ? ' · +20 Coins & +200 Pts Perfect Bonus included!' : ''}
          </p>

          <div className="w-full grid grid-cols-3 gap-2.5 my-3.5">
            <div className="rounded-2xl bg-[#E5F0FF] border border-[#B2CEFB] p-2.5">
              <div className="text-[11px] font-semibold text-[#164A9E]">
                {t.scoreLabel}
              </div>
              <div className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums mt-0.5">
                {finalScore} / {total}
              </div>
            </div>
            <div className="rounded-2xl bg-[#FFF6CC] border border-[#F3D877] p-2.5">
              <div className="text-[11px] font-semibold text-[#7A5400]">
                Coins Earned
              </div>
              <div className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums mt-0.5 flex items-center justify-center gap-1">
                <span>+{displayedCoins}</span>
                <GoldCoinIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] p-2.5">
              <div className="text-[11px] font-semibold text-[#047857]">
                Rank Points
              </div>
              <div className="font-display text-xl sm:text-2xl font-extrabold text-[#065F46] tabular-nums mt-0.5">
                +{displayedPoints}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-3.5">
            {Array.from({ length: total }).map((_, idx) => {
              const answered = idx < answersRecord.length;
              const earned = answersRecord[idx] === true;
              return (
                <GoldCoinIcon
                  key={idx}
                  className="w-7 h-7"
                  dimmed={!answered}
                  missed={answered && !earned}
                />
              );
            })}
          </div>

          {/* Rewarded Video Ad CTA: 2x Round Coins & Points */}
          {baseCoins > 0 && !coinsDoubledForRound && (
            <button
              type="button"
              onClick={() => onWatchDoubleRoundAd(baseCoins, basePoints)}
              className="w-full min-h-[48px] mb-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#FF8C1A] to-[#F59E0B] hover:from-[#EB7C0E] hover:to-[#D97706] text-white font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_4px_0_#B45309] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span className="truncate">
                2x Round Coins &amp; Points (Watch Video)
              </span>
              <GoldCoinIcon className="w-5 h-5 shrink-0" />
            </button>
          )}

          {coinsDoubledForRound && (
            <div className="mb-3 text-xs sm:text-sm font-extrabold text-[#1E7E1C] flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>2x Round Coins &amp; Points Applied!</span>
            </div>
          )}

          <div className="w-full flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onStartNewRound}
              className="flex-1 min-h-[46px] flex items-center justify-center gap-2 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-sm sm:text-base shadow-[0_4px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.playAgain}</span>
            </button>
            <button
              type="button"
              onClick={onOpenCategories}
              className="flex-1 min-h-[46px] flex items-center justify-center gap-2 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] border-2 border-[#B0D4FA] text-[#14274E] font-display font-bold text-sm sm:text-base transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Quiz Packs</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressText = t.questionProgressPill
    .replace('{current}', String(currentIdx + 1))
    .replace('{total}', String(total));

  const circleRadius = 21;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const timerRatio = Math.min(
    1,
    Math.max(0, secondsLeft / Math.max(1, questionMaxSeconds))
  );
  const strokeOffset = circleCircumference - timerRatio * circleCircumference;
  const isTimeLow =
    !hasAnswered && freezeSecondsLeft === 0 && secondsLeft > 0 && secondsLeft <= 6;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-3 sm:px-5 py-1.5 sm:py-2 max-w-3xl mx-auto w-full overflow-hidden"
    >
      {/* Quiz Top Bar */}
      <div className="shrink-0 flex items-center justify-between gap-1.5 bg-[#FFE675] border-2 border-[#F5B935] rounded-2xl px-2.5 py-1 shadow-sm">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="font-display text-xs sm:text-base font-extrabold text-[#164A9E] truncate">
            {progressText}
          </span>
          <span className="hidden sm:inline text-xs font-bold text-[#3A5A8C] truncate">
            · {categoryTitle}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-extrabold text-[#C2410C] tabular-nums shrink-0">
            <Flame className="w-3.5 h-3.5 fill-[#FB923C]" />
            <span>{currentStreak}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label={t.quizSettingsBtn}
            className="w-8 h-8 rounded-xl bg-white/75 hover:bg-white text-[#164A9E] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleListen}
            aria-label={isSpeaking ? t.stop : t.listen}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white border-2 transition-transform active:scale-95 cursor-pointer ${
              isSpeaking
                ? 'bg-[#FF8C1A] border-[#C85C00] animate-pulse'
                : 'bg-[#4DA3FF] hover:bg-[#2F8FFF] border-[#2574D4]'
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <div
            className={`relative w-10 h-10 flex items-center justify-center rounded-full border-2 shadow-xs transition-colors ${
              freezeSecondsLeft > 0
                ? 'bg-[#0EA5E9] border-[#0369A1]'
                : isTimeLow
                ? 'bg-[#EF4444] border-[#991B1B]'
                : 'bg-[#FF8C1A] border-[#C85C00]'
            }`}
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
            <span className="relative font-display text-xs sm:text-sm font-extrabold text-white tabular-nums">
              {secondsLeft}
            </span>
            {freezeSecondsLeft > 0 ? (
              <Snowflake className="absolute -top-1 -right-1 w-3.5 h-3.5 text-white bg-[#0369A1] rounded-full p-0.5" />
            ) : (
              <Clock
                className={`absolute -top-1 -right-1 w-3.5 h-3.5 text-white rounded-full p-0.5 ${
                  isTimeLow ? 'bg-[#991B1B]' : 'bg-[#E66A00]'
                }`}
              />
            )}
          </div>
        </div>
      </div>

      {/* SVG Story Illustration + Wooden Signboard */}
      <div className="shrink-0 flex flex-col items-center my-1">
        <div className="w-full max-w-md h-20 sm:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-[#CBE7FF]">
          <StorySceneSvg
            theme={activeQ.storyTheme}
            label={activeQ.illustrationAlt}
          />
        </div>

        <div className="wood-signboard relative -mt-3 w-full max-w-lg rounded-2xl px-4 py-2 text-center">
          <h2 className="font-display text-sm sm:text-lg font-extrabold text-[#FFF8E7] leading-snug text-balance">
            {activeQ.question}
          </h2>
        </div>
      </div>

      {/* Clue / Reading / Feedback Strip */}
      <div className="shrink-0 min-h-[26px] flex items-center justify-center">
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
                ? `${t.correctFeedback} (+10 coins · +100 pts)`
                : t.wrongFeedback}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-bold text-[#14274E]">
              {activeQ.reference}
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
        ) : showVerseClue ? (
          <div className="inline-flex items-center gap-1.5 bg-[#FFFBEB] border border-[#F59E0B] rounded-full px-3 py-0.5 shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-[#B45309]" />
            <span className="text-xs font-extrabold text-[#78350F]">
              Hint: Read {activeQ.reference}
            </span>
          </div>
        ) : freezeSecondsLeft > 0 ? (
          <div className="inline-flex items-center gap-1.5 bg-[#E0F2FE] border border-[#38BDF8] rounded-full px-3 py-0.5 shadow-xs">
            <Snowflake className="w-3.5 h-3.5 text-[#0369A1]" />
            <span className="text-xs font-extrabold text-[#0369A1] tabular-nums">
              Timer Frozen ({freezeSecondsLeft}s) · +15s added
            </span>
          </div>
        ) : !isTimerArmed ? (
          <div className="inline-flex items-center gap-1.5 bg-white/85 border border-[#BFD9FA] rounded-full px-3 py-0.5 shadow-xs">
            <Volume2 className="w-3.5 h-3.5 text-[#2F8FFF] animate-pulse" />
            <span className="text-[11px] font-bold text-[#164A9E]">
              {t.readingQuestionHint}
            </span>
          </div>
        ) : (
          <span className="text-[11px] opacity-0 select-none">·</span>
        )}
      </div>

      {/* 4 Stacked Colorful Answer Pills */}
      <div className="flex-1 min-h-0 flex flex-col justify-center gap-1.5 max-w-lg mx-auto w-full">
        {activeQ.options.map((optionText, idx) => {
          const theme = OPTION_THEMES[idx];
          const isEliminated = eliminatedIndices.includes(idx);
          const isChosen = selectedOption === idx;
          const isCorrect = activeQ.correctIndex === idx;

          let stateClasses = `${theme.bg} ${theme.border}`;
          if (isEliminated && !hasAnswered) {
            stateClasses =
              'bg-slate-200 border-slate-300 opacity-35 cursor-not-allowed';
          } else if (hasAnswered) {
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
              disabled={hasAnswered || isEliminated || isResolvingMiss}
              onClick={() => handleSelectOption(idx)}
              className={`w-full min-h-[42px] sm:min-h-[46px] flex items-center justify-between gap-3 rounded-full border-2 px-2.5 sm:px-3.5 py-1 shadow-[0_3px_0_rgba(20,39,78,0.18)] transition-all duration-150 cursor-pointer disabled:cursor-default ${stateClasses}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-7 h-7 rounded-full bg-white flex items-center justify-center font-display text-sm font-extrabold shrink-0 ${
                    isEliminated && !hasAnswered
                      ? 'text-slate-400'
                      : theme.letterText
                  }`}
                >
                  {OPTION_LETTERS[idx]}
                </span>
                <span
                  className={`font-display text-sm sm:text-base font-bold text-start truncate ${
                    isEliminated && !hasAnswered
                      ? 'text-slate-500 line-through'
                      : 'text-white'
                  }`}
                >
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

      {/* Three In-Quiz Lifeline Buttons below Answer Options */}
      <div className="shrink-0 grid grid-cols-3 gap-1.5 sm:gap-2 max-w-lg mx-auto w-full pt-1">
        <button
          type="button"
          onClick={handleLifeline5050}
          disabled={used5050 || hasAnswered || isResolvingMiss}
          className={`min-h-[42px] rounded-2xl border-2 px-2 py-1 flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-45 disabled:cursor-default ${
            totalCoins >= LIFELINE_5050_COST && !used5050
              ? 'bg-white hover:bg-[#EFF6FF] border-[#93C5FD] text-[#14274E]'
              : 'bg-white/70 border-slate-200 text-slate-500'
          }`}
        >
          <span className="inline-flex items-center gap-1 font-display text-[11px] sm:text-xs font-extrabold whitespace-nowrap">
            <Split className="w-3.5 h-3.5 text-[#2F8FFF]" />
            <span>50/50 Hint</span>
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#7A5400] tabular-nums">
            <GoldCoinIcon className="w-3 h-3" />
            <span>{used5050 ? 'Used' : `${LIFELINE_5050_COST} Coins`}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={handleLifelineFreeze}
          disabled={usedFreeze || hasAnswered || isResolvingMiss}
          className={`min-h-[42px] rounded-2xl border-2 px-2 py-1 flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-45 disabled:cursor-default ${
            totalCoins >= LIFELINE_FREEZE_COST && !usedFreeze
              ? 'bg-white hover:bg-[#E0F2FE] border-[#7DD3FC] text-[#14274E]'
              : 'bg-white/70 border-slate-200 text-slate-500'
          }`}
        >
          <span className="inline-flex items-center gap-1 font-display text-[11px] sm:text-xs font-extrabold whitespace-nowrap">
            <Snowflake className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>+15s Freeze</span>
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#7A5400] tabular-nums">
            <GoldCoinIcon className="w-3 h-3" />
            <span>{usedFreeze ? 'Used' : `${LIFELINE_FREEZE_COST} Coins`}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={handleLifelineVerseClue}
          disabled={showVerseClue || hasAnswered || isResolvingMiss}
          className={`min-h-[42px] rounded-2xl border-2 px-2 py-1 flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-45 disabled:cursor-default ${
            totalCoins >= LIFELINE_CLUE_COST && !showVerseClue
              ? 'bg-white hover:bg-[#FFFBEB] border-[#FCD34D] text-[#14274E]'
              : 'bg-white/70 border-slate-200 text-slate-500'
          }`}
        >
          <span className="inline-flex items-center gap-1 font-display text-[11px] sm:text-xs font-extrabold whitespace-nowrap">
            <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Verse Clue</span>
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#7A5400] tabular-nums">
            <GoldCoinIcon className="w-3 h-3" />
            <span>{showVerseClue ? 'Shown' : `${LIFELINE_CLUE_COST} Coins`}</span>
          </span>
        </button>
      </div>

      {/* 6-Gold-Coin Progress Tracker */}
      <div className="shrink-0 flex items-center justify-center gap-2 pt-1 pb-0.5">
        {Array.from({ length: total }).map((_, idx) => {
          const answered = idx < answersRecord.length;
          const correct = answersRecord[idx] === true;
          const isCurrent = idx === currentIdx && !hasAnswered;
          return (
            <div
              key={idx}
              className={`transition-transform ${
                answered && correct
                  ? 'scale-110'
                  : isCurrent
                  ? 'scale-105 ring-2 ring-[#F59E0B] rounded-full'
                  : ''
              }`}
            >
              <GoldCoinIcon
                className="w-5 h-5 sm:w-6 sm:h-6"
                dimmed={!answered}
                missed={answered && !correct}
              />
            </div>
          );
        })}
      </div>

      {/* Wrong Answer / Out of Time Popup: Save Your Streak! */}
      {streakRescueState && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-streak-modal-title"
          className="fixed inset-0 z-50 bg-[#14274E]/65 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-[28px] max-w-sm w-full p-5 shadow-[0_24px_60px_rgba(15,30,61,0.4)] border-2 border-white text-center space-y-3.5">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FFE4D6] border-2 border-[#FB923C] text-[#EA580C] flex items-center justify-center">
              <Flame className="w-7 h-7 fill-[#FB923C]" />
            </div>

            <div>
              <div className="text-xs font-extrabold text-[#EA580C] inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {streakRescueState.reason === 'timeout'
                    ? "Time's Up!"
                    : 'Oops, Not Quite!'}
                </span>
              </div>
              <h2
                id="save-streak-modal-title"
                className="font-display text-xl font-extrabold text-[#14274E] mt-0.5"
              >
                Save Your Streak!
              </h2>
              <p className="text-xs sm:text-sm text-[#47608B] mt-1">
                Spend 50 Coins OR watch 1 short video to continue free and keep your{' '}
                <strong className="text-[#14274E]">{currentStreak}</strong> streak alive!
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSpendSaveStreakCoins}
                className={`w-full min-h-[46px] px-4 py-2 rounded-full font-display font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  totalCoins >= SAVE_STREAK_COIN_COST
                    ? 'bg-[#FFE675] hover:bg-[#FFD94A] border-2 border-[#F5B935] text-[#7A5400]'
                    : 'bg-slate-100 border border-slate-300 text-slate-500'
                }`}
              >
                <GoldCoinIcon className="w-5 h-5" />
                <span>Spend {SAVE_STREAK_COIN_COST} Coins to Continue</span>
              </button>

              <button
                type="button"
                onClick={onWatchSaveStreakAd}
                className="w-full min-h-[46px] px-4 py-2 rounded-full bg-gradient-to-r from-[#FF8C1A] to-[#F59E0B] hover:from-[#EB7C0E] hover:to-[#D97706] text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-[0_3px_0_#B45309] active:translate-y-[1px] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span>Watch 1 Short Video to Continue Free</span>
              </button>

              <button
                type="button"
                onClick={handleDeclineStreakRescue}
                className="w-full py-2 text-xs font-bold text-[#5C7299] hover:text-[#14274E] cursor-pointer"
              >
                No thanks, continue &amp; reveal answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
