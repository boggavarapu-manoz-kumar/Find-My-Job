import React from 'react';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  tag?: string;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  action,
  tag,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-canvas-border ${className}`}>
      <div className="space-y-1">
        {tag ? (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 block">
            {tag}
          </span>
        ) : null}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm text-ink-500 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
};
