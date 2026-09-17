import React, { forwardRef } from 'react';

export const Textarea = forwardRef(({
  label,
  error,
  helperText,
  rows = 3,
  className = '',
  disabled = false,
  required = false,
  id,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-medium text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`
          block w-full rounded-lg border text-sm transition-all
          p-3 bg-white text-slate-900 placeholder:text-slate-400
          ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'}
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          focus:outline-none ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
