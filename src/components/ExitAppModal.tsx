import type React from 'react';
import { LogOut, X } from 'lucide-react';
import type { UIStrings } from '../data/translations';
import type { LanguageCode } from '../types';

interface ExitAppModalProps {
  isOpen: boolean;
  lang: LanguageCode;
  t: UIStrings;
  onConfirmExit: () => void;
  onCancel: () => void;
}

export const ExitAppModal: React.FC<ExitAppModalProps> = ({
  isOpen,
  lang,
  t,
  onConfirmExit,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-app-modal-title"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#14274E]/65 backdrop-blur-xs flex items-center justify-center p-4 safe-top safe-bottom"
    >
      <div className="bg-white rounded-[28px] max-w-sm w-full p-5 shadow-[0_24px_60px_rgba(15,30,61,0.4)] border-2 border-white text-center space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="w-9 shrink-0" aria-hidden="true" />
          <div className="w-12 h-12 rounded-full bg-[#EDF5FF] border-2 border-[#BFD9FA] text-[#164A9E] flex items-center justify-center">
            <LogOut className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t.closeLabel}
            className="w-9 h-9 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h2
            id="exit-app-modal-title"
            className="font-display text-xl font-extrabold text-[#14274E]"
          >
            {t.exitAppTitle}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#47608B] leading-snug">
            {t.exitAppMessage}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-sm shadow-[0_3px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer"
          >
            {t.exitAppCancelBtn}
          </button>
          <button
            type="button"
            onClick={onConfirmExit}
            className="min-h-[44px] px-4 py-2 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] border-2 border-[#BFD9FA] text-[#14274E] font-display font-bold text-sm transition-colors cursor-pointer"
          >
            {t.exitAppConfirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
