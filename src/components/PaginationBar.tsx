import type React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { UIStrings } from '../data/translations';
import type { LanguageCode } from '../types';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  lang: LanguageCode;
  t: UIStrings;
  customLabels?: string[];
  compact?: boolean;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  totalPages,
  onPageChange,
  lang,
  t,
  customLabels,
  compact = false,
}) => {
  if (totalPages <= 1) return null;

  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const showQuickPills = totalPages <= 5;
  const heightCls = compact ? 'min-h-[36px]' : 'min-h-[42px]';

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="shrink-0 flex items-center justify-between gap-2 pt-1.5"
    >
      <button
        type="button"
        disabled={safePage <= 0}
        onClick={() => onPageChange(Math.max(0, safePage - 1))}
        aria-label={t.previous}
        className={`${heightCls} px-3 rounded-full bg-white/95 hover:bg-white disabled:opacity-45 border border-[#BFD9FA] text-[#14274E] font-display text-xs font-extrabold inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer disabled:cursor-default shrink-0 whitespace-nowrap`}
      >
        <ChevronLeft className="w-4 h-4 rtl:rotate-180 shrink-0" />
        <span className="hidden sm:inline">{t.previous}</span>
      </button>

      {showQuickPills ? (
        <div className="flex items-center justify-center gap-1 min-w-0">
          {Array.from({ length: totalPages }, (_, idx) => {
            const isCurrent = idx === safePage;
            const label = customLabels?.[idx] ?? String(idx + 1);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(idx)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`${compact ? 'min-h-[32px] min-w-[32px] px-2' : 'min-h-[36px] min-w-[36px] px-2.5'} rounded-full font-display text-xs font-extrabold tabular-nums transition-colors cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#2A8CFF] text-white shadow-xs'
                    : 'bg-white/90 hover:bg-white border border-[#DCEBFF] text-[#47608B]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : (
        <span className="text-xs font-extrabold text-[#164A9E] tabular-nums text-center whitespace-nowrap">
          {t.pageLabel
            .replace('{page}', String(safePage + 1))
            .replace('{total}', String(totalPages))}
        </span>
      )}

      <button
        type="button"
        disabled={safePage >= totalPages - 1}
        onClick={() => onPageChange(Math.min(totalPages - 1, safePage + 1))}
        aria-label={t.nextQuestion}
        className={`${heightCls} px-3 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] disabled:opacity-45 text-white font-display text-xs font-extrabold inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer disabled:cursor-default shrink-0 whitespace-nowrap`}
      >
        <span className="hidden sm:inline">{t.nextQuestion}</span>
        <ChevronRight className="w-4 h-4 rtl:rotate-180 shrink-0" />
      </button>
    </div>
  );
};
