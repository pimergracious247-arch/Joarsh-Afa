import React from 'react';
import { LanguageCode } from '../types';

interface FlagIconProps {
  code: LanguageCode;
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ code, className = 'w-8 h-8' }) => {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-slate-900/15 shadow-xs ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="w-full h-full">
        {code === 'en' && (
          <g>
            <rect width="32" height="32" fill="#012169" />
            <path d="M0 0 L32 32 M32 0 L0 32" stroke="#FFFFFF" strokeWidth="6" />
            <path d="M0 0 L32 32 M32 0 L0 32" stroke="#C8102E" strokeWidth="3" />
            <path d="M16 0 V32 M0 16 H32" stroke="#FFFFFF" strokeWidth="9" />
            <path d="M16 0 V32 M0 16 H32" stroke="#C8102E" strokeWidth="5" />
          </g>
        )}
        {code === 'lg' && (
          <g>
            <rect y="0" width="32" height="5.4" fill="#111111" />
            <rect y="5.4" width="32" height="5.4" fill="#FCDC04" />
            <rect y="10.8" width="32" height="5.4" fill="#D90000" />
            <rect y="16.2" width="32" height="5.4" fill="#111111" />
            <rect y="21.6" width="32" height="5.4" fill="#FCDC04" />
            <rect y="27" width="32" height="5" fill="#D90000" />
            <circle cx="16" cy="16" r="5.5" fill="#FFFFFF" />
            <circle cx="16" cy="15.5" r="2.1" fill="#D90000" />
          </g>
        )}
        {code === 'sw' && (
          <g>
            <rect y="0" width="32" height="10" fill="#111111" />
            <rect y="10" width="32" height="2" fill="#FFFFFF" />
            <rect y="12" width="32" height="8" fill="#BB0000" />
            <rect y="20" width="32" height="2" fill="#FFFFFF" />
            <rect y="22" width="32" height="10" fill="#006600" />
            <ellipse cx="16" cy="16" rx="3.4" ry="6" fill="#BB0000" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        )}
        {code === 'fr' && (
          <g>
            <rect x="0" width="10.7" height="32" fill="#0055A4" />
            <rect x="10.7" width="10.6" height="32" fill="#FFFFFF" />
            <rect x="21.3" width="10.7" height="32" fill="#EF4135" />
          </g>
        )}
        {code === 'es' && (
          <g>
            <rect y="0" width="32" height="8" fill="#AA151B" />
            <rect y="8" width="32" height="16" fill="#F1BF00" />
            <rect y="24" width="32" height="8" fill="#AA151B" />
            <rect x="8" y="12.5" width="4.2" height="7" rx="1.5" fill="#AA151B" />
          </g>
        )}
        {code === 'pt' && (
          <g>
            <rect x="0" width="12.5" height="32" fill="#006600" />
            <rect x="12.5" width="19.5" height="32" fill="#FF0000" />
            <circle cx="12.5" cy="16" r="5" fill="#FFCC00" />
            <rect x="10.3" y="13.5" width="4.4" height="5" rx="1.5" fill="#FFFFFF" stroke="#003399" strokeWidth="0.9" />
          </g>
        )}
        {code === 'de' && (
          <g>
            <rect y="0" width="32" height="10.7" fill="#111111" />
            <rect y="10.7" width="32" height="10.6" fill="#DD0000" />
            <rect y="21.3" width="32" height="10.7" fill="#FFCE00" />
          </g>
        )}
        {code === 'ar' && (
          <g>
            <rect width="32" height="32" fill="#006C35" />
            <path d="M8 13.5 H24 M11 17.5 H21" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M9 21.5 H23" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        )}
        {code === 'hi' && (
          <g>
            <rect y="0" width="32" height="10.7" fill="#FF9933" />
            <rect y="10.7" width="32" height="10.6" fill="#FFFFFF" />
            <rect y="21.3" width="32" height="10.7" fill="#138808" />
            <circle cx="16" cy="16" r="3.8" fill="none" stroke="#000080" strokeWidth="1.3" />
            <circle cx="16" cy="16" r="1" fill="#000080" />
          </g>
        )}
        {code === 'zh' && (
          <g>
            <rect width="32" height="32" fill="#DE2910" />
            <polygon points="9,6 10.3,10 14.5,10 11,12.4 12.3,16.4 9,14 5.7,16.4 7,12.4 3.5,10 7.7,10" fill="#FFDE00" />
            <circle cx="16.5" cy="7.5" r="1.2" fill="#FFDE00" />
            <circle cx="18.5" cy="11" r="1.2" fill="#FFDE00" />
            <circle cx="18.5" cy="15" r="1.2" fill="#FFDE00" />
            <circle cx="16.5" cy="18.5" r="1.2" fill="#FFDE00" />
          </g>
        )}
      </svg>
    </span>
  );
};
