import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: FilterOption[];
  placeholder?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'All',
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`relative flex flex-col gap-1 ${className}`}>
      {label ? (
        <label htmlFor={selectId} className="text-xs font-semibold text-ink-600 uppercase tracking-wider">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          className="appearance-none w-full h-11 pl-3.5 pr-8 rounded-button bg-canvas-card border border-canvas-border text-ink-800 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none transition-all shadow-subtle cursor-pointer"
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
