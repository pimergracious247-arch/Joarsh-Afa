import type React from 'react';
import {
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Mail,
  ShieldCheck,
  WifiOff,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { UIStrings } from '../data/translations';
import { useOnlineStatus } from '../hooks/usePWA';
import type { LanguageCode } from '../types';

export const PRIVACY_POLICY_URL = 'https://github.io';
export const SUPPORT_EMAIL = 'sifakwamungudorah247@gmail.com';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  lang: LanguageCode;
  t: UIStrings;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  lang,
  t,
  onClose,
  onShowToast,
}) => {
  const isOnline = useOnlineStatus();
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard?.writeText(SUPPORT_EMAIL);
    } catch {
      // ignore clipboard restrictions
    }
    setCopiedEmail(true);
    onShowToast(t.emailCopiedToast);
    window.setTimeout(() => setCopiedEmail(false), 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-modal-title"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#14274E]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 safe-top safe-bottom"
    >
      <div className="bg-[#F6FAFF] rounded-[28px] max-w-lg w-full max-h-[85dvh] flex flex-col overflow-hidden shadow-[0_24px_60px_rgba(15,30,61,0.42)] border-2 border-white">
        <div className="shrink-0 bg-white px-4 sm:px-5 py-3.5 border-b border-[#DCEBFF] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-2xl bg-[#E5F0FF] border border-[#BFD9FA] text-[#164A9E] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2
              id="privacy-policy-modal-title"
              className="font-display text-base sm:text-lg font-extrabold text-[#14274E] truncate"
            >
              {t.privacyModalTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeLabel}
            className="w-9 h-9 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 space-y-3.5 text-start">
          <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#DCEBFF] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#164A9E]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <h3 className="font-display text-sm sm:text-base font-extrabold text-[#14274E]">
                {t.privacyPolicyHeading}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
              {t.privacyLocalDataNote}
            </p>
            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
              {t.privacyNoAccountNote}
            </p>
            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
              {t.privacyAdmobNote}
            </p>
          </section>

          <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#DCEBFF] shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-[#164A9E]">
              <BookOpen className="w-4 h-4 shrink-0" />
              <h3 className="font-display text-sm sm:text-base font-extrabold text-[#14274E]">
                {t.copyrightHeading}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
              {t.copyrightBody}
            </p>
          </section>

          <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#DCEBFF] shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-[#164A9E]">
              <FileText className="w-4 h-4 shrink-0" />
              <h3 className="font-display text-sm sm:text-base font-extrabold text-[#14274E]">
                {t.termsHeading}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
              {t.termsBody}
            </p>
          </section>

          <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#DCEBFF] shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 text-[#164A9E]">
              <Mail className="w-4 h-4 shrink-0" />
              <h3 className="font-display text-sm sm:text-base font-extrabold text-[#14274E]">
                {t.supportHeading}
              </h3>
            </div>
            <p className="text-xs text-[#47608B] font-semibold">
              {t.supportContactLabel}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                data-selectable="true"
                className="flex-1 min-w-0 min-h-[38px] px-3 py-1.5 rounded-xl bg-[#EDF5FF] hover:bg-[#DCEBFF] border border-[#BFD9FA] text-[#164A9E] font-bold text-xs sm:text-sm flex items-center gap-2 truncate"
              >
                <Mail className="w-4 h-4 shrink-0 text-[#2F8FFF]" />
                <span className="truncate select-text" data-selectable="true">
                  {SUPPORT_EMAIL}
                </span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#FFF4C4] hover:bg-[#FFE675] border border-[#F5B935] text-[#7A5400] font-display font-bold text-xs inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedEmail ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{t.copy}</span>
              </button>
            </div>

            {isOnline ? (
              <a
                href={PRIVACY_POLICY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white flex items-center justify-between gap-2.5 shadow-[0_3px_0_#1561C0] transition-all"
              >
                <div className="min-w-0 flex-1 text-start">
                  <div className="font-display font-bold text-xs sm:text-sm truncate">
                    {t.fullPrivacyPolicyLinkLabel}
                  </div>
                  <div
                    data-selectable="true"
                    className="text-[11px] text-white/90 truncate select-text"
                  >
                    {PRIVACY_POLICY_URL}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
            ) : (
              <div className="rounded-xl bg-[#FFFBEB] border border-[#FCD34D] px-3 py-2 space-y-1 text-xs font-semibold text-[#92400E]">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 shrink-0" />
                  <span>{t.externalLinkOfflineNote}</span>
                </div>
                <div
                  data-selectable="true"
                  className="text-[11px] font-medium text-[#78350F] break-all select-text"
                >
                  {PRIVACY_POLICY_URL}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="shrink-0 bg-white px-4 sm:px-5 py-3 border-t border-[#DCEBFF]">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-extrabold text-sm shadow-[0_3px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer"
          >
            {t.gotItBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
