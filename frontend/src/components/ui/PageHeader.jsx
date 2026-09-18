import React from 'react';
import { Breadcrumb } from './Breadcrumb';

export const PageHeader = ({
  title,
  subtitle,
  description,
  breadcrumbs = [],
  action = null,
  actions = null,
  className = '',
}) => {
  const subText = subtitle || description;
  const actionContent = action || actions;

  return (
    <div className={`mb-6 pb-4 border-b border-slate-200/80 ${className}`}>
      {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} className="mb-2" />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subText && (
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {subText}
            </p>
          )}
        </div>
        {actionContent && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actionContent}</div>}
      </div>
    </div>
  );
};
