import type React from 'react';
import { Award, Bird, Crown, Leaf, ScrollText, Shield } from 'lucide-react';
import type { UIStrings } from '../data/translations';
import type { AvatarId } from '../types';

export interface BibleAvatarMeta {
  id: AvatarId;
  label: string;
  bg: string;
  ring: string;
  text: string;
}

export const BIBLE_AVATARS: BibleAvatarMeta[] = [
  {
    id: 'dove',
    label: 'Dove',
    bg: 'bg-[#E0F2FE]',
    ring: 'border-[#38BDF8]',
    text: 'text-[#0369A1]',
  },
  {
    id: 'crown',
    label: 'Crown',
    bg: 'bg-[#FEF3C7]',
    ring: 'border-[#F59E0B]',
    text: 'text-[#B45309]',
  },
  {
    id: 'scroll',
    label: 'Scroll',
    bg: 'bg-[#EDE9FE]',
    ring: 'border-[#A78BFA]',
    text: 'text-[#6D28D9]',
  },
  {
    id: 'shield',
    label: 'Shield',
    bg: 'bg-[#DBEAFE]',
    ring: 'border-[#3B82F6]',
    text: 'text-[#1D4ED8]',
  },
  {
    id: 'olive',
    label: 'Olive Branch',
    bg: 'bg-[#DCFCE7]',
    ring: 'border-[#4ADE80]',
    text: 'text-[#15803D]',
  },
];

interface BibleAvatarIconProps {
  avatarId: AvatarId;
  size?: 'sm' | 'md' | 'lg';
  t?: UIStrings;
}

export const BibleAvatarIcon: React.FC<BibleAvatarIconProps> = ({
  avatarId,
  size = 'md',
  t,
}) => {
  const meta = BIBLE_AVATARS.find((a) => a.id === avatarId) || BIBLE_AVATARS[0];
  const localizedLabel = t?.avatarLabels[meta.id] ?? meta.label;
  const boxSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const Icon =
    avatarId === 'crown'
      ? Crown
      : avatarId === 'scroll'
      ? ScrollText
      : avatarId === 'shield'
      ? Shield
      : avatarId === 'olive'
      ? Leaf
      : Bird;

  return (
    <span
      className={`${boxSize} rounded-full ${meta.bg} border-2 ${meta.ring} ${meta.text} inline-flex items-center justify-center shrink-0`}
      aria-label={localizedLabel}
    >
      <Icon className={iconSize} />
    </span>
  );
};

interface RankMedalProps {
  rank: number;
}

export const RankMedal: React.FC<RankMedalProps> = ({ rank }) => {
  if (rank === 1) {
    return (
      <span
        className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FFE66D] to-[#F59E0B] border-2 border-[#B45309] text-[#78350F] inline-flex items-center justify-center shadow-xs shrink-0"
        aria-label="#1"
      >
        <Award className="w-4 h-4 fill-current" />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span
        className="w-8 h-8 rounded-full bg-gradient-to-b from-[#F8FAFC] to-[#CBD5E1] border-2 border-[#64748B] text-[#334155] inline-flex items-center justify-center shadow-xs shrink-0"
        aria-label="#2"
      >
        <Award className="w-4 h-4 fill-current" />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span
        className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FDBA74] to-[#C2410C] border-2 border-[#7C2D12] text-white inline-flex items-center justify-center shadow-xs shrink-0"
        aria-label="#3"
      >
        <Award className="w-4 h-4 fill-current" />
      </span>
    );
  }
  return (
    <span className="w-8 h-8 rounded-full bg-[#EDF5FF] text-[#14274E] font-display text-xs font-extrabold inline-flex items-center justify-center tabular-nums shrink-0">
      #{rank}
    </span>
  );
};
