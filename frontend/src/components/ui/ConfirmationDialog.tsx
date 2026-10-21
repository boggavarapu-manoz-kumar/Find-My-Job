import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './Button';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-desc"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-md bg-canvas-card border border-canvas-border rounded-card p-6 shadow-elevated"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {isDestructive ? (
                  <div className="w-9 h-9 rounded-full bg-rose-soft text-rose-text flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                ) : null}
                <h3 id="dialog-title" className="text-lg font-bold text-ink-900 tracking-tight">
                  {title}
                </h3>
              </div>
              <button
                onClick={onCancel}
                aria-label="Close dialog"
                className="text-ink-400 hover:text-ink-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p id="dialog-desc" className="text-sm text-ink-600 leading-relaxed mb-6">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <SecondaryButton size="sm" onClick={onCancel} disabled={isLoading}>
                {cancelText}
              </SecondaryButton>
              <PrimaryButton
                size="sm"
                onClick={onConfirm}
                isLoading={isLoading}
                className={isDestructive ? '!bg-rose-600 hover:!bg-rose-700' : ''}
              >
                {confirmText}
              </PrimaryButton>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
