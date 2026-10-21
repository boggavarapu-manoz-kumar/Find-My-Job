import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search by title, skill or company...',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3.5 text-ink-400 pointer-events-none flex items-center">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-11 pl-10 pr-9 rounded-button bg-canvas-card border border-canvas-border text-ink-900 placeholder:text-ink-400 text-sm transition-all focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none shadow-subtle"
        {...props}
      />
      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search input"
          className="absolute right-3 p-0.5 rounded text-ink-400 hover:text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  );
};
