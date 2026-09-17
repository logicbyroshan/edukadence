import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Failed to load content',
  message = 'An unexpected error occurred while fetching information from the server.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-2xl border border-rose-100 bg-rose-50/40 flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-100/80 flex items-center justify-center text-rose-600 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-rose-950">{title}</h4>
      <p className="text-xs text-rose-700/80 max-w-md mt-1 mb-5">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="secondary">
          Try Again
        </Button>
      )}
    </div>
  );
};
