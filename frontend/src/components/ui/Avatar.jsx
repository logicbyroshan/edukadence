import React, { useState, useEffect } from 'react';

export const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  shape = 'circle',
  status = null,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const shapes = {
    circle: 'rounded-full',
    rounded: 'rounded-2xl',
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

  const shapeClass = shapes[shape] || shapes.circle;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`relative inline-block select-none shrink-0 ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setImageError(true)}
          className={`${sizeClass} ${shapeClass} object-cover border border-slate-200/80 shadow-xs`}
        />
      ) : (
        <div
          className={`
            ${sizeClass} ${shapeClass} flex items-center justify-center font-extrabold
            bg-gradient-to-br from-brand-100 via-skybrand-100 to-brand-200
            text-brand-800 border border-brand-200 shadow-xs
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
