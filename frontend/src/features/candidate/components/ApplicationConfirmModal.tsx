import React, { useState } from 'react';
import { CheckCircle2, XCircle, ExternalLink, HelpCircle, ArrowRight } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';

export interface ApplicationConfirmModalProps {
  isOpen: boolean;
  jobTitle: string;
  companyName: string;
  applicationUrl: string;
  onConfirmApplied: () => Promise<void> | void;
  onDismiss: () => void;
}

export const ApplicationConfirmModal: React.FC<ApplicationConfirmModalProps> = ({
  isOpen,
  jobTitle,
  companyName,
  applicationUrl,
  onConfirmApplied,
  onDismiss,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleYes = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmApplied();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-canvas-card border border-canvas-border rounded-2xl shadow-2xl p-6 sm:p-7 space-y-6 text-center animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
          <HelpCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 id="confirm-modal-title" className="text-xl font-extrabold text-ink-900 tracking-tight">
            Did you submit your application?
          </h2>
          <p className="text-sm text-ink-600 leading-normal">
            You recently visited the external employer portal for{' '}
            <span className="font-semibold text-ink-900">{jobTitle}</span> at{' '}
            <span className="font-semibold text-ink-900">{companyName}</span>.
          </p>
        </div>

        <div className="p-3.5 bg-canvas-subtle rounded-xl border border-canvas-border text-xs text-ink-500 text-left space-y-1">
          <div className="font-medium text-ink-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Keep your profile organized
          </div>
          <p className="text-ink-500 pl-5">
            Confirming adds this job to your <strong>Submitted Applications</strong> dashboard so you can track its status anytime.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <PrimaryButton
            size="md"
            className="w-full justify-center text-sm font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            onClick={handleYes}
            disabled={isSubmitting}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isSubmitting ? 'Recording...' : 'Yes, I Applied'}
          </PrimaryButton>

          <SecondaryButton
            size="md"
            className="w-full justify-center text-sm font-semibold"
            onClick={onDismiss}
            disabled={isSubmitting}
            icon={<XCircle className="w-4 h-4 text-ink-400" />}
          >
            Not Yet / Cancel
          </SecondaryButton>
        </div>

        {applicationUrl && (
          <p className="text-[11px] text-ink-400">
            Need to open the employer page again?{' '}
            <a
              href={applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline inline-flex items-center gap-0.5 font-medium"
            >
              Reopen application link <ExternalLink className="w-3 h-3 inline" />
            </a>
          </p>
        )}
      </div>
    </div>
  );
};
export default ApplicationConfirmModal;
