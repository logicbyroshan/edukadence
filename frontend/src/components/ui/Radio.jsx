import React from 'react';

export const Radio = ({
  label,
  description,
  name,
  value,
  checked,
  onChange,
  disabled = false,
  id,
  className = '',
  ...props
}) => {
  const radioId = id || `${name}-${value}`;

  return (
    <div className={`flex items-start gap-2.5 select-none ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={radioId}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500 disabled:opacity-50 cursor-pointer"
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="text-xs">
          {label && (
            <label htmlFor={radioId} className={`font-medium ${disabled ? 'text-slate-400' : 'text-slate-700 cursor-pointer'}`}>
              {label}
            </label>
          )}
          {description && <p className="text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
    </div>
  );
};
