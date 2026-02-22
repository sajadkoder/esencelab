'use client';

import { SelectHTMLAttributes, forwardRef, useState } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, id, onFocus, onBlur, ...rest }, ref) => {
    const inputId = id || label.replace(/\s+/g, '-').toLowerCase();
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full relative pt-2">
        <label
          htmlFor={inputId}
          className="absolute left-4 transition-all duration-200 pointer-events-none text-xs px-1 bg-background text-secondary z-10 -top-1"
        >
          {label}
        </label>
        <select
          id={inputId}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={`w-full rounded-xl border bg-transparent px-4 py-3.5 text-primary text-base transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary relative z-0 appearance-none
            ${error ? 'border-red-500' : 'border-border'} ${className}`}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white text-primary">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none mt-1">
          <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500 px-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
