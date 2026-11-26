import type { AvatarId, LeaderboardEntry, LeaderboardMode, PlayerProfile } from '../types';

interface ScholarSeed {
  id: string;
  displayName: string;
  avatarId: AvatarId;
  baseWeeklyPoints: number;
  baseAllTimePoints: number;
  basePerfectRounds: number;
}

const COMPETING_SCHOLARS: ScholarSeed[] = [
  { id: 'npc-1', displayName: 'Miriam K.', avatarId: 'olive', baseWeeklyPoints: 2950, baseAllTimePoints: 14200, basePerfectRounds: 14 },
  { id: 'npc-2', displayName: 'Caleb N.', avatarId: 'shield', baseWeeklyPoints: 2680, baseAllTimePoints: 12900, basePerfectRounds: 12 },
  { id: 'npc-3', displayName: 'Esther V.', avatarId: 'crown', baseWeeklyPoints: 2420, baseAllTimePoints: 11400, basePerfectRounds: 11 },
  { id: 'npc-4', displayName: 'Daniel O.', avatarId: 'scroll', baseWeeklyPoints: 2150, baseAllTimePoints: 10200, basePerfectRounds: 9 },
  { id: 'npc-5', displayName: 'Ruth M.', avatarId: 'dove', baseWeeklyPoints: 1920, baseAllTimePoints: 9100, basePerfectRounds: 8 },
  { id: 'npc-6', displayName: 'Gideon T.', avatarId: 'shield', baseWeeklyPoints: 1710, baseAllTimePoints: 7900, basePerfectRounds: 7 },
  { id: 'npc-7', displayName: 'Hannah S.', avatarId: 'dove', baseWeeklyPoints: 1520, baseAllTimePoints: 6800, basePerfectRounds: 6 },
  { id: 'npc-8', displayName: 'Josiah P.', avatarId: 'crown', baseWeeklyPoints: 1340, baseAllTimePoints: 5900, basePerfectRounds: 5 },
  { id: 'npc-9', displayName: 'Lydia W.', avatarId: 'olive', baseWeeklyPoints: 1180, baseAllTimePoints: 5100, basePerfectRounds: 5 },
  { id: 'npc-10', displayName: 'Samuel A.', avatarId: 'scroll', baseWeeklyPoints: 1040, baseAllTimePoints: 4400, basePerfectRounds: 4 },
  { id: 'npc-11', displayName: 'Deborah R.', avatarId: 'shield', baseWeeklyPoints: 920, baseAllTimePoints: 3800, basePerfectRounds: 3 },
  { id: 'npc-12', displayName: 'Timothy L.', avatarId: 'scroll', baseWeeklyPoints: 810, baseAllTimePoints: 3250, basePerfectRounds: 3 },
  { id: 'npc-13', displayName: 'Naomi B.', avatarId: 'dove', baseWeeklyPoints: 700, baseAllTimePoints: 2700, basePerfectRounds: 2 },
  { id: 'npc-14', displayName: 'Barnabas C.', avatarId: 'olive', baseWeeklyPoints: 610, baseAllTimePoints: 2250, basePerfectRounds: 2 },
  { id: 'npc-15', displayName: 'Priscilla D.', avatarId: 'crown', baseWeeklyPoints: 520, baseAllTimePoints: 1850, basePerfectRounds: 2 },
  { id: 'npc-16', displayName: 'Joshua E.', avatarId: 'shield', baseWeeklyPoints: 440, baseAllTimePoints: 1450, basePerfectRounds: 1 },
  { id: 'npc-17', displayName: 'Phoebe G.', avatarId: 'dove', baseWeeklyPoints: 360, baseAllTimePoints: 1100, basePerfectRounds: 1 },
  { id: 'npc-18', displayName: 'Nehemiah H.', avatarId: 'scroll', baseWeeklyPoints: 280, baseAllTimePoints: 820, basePerfectRounds: 1 },
  { id: 'npc-19', displayName: 'Abigail J.', avatarId: 'olive', baseWeeklyPoints: 190, baseAllTimePoints: 540, basePerfectRounds: 0 },
  { id: 'npc-20', displayName: 'Silas F.', avatarId: 'shield', baseWeeklyPoints: 110, baseAllTimePoints: 310, basePerfectRounds: 0 },
];

export function buildLeaderboardEntries(params: {
  mode: LeaderboardMode;
  playerProfile: PlayerProfile;
  userWeeklyPoints: number;
  userAllTimePoints: number;
  userPerfectRounds: number;
  quizzesCompleted: number;
  defaultPilgrimName?: string;
}): {
  top20: LeaderboardEntry[];
  userRank: number;
  pointsToNextRank: number | null;
} {
  const userPoints =
    params.mode === 'weekly'
      ? params.userWeeklyPoints
      : params.userAllTimePoints;
  const roundWave = Math.min(params.quizzesCompleted, 25);
  const scaleFactor =
    params.mode === 'weekly'
      ? 1 + Math.min(0.25, roundWave * 0.015)
      : 1 + Math.min(0.35, roundWave * 0.02);

  const combined: Omit<LeaderboardEntry, 'rank'>[] = COMPETING_SCHOLARS.map(
    (npc, idx) => {
      const rawBase =
        params.mode === 'weekly'
          ? npc.baseWeeklyPoints
          : npc.baseAllTimePoints;
      const scaled = Math.round((rawBase * scaleFactor) / 10) * 10;
      const bonusPerfect = Math.floor(roundWave / (idx + 5));
      return {
        id: npc.id,
        displayName: npc.displayName,
        avatarId: npc.avatarId,
        totalPoints: scaled,
        perfectRounds: npc.basePerfectRounds + bonusPerfect,
        isCurrentUser: false,
      };
    }
  );

  combined.push({
    id: 'current-user',
    displayName:
      params.playerProfile.displayName.trim() || params.defaultPilgrimName || 'Pilgrim',
    avatarId: params.playerProfile.avatarId,
    totalPoints: userPoints,
    perfectRounds: params.userPerfectRounds,
    isCurrentUser: true,
  });

  combined.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.perfectRounds !== a.perfectRounds) {
      return b.perfectRounds - a.perfectRounds;
    }
    return a.isCurrentUser ? -1 : 1;
  });

  const ranked: LeaderboardEntry[] = combined.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));

  const userIndex = ranked.findIndex((e) => e.isCurrentUser);
  const userRank = userIndex >= 0 ? ranked[userIndex].rank : ranked.length;
  const pointsToNextRank =
    userIndex > 0
      ? Math.max(
          10,
          ranked[userIndex - 1].totalPoints - ranked[userIndex].totalPoints + 10
        )
      : null;

  return {
    top20: ranked.slice(0, 20),
    userRank,
    pointsToNextRank,
  };
}
