import React from 'react';

export const Toggle = ({
  enabled = false,
  onChange,
  disabled = false,
  label,
  description,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between gap-3 select-none ${className}`}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-medium text-slate-800">{label}</span>}
          {description && <span className="text-[11px] text-slate-500">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => !disabled && onChange && onChange(!enabled)}
        className={`
          relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-ring
          ${enabled ? 'bg-brand-600' : 'bg-slate-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out
            ${enabled ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
};
