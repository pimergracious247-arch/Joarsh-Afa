import type React from 'react';
import { Flame, Trophy } from 'lucide-react';
import type { PlayerProfile, UserStats } from '../types';
import { BibleAvatarIcon } from './BibleAvatarIcon';
import { GoldCoinIcon } from './GoldCoinIcon';

interface TopBarProps {
  profile: PlayerProfile;
  stats: UserStats;
  onOpenProfileModal: () => void;
  onOpenLeaderboard: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  profile,
  stats,
  onOpenProfileModal,
  onOpenLeaderboard,
}) => {
  return (
    <header className="relative z-20 shrink-0 w-full bg-white/85 backdrop-blur-md border-b border-[#DCEBFF] px-3 sm:px-5 py-1.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenProfileModal}
          className="min-h-[36px] flex items-center gap-2 rounded-full pe-2.5 hover:bg-[#EDF5FF] transition-colors cursor-pointer min-w-0"
          aria-label="Edit player profile"
        >
          <BibleAvatarIcon avatarId={profile.avatarId} size="sm" />
          <span className="font-display text-xs sm:text-sm font-extrabold text-[#14274E] truncate max-w-[110px] sm:max-w-[160px]">
            {profile.displayName || 'Pilgrim'}
          </span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="min-h-[34px] inline-flex items-center gap-1 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] px-2.5 py-1 text-xs font-extrabold text-[#164A9E] tabular-nums transition-colors cursor-pointer whitespace-nowrap"
            aria-label="Open Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{stats.totalScore.toLocaleString()} pts</span>
          </button>

          <span
            className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-[#C2410C] tabular-nums whitespace-nowrap"
            title="Best Streak"
          >
            <Flame className="w-3.5 h-3.5 fill-[#FB923C] text-[#EA580C]" />
            <span>{stats.bestStreak}</span>
          </span>

          <div
            className="min-h-[34px] inline-flex items-center gap-1.5 rounded-full bg-[#FFF4C4] border border-[#F5B935] px-2.5 py-1 shadow-2xs"
            aria-label={`Coin balance: ${stats.totalCoins}`}
          >
            <GoldCoinIcon className="w-4 h-4 shrink-0" />
            <span className="font-display text-xs sm:text-sm font-extrabold text-[#7A5400] tabular-nums">
              {stats.totalCoins.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
