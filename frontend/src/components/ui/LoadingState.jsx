import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({
  message = 'Loading data...',
  className = '',
}) => {
  return (
    <div className={`p-12 flex flex-col items-center justify-center gap-3 text-slate-500 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      <span className="text-xs font-medium tracking-wide">{message}</span>
    </div>
  );
};

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded-md ${className}`} />
);
