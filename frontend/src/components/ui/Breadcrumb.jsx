import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Breadcrumb = ({ items = [], className = '' }) => {
  return (
    <nav className={`flex items-center space-x-1 text-xs text-slate-500 select-none ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="hover:text-slate-800 transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`truncate max-w-[150px] ${isLast ? 'font-medium text-slate-800' : ''}`}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
