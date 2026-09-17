import React from 'react';
import { Loader2 } from 'lucide-react';

export const IconButton = ({
  icon,
  type = 'button',
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  disabled = false,
  ariaLabel,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all focus-ring disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97]';

  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm',
    ghost: 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
  };

  const sizes = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base',
  };

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.ghost} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
    </button>
  );
};
