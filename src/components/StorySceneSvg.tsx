import type React from 'react';
import type { StoryTheme } from '../types';

interface StorySceneSvgProps {
  theme: StoryTheme;
  label: string;
  className?: string;
}

export const StorySceneSvg: React.FC<StorySceneSvgProps> = ({
  theme,
  label,
  className = 'w-full h-full',
}) => {
  if (theme === 'noah') {
    return (
      <svg
        viewBox="0 0 400 160"
        className={className}
        role="img"
        aria-label={label}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="noahSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7AC5FF" />
            <stop offset="100%" stopColor="#D7EEFF" />
          </linearGradient>
          <linearGradient id="noahSea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#268BFF" />
            <stop offset="100%" stopColor="#1359BA" />
          </linearGradient>
        </defs>
        <rect width="400" height="160" fill="url(#noahSky)" />
        <path
          d="M 40 130 A 160 110 0 0 1 360 130"
          fill="none"
          stroke="#FF6B6B"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M 48 130 A 152 102 0 0 1 352 130"
          fill="none"
          stroke="#FFD166"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.88"
        />
        <path
          d="M 56 130 A 144 94 0 0 1 344 130"
          fill="none"
          stroke="#49C946"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M 64 130 A 136 86 0 0 1 336 130"
          fill="none"
          stroke="#4DA3FF"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.82"
        />
        <circle cx="332" cy="36" r="18" fill="#FFE066" />
        <g fill="#FFFFFF" opacity="0.95">
          <ellipse cx="76" cy="40" rx="26" ry="12" />
          <ellipse cx="94" cy="35" rx="18" ry="12" />
          <ellipse cx="290" cy="48" rx="22" ry="10" />
        </g>
        <path
          d="M 116 96 L 284 96 L 266 130 L 134 130 Z"
          fill="#9B5E2A"
          stroke="#5C3210"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <rect
          x="146"
          y="72"
          width="108"
          height="24"
          rx="4"
          fill="#BA763B"
          stroke="#5C3210"
          strokeWidth="2.5"
        />
        <path
          d="M 138 74 L 200 54 L 262 74 Z"
          fill="#7A4419"
          stroke="#5C3210"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect
          x="190"
          y="78"
          width="20"
          height="18"
          rx="3"
          fill="#FFF3C4"
          stroke="#5C3210"
          strokeWidth="2"
        />
        <rect x="158" y="80" width="7" height="16" fill="#F4B942" />
        <circle cx="161.5" cy="79" r="5" fill="#F4B942" />
        <circle cx="236" cy="86" r="7" fill="#94A3B8" />
        <g transform="translate(88 64)">
          <ellipse cx="0" cy="0" rx="8" ry="5" fill="#FFFFFF" />
          <path d="M -3 -2 Q -12 -14 -18 -5 Q -10 1 -3 -2 Z" fill="#FFFFFF" />
          <path d="M 6 0 L 11 -1 L 7 2 Z" fill="#F59E0B" />
          <path d="M 10 1 Q 15 3 18 0" stroke="#49C946" strokeWidth="2" fill="none" />
        </g>
        <path
          d="M 0 124 Q 40 116 80 124 T 160 124 T 240 124 T 320 124 T 400 124 L 400 160 L 0 160 Z"
          fill="url(#noahSea)"
        />
        <path
          d="M 0 138 Q 35 132 70 138 T 140 138 T 210 138 T 280 138 T 350 138 T 400 138"
          fill="none"
          stroke="#93D5FF"
          strokeWidth="2.5"
          opacity="0.7"
        />
      </svg>
    );
  }

  if (theme === 'whale') {
    return (
      <svg
        viewBox="0 0 400 160"
        className={className}
        role="img"
        aria-label={label}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="seaSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6EC1FF" />
            <stop offset="100%" stopColor="#D6F0FF" />
          </linearGradient>
          <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1696F2" />
            <stop offset="100%" stopColor="#0D57A8" />
          </linearGradient>
        </defs>
        <rect width="400" height="160" fill="url(#seaSky)" />
        <circle cx="72" cy="36" r="18" fill="#FFE066" />
        <g fill="#FFFFFF" opacity="0.92">
          <ellipse cx="145" cy="34" rx="26" ry="11" />
          <ellipse cx="163" cy="29" rx="18" ry="11" />
          <ellipse cx="322" cy="40" rx="28" ry="12" />
        </g>
        <g transform="translate(310 74)">
          <path d="M -22 16 L 22 16 L 15 26 L -15 26 Z" fill="#8C5324" stroke="#4E2A0F" strokeWidth="2" />
          <line x1="0" y1="16" x2="0" y2="-16" stroke="#4E2A0F" strokeWidth="2.5" />
          <path d="M 2 -14 L 22 12 L 2 12 Z" fill="#FFF8E7" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M -2 -10 L -16 12 L -2 12 Z" fill="#FFE675" />
        </g>
        <g transform="translate(182 96)">
          <path d="M -16 -30 Q -26 -48 -38 -40" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M -14 -30 Q -4 -48 8 -40" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          <path
            d="M -68 6 C -68 -24 -28 -34 12 -28 C 40 -24 56 -6 70 2 L 88 -12 L 84 6 L 94 20 L 70 12 C 46 28 -52 30 -68 6 Z"
            fill="#2563EB"
            stroke="#1E3A8A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M -62 10 C -40 24 22 24 44 10 C 20 8 -28 8 -62 10 Z" fill="#BFDBFE" />
          <circle cx="-38" cy="-4" r="4" fill="#0F172A" />
          <circle cx="-39.5" cy="-5.5" r="1.3" fill="#FFFFFF" />
          <path d="M -56 4 Q -46 10 -34 7" fill="none" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" />
        </g>
        <path
          d="M 0 118 Q 40 108 80 118 T 160 118 T 240 118 T 320 118 T 400 118 L 400 160 L 0 160 Z"
          fill="url(#oceanGrad)"
          opacity="0.92"
        />
        <path
          d="M 10 136 Q 55 128 100 136 T 190 136 T 280 136 T 370 136"
          fill="none"
          stroke="#93D5FF"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>
    );
  }

  if (theme === 'david') {
    return (
      <svg
        viewBox="0 0 400 160"
        className={className}
        role="img"
        aria-label={label}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="davidSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7CC6FF" />
            <stop offset="100%" stopColor="#DCF0FF" />
          </linearGradient>
        </defs>
        <rect width="400" height="160" fill="url(#davidSky)" />
        <circle cx="335" cy="36" r="19" fill="#FFE066" />
        <g fill="#FFFFFF" opacity="0.92">
          <ellipse cx="86" cy="36" rx="28" ry="12" />
          <ellipse cx="106" cy="31" rx="18" ry="11" />
          <ellipse cx="242" cy="42" rx="22" ry="10" />
        </g>
        <path d="M 0 112 Q 110 74 220 108 T 400 100 L 400 160 L 0 160 Z" fill="#7AD66D" />
        <path d="M 0 124 Q 140 102 270 124 T 400 118 L 400 160 L 0 160 Z" fill="#49B843" />
        <g transform="translate(150 92)">
          <line x1="-18" y1="-18" x2="-24" y2="26" stroke="#784212" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M -18 -18 A 6 6 0 0 1 -7 -18" fill="none" stroke="#784212" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M -9 0 L 9 0 L 13 24 L -13 24 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
          <path d="M -8 4 L 10 18" stroke="#1696F2" strokeWidth="4" strokeLinecap="round" />
          <circle cx="0" cy="-9" r="9" fill="#FCD5B5" stroke="#92400E" strokeWidth="1.5" />
          <path d="M -9 -10 Q 0 -22 9 -10 Z" fill="#78350F" />
          <path d="M 10 8 Q 22 -4 26 8" fill="none" stroke="#784212" strokeWidth="2" />
        </g>
        <g transform="translate(262 118)">
          <ellipse cx="0" cy="0" rx="14" ry="10" fill="#FFFFFF" />
          <circle cx="-11" cy="-2" r="5" fill="#1E293B" />
          <ellipse cx="36" cy="4" rx="13" ry="9" fill="#FFFFFF" />
          <circle cx="26" cy="2" r="4.5" fill="#1E293B" />
        </g>
        <g fill="#94A3B8" stroke="#475569" strokeWidth="1">
          <ellipse cx="182" cy="136" rx="4" ry="2.8" />
          <ellipse cx="192" cy="138" rx="3.5" ry="2.5" />
          <ellipse cx="201" cy="135" rx="4" ry="2.8" />
          <ellipse cx="187" cy="142" rx="3.5" ry="2.4" />
          <ellipse cx="198" cy="142" rx="3.8" ry="2.6" />
        </g>
      </svg>
    );
  }

  if (theme === 'shepherd') {
    return (
      <svg
        viewBox="0 0 400 160"
        className={className}
        role="img"
        aria-label={label}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="galileeSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#85CCFF" />
            <stop offset="100%" stopColor="#FFF7D6" />
          </linearGradient>
        </defs>
        <rect width="400" height="160" fill="url(#galileeSky)" />
        <circle cx="200" cy="48" r="24" fill="#FFE066" opacity="0.95" />
        <circle cx="200" cy="48" r="34" fill="#FFE066" opacity="0.25" />
        <g fill="#FFFFFF" opacity="0.9">
          <ellipse cx="82" cy="36" rx="25" ry="10" />
          <ellipse cx="318" cy="38" rx="28" ry="11" />
        </g>
        <rect x="44" y="76" width="10" height="44" rx="4" fill="#7A4924" />
        <g fill="#4E9F3D">
          <circle cx="49" cy="66" r="20" />
          <circle cx="34" cy="72" r="14" />
          <circle cx="64" cy="72" r="14" />
        </g>
        <path d="M 0 112 Q 110 82 220 110 T 400 104 L 400 160 L 0 160 Z" fill="#82DB73" />
        <path d="M 0 128 Q 160 106 300 128 T 400 122 L 400 160 L 0 160 Z" fill="#4DC147" />
        <path
          d="M 186 122 L 186 78 A 9 9 0 0 1 204 78"
          fill="none"
          stroke="#7A4924"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <g transform="translate(232 118)">
          <ellipse cx="0" cy="0" rx="16" ry="11" fill="#FFFFFF" />
          <circle cx="-13" cy="-3" r="6" fill="#334155" />
          <circle cx="-15" cy="-4" r="1.2" fill="#FFFFFF" />
        </g>
        <g transform="translate(284 126)">
          <ellipse cx="0" cy="0" rx="14" ry="9.5" fill="#FFFFFF" />
          <circle cx="-11" cy="-2" r="5" fill="#334155" />
        </g>
        <circle cx="110" cy="136" r="3" fill="#FFD166" />
        <circle cx="136" cy="142" r="3" fill="#FF6B6B" />
        <circle cx="338" cy="138" r="3" fill="#FFD166" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 400 160"
      className={className}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="bibleSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6CBAFF" />
          <stop offset="100%" stopColor="#E1F2FF" />
        </linearGradient>
        <radialGradient id="goldenGlow" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#FFF3B0" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#FFE066" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFE066" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="160" fill="url(#bibleSky)" />
      <rect width="400" height="160" fill="url(#goldenGlow)" />
      <g stroke="#FFF8D6" strokeWidth="2.5" opacity="0.7" strokeLinecap="round">
        <line x1="200" y1="16" x2="200" y2="34" />
        <line x1="158" y1="24" x2="170" y2="40" />
        <line x1="242" y1="24" x2="230" y2="40" />
      </g>
      <rect x="195" y="28" width="10" height="44" rx="3" fill="#F5B935" stroke="#B45309" strokeWidth="1.5" />
      <rect x="182" y="40" width="36" height="9" rx="3" fill="#F5B935" stroke="#B45309" strokeWidth="1.5" />
      <g fill="#FFFFFF" opacity="0.95">
        <ellipse cx="96" cy="134" rx="58" ry="22" />
        <ellipse cx="200" cy="136" rx="84" ry="24" />
        <ellipse cx="304" cy="134" rx="58" ry="22" />
      </g>
      <g transform="translate(200 100)">
        <path
          d="M -78 -18 L -4 -12 L -4 26 L -78 20 Z"
          fill="#6B3D18"
          stroke="#4E2A0F"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M 78 -18 L 4 -12 L 4 26 L 78 20 Z"
          fill="#6B3D18"
          stroke="#4E2A0F"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M -70 -24 Q -36 -28 -2 -16 L -2 20 Q -36 10 -70 14 Z"
          fill="#FFFDF5"
          stroke="#CBD5E1"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M 70 -24 Q 36 -28 2 -16 L 2 20 Q 36 10 70 14 Z"
          fill="#FFFDF5"
          stroke="#CBD5E1"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <g stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" opacity="0.7">
          <line x1="-58" y1="-12" x2="-16" y2="-8" />
          <line x1="-58" y1="-4" x2="-16" y2="0" />
          <line x1="-58" y1="4" x2="-22" y2="7" />
          <line x1="16" y1="-8" x2="58" y2="-12" />
          <line x1="16" y1="0" x2="58" y2="-4" />
          <line x1="22" y1="7" x2="58" y2="4" />
        </g>
        <path d="M 10 17 L 10 34 L 15 30 L 20 34 L 20 16 Z" fill="#EF4444" />
      </g>
      <g transform="translate(110 60)">
        <ellipse cx="0" cy="0" rx="8" ry="5" fill="#FFFFFF" />
        <path d="M -2 -2 Q -12 -14 -18 -5 Q -9 2 -2 -2 Z" fill="#FFFFFF" />
        <path d="M 7 0 L 12 -1 L 7 2 Z" fill="#F59E0B" />
      </g>
    </svg>
  );
};
