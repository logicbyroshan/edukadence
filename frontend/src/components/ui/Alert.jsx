import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export const Alert = ({
  type = 'info',
  title,
  children,
  action = null,
  className = '',
}) => {
  const styles = {
    info: 'bg-skybrand-50 border-skybrand-200 text-skybrand-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    danger: 'bg-rose-50 border-rose-200 text-rose-900',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-skybrand-600 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
  };

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${styles[type] || styles.info} ${className}`}>
      {icons[type] || icons.info}
      <div className="flex-1 min-w-0">
        {title && <h5 className="font-semibold text-sm mb-0.5">{title}</h5>}
        <div>{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
