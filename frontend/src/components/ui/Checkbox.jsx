import React from 'react';

export const Checkbox = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  id,
  className = '',
  ...props
}) => {
  const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex items-start gap-2.5 select-none ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 disabled:opacity-50 transition-colors cursor-pointer"
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="text-xs">
          {label && (
            <label htmlFor={checkboxId} className={`font-medium ${disabled ? 'text-slate-400' : 'text-slate-700 cursor-pointer'}`}>
              {label}
            </label>
          )}
          {description && <p className="text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
    </div>
  );
};
