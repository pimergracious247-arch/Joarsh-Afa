import type React from 'react';
import { useId } from 'react';

interface GoldCoinIconProps {
  className?: string;
  dimmed?: boolean;
  missed?: boolean;
}

export const GoldCoinIcon: React.FC<GoldCoinIconProps> = ({
  className = 'w-6 h-6',
  dimmed = false,
  missed = false,
}) => {
  const gradId = useId();

  if (dimmed) {
    return (
      <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
        <circle cx="18" cy="18" r="15" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2.5" />
        <circle
          cx="18"
          cy="18"
          r="10"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
      </svg>
    );
  }

  if (missed) {
    return (
      <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
        <circle cx="18" cy="18" r="15" fill="#FFEDD5" stroke="#FB923C" strokeWidth="2.5" />
        <path
          d="M13 13 L23 23 M23 13 L13 23"
          stroke="#EA580C"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF07A" />
          <stop offset="50%" stopColor="#FFD02C" />
          <stop offset="100%" stopColor="#E59300" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="15.5" fill={`url(#${gradId})`} stroke="#C27200" strokeWidth="2.2" />
      <circle cx="18" cy="18" r="11.5" fill="none" stroke="#FFF7B2" strokeWidth="1.8" />
      <path
        d="M18 11.5 V24.5 M14.2 15.2 H21.8"
        stroke="#9A5400"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
