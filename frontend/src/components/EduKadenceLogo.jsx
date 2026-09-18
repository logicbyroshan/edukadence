import React from 'react';
import logoImg from '../assets/logo.png';

export const EduKadenceLogo = ({
  className = 'h-8',
  showText = true,
  variant = 'dark',
  subtitle = 'Early Ed SaaS'
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* Official High-Resolution EduKadence Logo Asset */}
      <img
        src={logoImg}
        alt="EduKadence Logo"
        className="h-full w-auto aspect-square object-contain shrink-0 filter drop-shadow-xs"
      />

      {showText && (
        <div className="flex flex-col leading-none justify-center">
          <div className="flex items-center">
            <span
              className={`text-lg font-black tracking-tight ${
                variant === 'light' ? 'text-white' : 'text-slate-900'
              }`}
            >
              Edu<span className="text-brand-500 font-black">Kadence</span>
            </span>
          </div>
          {subtitle && (
            <span
              className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 truncate max-w-[130px] sm:max-w-[220px] ${
                variant === 'light' ? 'text-skybrand-300' : 'text-slate-400'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
