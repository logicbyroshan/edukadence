import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(({
  label,
  options = [],
  error,
  helperText,
  className = '',
  disabled = false,
  required = false,
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          className={`
            block w-full appearance-none rounded-lg border text-sm transition-all
            pl-3.5 pr-10 py-2 bg-white text-slate-900
            ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'}
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            focus:outline-none ${className}
          `}
          {...props}
        >
          {children || options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';
