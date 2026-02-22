'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, onFocus, onBlur, ...rest }, ref) => {
    const inputId = id || label.replace(/\s+/g, '-').toLowerCase();
    const [isFocused, setIsFocused] = useState(false);

    const hasValue = rest.value !== undefined ? String(rest.value).length > 0 : false;
    const isFloating = isFocused || hasValue;

    return (
      <div className="w-full relative pt-2">
        <label
          htmlFor={inputId}
          className={`absolute left-4 transition-all duration-200 pointer-events-none
            ${isFloating ? '-top-1 text-xs px-1 bg-background text-secondary z-10' : 'top-5 text-base text-secondary z-0'}`}
        >
          {label}
        </label>
        <input
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
          className={`w-full rounded-xl border bg-transparent px-4 py-3.5 text-primary text-base transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary relative z-0
            ${error ? 'border-red-500' : 'border-border'} ${className}`}
          {...rest}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500 px-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
