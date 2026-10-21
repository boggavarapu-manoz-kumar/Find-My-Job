import React from 'react';
import { Inbox } from 'lucide-react';
import { SecondaryButton } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No jobs found',
  description = 'Try adjusting your search criteria or clearing active filters.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="py-16 px-6 text-center bg-canvas-card border border-canvas-border rounded-card max-w-lg mx-auto shadow-subtle my-8">
      <div className="w-12 h-12 rounded-full bg-canvas-subtle text-ink-400 mx-auto flex items-center justify-center mb-4">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-bold text-ink-900 tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-ink-500 leading-relaxed max-w-sm mx-auto mb-6">
        {description}
      </p>
      {actionText && onAction ? (
        <SecondaryButton size="sm" onClick={onAction}>
          {actionText}
        </SecondaryButton>
      ) : null}
    </div>
  );
};
