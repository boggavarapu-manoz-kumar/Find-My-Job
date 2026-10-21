import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  isOpen,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-text" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-text" />,
    error: <AlertCircle className="w-5 h-5 text-rose-text" />,
    info: <Info className="w-5 h-5 text-brand-600" />,
  };

  const borders = {
    success: 'border-emerald-text/20',
    warning: 'border-amber-text/20',
    error: 'border-rose-text/20',
    info: 'border-brand-200',
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 bg-canvas-card border rounded-card shadow-elevated max-w-sm w-full ${borders[type]}`}
        >
          <div className="shrink-0 mt-0.5">{icons[type]}</div>
          <div className="flex-1 min-w-0">
            {title ? (
              <h4 className="text-sm font-semibold text-ink-900 mb-0.5">{title}</h4>
            ) : null}
            <p className="text-xs text-ink-600 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notification"
            className="shrink-0 text-ink-400 hover:text-ink-700 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
