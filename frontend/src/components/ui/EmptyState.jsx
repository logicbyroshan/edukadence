import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon = <FolderOpen className="w-10 h-10 text-slate-300" />,
  title = 'No records found',
  description = 'There is currently no data to display for this view.',
  actionLabel = null,
  onAction = null,
  className = '',
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 flex flex-col items-center justify-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-slate-800 tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
