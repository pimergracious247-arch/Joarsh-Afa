import React, { useEffect, useState } from 'react';
import { Flame, Play, Sparkles, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import { RewardAdPlacement } from '../types';
import { UIStrings } from '../data/translations';
import { ADMOB_CONFIG } from '../config/admob';
import { GoldCoinIcon } from './GoldCoinIcon';

interface RewardVideoAdModalProps {
  placement: RewardAdPlacement | null;
  t: UIStrings;
  onUserEarnedReward: () => void;
  onCancel: () => void;
}

const AD_DURATION_SECONDS = 8;

export const RewardVideoAdModal: React.FC<RewardVideoAdModalProps> = ({
  placement,
  t,
  onUserEarnedReward,
  onCancel,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_SECONDS);
  const [muted, setMuted] = useState(false);

  const isOpen = placement !== null;

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(AD_DURATION_SECONDS);
      return;
    }

    setSecondsLeft(AD_DURATION_SECONDS);
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isOpen]);

  if (!placement) return null;

  const isRewardReady = secondsLeft === 0;
  const progressPct =
    ((AD_DURATION_SECONDS - secondsLeft) / AD_DURATION_SECONDS) * 100;

  let headingText = '+100 Free Coins';
  let badgeText = `+${100} Coins`;
  let claimText = 'Claim +100 Free Coins';

  if (placement.kind === 'free-coins') {
    headingText = `Watch & Earn +${placement.coins} Free Coins`;
    badgeText = `+${placement.coins} Coins`;
    claimText = `Claim +${placement.coins} Coins`;
  } else if (placement.kind === 'double-round') {
    headingText = '2x Round Coins & Points';
    badgeText = `+${placement.baseCoins} Coins · +${placement.basePoints} Pts`;
    claimText = `Claim 2x (+${placement.baseCoins} Coins & +${placement.basePoints} Pts)`;
  } else if (placement.kind === 'save-streak') {
    headingText = 'Save Your Streak Free!';
    badgeText = 'Streak Protected · Continue Round';
    claimText = 'Continue Without Losing Streak';
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-video-title"
      data-ad-provider="google-admob"
      data-ad-app-id={ADMOB_CONFIG.appId}
      data-ad-unit-id={ADMOB_CONFIG.rewardedAdUnitId}
      className="fixed inset-0 z-50 bg-[#0F1E3D]/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-[30px] max-w-md w-full overflow-hidden shadow-[0_24px_60px_rgba(15,30,61,0.45)] border-2 border-white">
        {/* Top Ad Status Bar */}
        <div className="bg-[#14274E] text-white px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-[#FFE675] text-[#14274E] text-[11px] font-extrabold">
              {t.adBannerLabel}
            </span>
            <span className="text-xs font-bold text-sky-100 truncate">
              {isRewardReady
                ? t.rewardAdUnlockedTitle
                : t.rewardAdCountdown.replace('{sec}', String(secondsLeft))}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? t.soundOn : t.soundOff}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
            >
              {muted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              aria-label={t.closeLabel}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Family-Friendly Video Ad Viewport */}
        <div className="relative bg-gradient-to-br from-[#2B8CFF] via-[#5FB3FF] to-[#FFE675] p-5 text-center text-[#14274E]">
          <div className="bg-white/95 rounded-2xl p-4 shadow-md border border-white space-y-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FFE675] border-2 border-[#F5B935] flex items-center justify-center shadow-xs">
              {isRewardReady ? (
                <Sparkles className="w-7 h-7 text-[#B45309]" />
              ) : placement.kind === 'save-streak' ? (
                <Flame className="w-7 h-7 text-[#EA580C] fill-[#FB923C]" />
              ) : placement.kind === 'double-round' ? (
                <Trophy className="w-7 h-7 text-[#B45309]" />
              ) : (
                <Play className="w-7 h-7 text-[#14274E] fill-[#14274E] ms-0.5" />
              )}
            </div>
            <h2
              id="reward-video-title"
              className="font-display text-lg sm:text-xl font-extrabold text-[#14274E]"
            >
              {headingText}
            </h2>
            <p className="text-xs sm:text-sm text-[#47608B] font-medium">
              {t.rewardAdSponsor}
            </p>

            {/* Reward Preview */}
            <div className="mt-2 inline-flex items-center gap-2 bg-[#FFF8D6] border border-[#F3D877] rounded-full px-4 py-1.5">
              <GoldCoinIcon className="w-5 h-5" />
              <span className="font-display text-xs sm:text-sm font-extrabold text-[#7A5400] tabular-nums">
                {badgeText}
              </span>
            </div>
          </div>

          {/* Animated Video Progress Bar */}
          <div className="mt-4 w-full h-2.5 rounded-full bg-white/45 overflow-hidden">
            <div
              className="h-full bg-[#14274E] rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-white flex flex-col gap-2">
          <button
            type="button"
            disabled={!isRewardReady}
            onClick={onUserEarnedReward}
            className={`w-full min-h-[48px] px-5 py-2.5 rounded-full font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              isRewardReady
                ? 'bg-[#49C946] hover:bg-[#3FB83C] text-white shadow-[0_4px_0_#238820] active:translate-y-[1px] cursor-pointer'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <GoldCoinIcon className="w-5 h-5" dimmed={!isRewardReady} />
            <span>
              {isRewardReady
                ? claimText
                : t.rewardAdCountdown.replace('{sec}', String(secondsLeft))}
            </span>
          </button>

          {!isRewardReady && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-xs font-bold text-[#5C7299] hover:text-[#14274E] cursor-pointer"
            >
              {t.rewardAdCancel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
