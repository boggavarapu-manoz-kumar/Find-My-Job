import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    neutral: 'bg-canvas-subtle text-ink-700 border-canvas-border',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-soft text-emerald-text border-emerald-text/20',
    warning: 'bg-amber-soft text-amber-text border-amber-text/20',
    danger: 'bg-rose-soft text-rose-text border-rose-text/20',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-badge tracking-tight ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const Tag: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center text-xs text-ink-600 bg-canvas-subtle border border-canvas-border px-2 py-0.5 rounded-badge hover:bg-canvas-hover transition-colors ${className}`}
    >
      {children}
    </span>
  );
};
