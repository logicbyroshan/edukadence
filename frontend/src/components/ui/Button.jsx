import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] whitespace-nowrap';

  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm border border-transparent',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm',
    sky: 'bg-skybrand-500 text-navy-950 font-bold hover:bg-skybrand-400 shadow-sm border border-transparent',
    outline: 'bg-transparent text-brand-600 border border-brand-300 hover:bg-brand-50 hover:border-brand-400',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm border border-transparent',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1 gap-1 h-7 rounded-lg',
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8.5 rounded-lg',
    md: 'text-sm px-4 py-2 gap-2 h-10 rounded-xl',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-11 rounded-xl',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0 inline-flex items-center justify-center">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && (
        <span className="shrink-0 inline-flex items-center justify-center">{rightIcon}</span>
      )}
    </button>
  );
};
