import React, { useState } from 'react';

export const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  status = null,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusColors = {
    online: 'bg-emerald-500 ring-white',
    offline: 'bg-slate-300 ring-white',
    busy: 'bg-rose-500 ring-white',
    away: 'bg-amber-500 ring-white',
  };

  const getInitials = (n) => {
    if (!n) return 'EK';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-block select-none shrink-0 ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className={`${sizes[size] || sizes.md} rounded-full object-cover border border-slate-200`}
        />
      ) : (
        <div
          className={`
            ${sizes[size] || sizes.md} rounded-full flex items-center justify-center font-semibold
            bg-brand-100 text-brand-700 border border-brand-200
          `}
        >
          {getInitials(name || alt)}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full ring-2 ${statusColors[status] || statusColors.online}`}
        />
      )}
    </div>
  );
};
