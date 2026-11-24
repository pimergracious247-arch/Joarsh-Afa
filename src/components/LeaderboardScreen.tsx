import React, { useMemo, useState } from 'react';
import { Pencil, Trophy } from 'lucide-react';
import { PlayerProfile, UserStats } from '../types';
import { buildLeaderboardEntries } from '../data/leaderboardData';
import { BibleAvatarIcon, RankMedal } from './BibleAvatarIcon';

interface LeaderboardScreenProps {
  profile: PlayerProfile;
  stats: UserStats;
  onEditProfile: () => void;
  onStartQuiz: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  profile,
  stats,
  onEditProfile,
  onStartQuiz,
}) => {
  const [mode, setMode] = useState<'weekly' | 'alltime'>('weekly');

  const { top20, userRank, pointsToNextRank } = useMemo(
    () =>
      buildLeaderboardEntries({
        mode,
        playerProfile: profile,
        userWeeklyPoints: stats.weeklyScore,
        userAllTimePoints: stats.totalScore,
        userPerfectRounds: stats.perfectRounds,
        quizzesCompleted: stats.quizzesCompleted,
      }),
    [
      mode,
      profile,
      stats.weeklyScore,
      stats.totalScore,
      stats.perfectRounds,
      stats.quizzesCompleted,
    ]
  );

  return (
    <div className="relative z-10 flex-1 min-h-0 flex flex-col px-4 py-2.5 sm:py-3 max-w-3xl mx-auto w-full overflow-hidden">
      {/* Header + Edit Profile */}
      <header className="shrink-0 flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-2xl bg-[#FFE675] border-2 border-[#F5B935] text-[#B45309] flex items-center justify-center shadow-xs">
            <Trophy className="w-5 h-5" />
          </span>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tracking-tight">
              Leaderboard
            </h1>
            <p className="text-xs font-semibold text-[#47608B] tabular-nums">
              Your Rank: #{userRank}
              {pointsToNextRank !== null
                ? ` · ${pointsToNextRank.toLocaleString()} pts to climb`
                : ' · #1 Champion!'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEditProfile}
          className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white border border-[#BFD9FA] text-[#14274E] font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
        >
          <BibleAvatarIcon avatarId={profile.avatarId} size="sm" />
          <span className="truncate max-w-[100px]">
            {profile.displayName || 'Pilgrim'}
          </span>
          <Pencil className="w-3.5 h-3.5 text-[#2F8FFF]" />
        </button>
      </header>

      {/* Filter Tabs: Weekly Challenge vs All-Time Top Scholars */}
      <div className="shrink-0 grid grid-cols-2 gap-1.5 p-1 bg-white/85 rounded-2xl border border-[#DCEBFF] mb-2.5">
        <button
          type="button"
          onClick={() => setMode('weekly')}
          className={`min-h-[40px] rounded-xl font-display text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
            mode === 'weekly'
              ? 'bg-[#2A8CFF] text-white shadow-xs'
              : 'text-[#47608B] hover:text-[#14274E]'
          }`}
        >
          Weekly Challenge
        </button>
        <button
          type="button"
          onClick={() => setMode('alltime')}
          className={`min-h-[40px] rounded-xl font-display text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
            mode === 'alltime'
              ? 'bg-[#2A8CFF] text-white shadow-xs'
              : 'text-[#47608B] hover:text-[#14274E]'
          }`}
        >
          All-Time Top Scholars
        </button>
      </div>

      {/* Column Headers */}
      <div className="shrink-0 grid grid-cols-12 gap-2 px-3.5 py-1.5 text-[11px] font-bold text-[#47608B]">
        <span className="col-span-2">Rank</span>
        <span className="col-span-5">Scholar</span>
        <span className="col-span-3 text-end">Points</span>
        <span className="col-span-2 text-end">6/6</span>
      </div>

      {/* Top 20 Scrollable Ranked List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5 pb-3">
        {top20.map((entry) => (
          <div
            key={entry.id}
            className={`grid grid-cols-12 items-center gap-2 rounded-2xl px-3 py-2 border transition-colors ${
              entry.isCurrentUser
                ? 'bg-[#FFF7D6] border-2 border-[#F5B935] shadow-sm'
                : 'bg-white/95 border-white shadow-[0_4px_12px_-6px_rgba(30,58,138,0.12)]'
            }`}
          >
            <div className="col-span-2 flex items-center">
              <RankMedal rank={entry.rank} />
            </div>

            <div className="col-span-5 flex items-center gap-2 min-w-0">
              <BibleAvatarIcon avatarId={entry.avatarId} size="sm" />
              <div className="min-w-0">
                <div className="font-display text-xs sm:text-sm font-extrabold text-[#14274E] truncate">
                  {entry.displayName}
                  {entry.isCurrentUser ? ' (You)' : ''}
                </div>
              </div>
            </div>

            <div className="col-span-3 text-end font-display text-xs sm:text-sm font-extrabold text-[#164A9E] tabular-nums">
              {entry.totalPoints.toLocaleString()}
            </div>

            <div className="col-span-2 text-end text-xs font-bold text-[#5C7299] tabular-nums">
              {entry.perfectRounds}
            </div>
          </div>
        ))}

        {userRank > 20 && (
          <div className="mt-2 rounded-2xl bg-[#FFF7D6] border-2 border-[#F5B935] px-3.5 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <RankMedal rank={userRank} />
              <BibleAvatarIcon avatarId={profile.avatarId} size="sm" />
              <span className="font-display text-sm font-extrabold text-[#14274E] truncate">
                {profile.displayName || 'Pilgrim'} (You)
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-display text-sm font-extrabold text-[#164A9E] tabular-nums">
                {(mode === 'weekly'
                  ? stats.weeklyScore
                  : stats.totalScore
                ).toLocaleString()}{' '}
                pts
              </span>
              <button
                type="button"
                onClick={onStartQuiz}
                className="px-3 py-1.5 rounded-full bg-[#2A8CFF] text-white font-display font-bold text-xs cursor-pointer"
              >
                Play
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
