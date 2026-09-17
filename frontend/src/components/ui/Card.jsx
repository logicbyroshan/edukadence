import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-slate-200/80 shadow-card
        ${hover ? 'transition-all hover:shadow-elevated hover:border-slate-300 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', action = null }) => (
  <div className={`p-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-3 ${className}`}>
    <div className="min-w-0 flex-1">{children}</div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base font-semibold text-slate-900 tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-xs text-slate-500 mt-0.5 leading-relaxed ${className}`}>
    {children}
  </p>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-4 px-5 bg-slate-50/70 border-t border-slate-100 rounded-b-xl flex items-center justify-between gap-3 ${className}`}>
    {children}
  </div>
);
