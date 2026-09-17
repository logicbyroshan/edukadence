import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  type = 'text',
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  disabled = false,
  required = false,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={`
            block w-full rounded-lg border text-sm transition-all
            ${leftIcon ? 'pl-9' : 'pl-3.5'}
            ${rightIcon ? 'pr-9' : 'pr-3.5'}
            py-2 bg-white text-slate-900 placeholder:text-slate-400
            ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 ring-1 ring-rose-300' : 'border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'}
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            focus:outline-none ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 animate-in fade-in">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
