import React from 'react';

interface SkyBackdropProps {
  showMeadow?: boolean;
}

export const SkyBackdrop: React.FC<SkyBackdropProps> = ({ showMeadow = false }) => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Base heavenly sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#BFE3FF] via-[#DCEEFF] to-[#EFF7FF]" />

      {/* Soft golden sunbeams radiating from top center */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[140vw] h-[65vh] opacity-55"
        style={{
          background:
            'radial-gradient(circle at 50% 18%, rgba(255, 245, 198, 0.95) 0%, rgba(255, 245, 198, 0.35) 35%, rgba(255, 255, 255, 0) 70%)',
        }}
      />

      {/* Fluffy cloud silhouettes */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full opacity-75"
      >
        <g fill="#FFFFFF" fillOpacity="0.65">
          <circle cx="140" cy="140" r="85" />
          <circle cx="220" cy="125" r="105" />
          <circle cx="315" cy="150" r="78" />
          <circle cx="1200" cy="130" r="95" />
          <circle cx="1310" cy="115" r="110" />
          <circle cx="1105" cy="155" r="70" />
        </g>
        <g fill="#FFFFFF" fillOpacity="0.45">
          <circle cx="90" cy="480" r="120" />
          <circle cx="200" cy="510" r="95" />
          <circle cx="1320" cy="470" r="130" />
          <circle cx="1210" cy="500" r="90" />
        </g>
      </svg>

      {/* Optional playful grassy meadow hills at bottom for Quiz & Settings */}
      {showMeadow && (
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-24 sm:h-28"
        >
          <path
            d="M0,120 C260,30 520,170 780,100 C1040,30 1260,150 1440,80 L1440,220 L0,220 Z"
            fill="#A6E07B"
            fillOpacity="0.7"
          />
          <path
            d="M0,150 C340,95 620,195 960,125 C1180,80 1340,145 1440,120 L1440,220 L0,220 Z"
            fill="#7FD15C"
            fillOpacity="0.8"
          />
        </svg>
      )}
    </div>
  );
};
