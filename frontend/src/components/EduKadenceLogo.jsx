import React from 'react';

export const EduKadenceLogo = ({ className = 'h-8', showText = true, variant = 'dark' }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* Brand Icon SVG */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto aspect-square shrink-0"
      >
        <rect width="40" height="40" rx="10" fill="#2563EB" />
        {/* Sky accent dynamic curve */}
        <path
          d="M12 28C12 28 15 22 22 22C29 22 30 16 30 16"
          stroke="#38BDF8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Modern Spark / Academic Cadence star */}
        <path
          d="M20 10L22 15L27 16L22.5 19.5L24 25L20 21.5L16 25L17.5 19.5L13 16L18 15L20 10Z"
          fill="white"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`text-lg font-bold tracking-tight ${variant === 'light' ? 'text-white' : 'text-slate-900'}`}>
            Edu<span className="text-brand-600">Kadence</span>
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            Early Ed SaaS
          </span>
        </div>
      )}
    </div>
  );
};
