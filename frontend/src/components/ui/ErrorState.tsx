import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { SecondaryButton } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error while retrieving data. Please try again.',
  onRetry,
}) => {
  return (
    <div className="py-12 px-6 text-center bg-rose-soft/50 border border-rose-text/20 rounded-card max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-rose-soft text-rose-text mx-auto flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-ink-900 tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-ink-600 leading-relaxed max-w-sm mx-auto mb-6">
        {message}
      </p>
      {onRetry ? (
        <SecondaryButton size="sm" onClick={onRetry} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Try Again
        </SecondaryButton>
      ) : null}
    </div>
  );
};
