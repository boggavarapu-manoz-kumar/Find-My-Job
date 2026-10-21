import React from 'react';

export interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="p-6 bg-canvas-card border border-canvas-border rounded-card animate-pulse space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-4 bg-ink-200 rounded w-24" />
            <div className="h-4 bg-ink-200 rounded w-16" />
          </div>
          <div className="h-6 bg-ink-200 rounded w-2/3" />
          <div className="flex gap-4">
            <div className="h-4 bg-ink-200 rounded w-28" />
            <div className="h-4 bg-ink-200 rounded w-20" />
            <div className="h-4 bg-ink-200 rounded w-32" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-5 bg-ink-200 rounded w-16" />
            <div className="h-5 bg-ink-200 rounded w-20" />
            <div className="h-5 bg-ink-200 rounded w-14" />
          </div>
        </div>
      ))}
    </div>
  );
};
