import type React from 'react';
import { useMemo, useState } from 'react';
import { Pencil, Trophy } from 'lucide-react';
import { buildLeaderboardEntries } from '../data/leaderboardData';
import type { UIStrings } from '../data/translations';
import type { LanguageCode, LeaderboardMode, PlayerProfile, UserStats } from '../types';
import { BibleAvatarIcon, RankMedal } from './BibleAvatarIcon';
import { PaginationBar } from './PaginationBar';

const RANKS_PER_PAGE = 5;
const BRACKET_LABELS = ['1–5', '6–10', '11–15', '16–20'];

interface LeaderboardScreenProps {
  profile: PlayerProfile;
  stats: UserStats;
  lang: LanguageCode;
  t: UIStrings;
  onEditProfile: () => void;
  onStartQuiz: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  profile,
  stats,
  lang,
  t,
  onEditProfile,
  onStartQuiz,
}) => {
  const [mode, setMode] = useState<LeaderboardMode>('weekly');
  const [page, setPage] = useState(0);

  const { top20, userRank, pointsToNextRank } = useMemo(
    () =>
      buildLeaderboardEntries({
        mode,
        playerProfile: profile,
        userWeeklyPoints: stats.weeklyScore,
        userAllTimePoints: stats.totalScore,
        userPerfectRounds: stats.perfectRounds,
        quizzesCompleted: stats.quizzesCompleted,
        defaultPilgrimName: t.pilgrimDefault,
      }),
    [
      mode,
      profile,
      stats.weeklyScore,
      stats.totalScore,
      stats.perfectRounds,
      stats.quizzesCompleted,
      t.pilgrimDefault,
    ]
  );

  const totalPages = Math.max(1, Math.ceil(top20.length / RANKS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageEntries = top20.slice(safePage * RANKS_PER_PAGE, (safePage + 1) * RANKS_PER_PAGE);
  const userInCurrentPage = pageEntries.some((e) => e.isCurrentUser);

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-4 py-2 sm:py-3 max-w-3xl mx-auto w-full overflow-hidden"
    >
      <div className="shrink-0">
        <header className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FFE675] border-2 border-[#F5B935] text-[#B45309] flex items-center justify-center shadow-xs shrink-0">
              <Trophy className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-lg sm:text-2xl font-extrabold text-[#14274E] tracking-tight truncate">
                {t.leaderboardBtn}
              </h1>
              <p className="text-[11px] sm:text-xs font-semibold text-[#47608B] tabular-nums truncate">
                {t.yourRankLabel.replace('{rank}', String(userRank))}
                {pointsToNextRank !== null
                  ? ` · ${t.ptsToClimb.replace('{pts}', pointsToNextRank.toLocaleString())}`
                  : ` · ${t.championRank}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onEditProfile}
            className="min-h-[38px] px-3 py-1.5 rounded-full bg-white/95 hover:bg-white border border-[#BFD9FA] text-[#14274E] font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <BibleAvatarIcon avatarId={profile.avatarId} size="sm" t={t} />
            <span className="truncate max-w-[100px]">{profile.displayName || t.pilgrimDefault}</span>
            <Pencil className="w-3.5 h-3.5 text-[#2F8FFF]" />
          </button>
        </header>

        <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/85 rounded-2xl border border-[#DCEBFF] mb-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('weekly');
              setPage(0);
            }}
            className={`min-h-[38px] rounded-xl font-display text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
              mode === 'weekly' ? 'bg-[#2A8CFF] text-white shadow-xs' : 'text-[#47608B] hover:text-[#14274E]'
            }`}
          >
            {t.weeklyChallengeTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('alltime');
              setPage(0);
            }}
            className={`min-h-[38px] rounded-xl font-display text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
              mode === 'alltime' ? 'bg-[#2A8CFF] text-white shadow-xs' : 'text-[#47608B] hover:text-[#14274E]'
            }`}
          >
            {t.allTimeScholarsTab}
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2 px-3 py-1 text-[11px] font-bold text-[#47608B]">
          <span className="col-span-2">{t.colRank}</span>
          <span className="col-span-5">{t.colScholar}</span>
          <span className="col-span-3 text-end">{t.colPoints}</span>
          <span className="col-span-2 text-end">{t.colPerfect}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center gap-1.5">
        {pageEntries.map((entry) => (
          <div
            key={entry.id}
            className={`grid grid-cols-12 items-center gap-2 rounded-2xl px-3 py-1.5 sm:py-2 border transition-colors ${
              entry.isCurrentUser
                ? 'bg-[#FFF7D6] border-2 border-[#F5B935] shadow-sm'
                : 'bg-white/95 border-white shadow-[0_4px_12px_-6px_rgba(30,58,138,0.12)]'
            }`}
          >
            <div className="col-span-2 flex items-center">
              <RankMedal rank={entry.rank} />
            </div>
            <div className="col-span-5 flex items-center gap-2 min-w-0">
              <BibleAvatarIcon avatarId={entry.avatarId} size="sm" t={t} />
              <div className="min-w-0">
                <div className="font-display text-xs sm:text-sm font-extrabold text-[#14274E] truncate">
                  {entry.displayName}
                  {entry.isCurrentUser ? ` ${t.youSuffix}` : ''}
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

        {!userInCurrentPage && (
          <div className="mt-1 rounded-2xl bg-[#FFF7D6] border-2 border-[#F5B935] px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <RankMedal rank={userRank} />
              <BibleAvatarIcon avatarId={profile.avatarId} size="sm" t={t} />
              <span className="font-display text-xs sm:text-sm font-extrabold text-[#14274E] truncate">
                {profile.displayName || t.pilgrimDefault} {t.youSuffix}
              </span>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="font-display text-xs sm:text-sm font-extrabold text-[#164A9E] tabular-nums">
                {(mode === 'weekly' ? stats.weeklyScore : stats.totalScore).toLocaleString()}{' '}
                {t.ptsUnit}
              </span>
              {userRank > 20 && (
                <button
                  type="button"
                  onClick={onStartQuiz}
                  className="px-3 py-1 rounded-full bg-[#2A8CFF] text-white font-display font-bold text-xs cursor-pointer"
                >
                  {t.playBtn}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <PaginationBar
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        lang={lang}
        t={t}
        customLabels={BRACKET_LABELS}
      />
    </div>
  );
};
