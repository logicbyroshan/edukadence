import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 w-56 rounded-xl bg-white shadow-elevated border border-slate-100 py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100
            ${align === 'right' ? 'right-0' : 'left-0'} ${className}
          `}
        >
          <div onClick={() => setIsOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  icon = null,
  danger = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors
        ${danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}
        ${className}
      `}
    >
      {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
};

export const DropdownDivider = () => (
  <div className="my-1 border-t border-slate-100" />
);
