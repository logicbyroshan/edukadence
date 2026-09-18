import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Palette } from 'lucide-react';

export const ColorActivity = ({ content = {}, onComplete }) => {
  const palette = content.palette || ['#F59E0B', '#0EA5E9', '#10B981', '#EF4444', '#8B5CF6'];
  const [selectedColor, setSelectedColor] = useState(palette[0]);
  const [coloredParts, setColoredParts] = useState({});

  const colorShape = (partId) => {
    setColoredParts((prev) => {
      const next = { ...prev, [partId]: selectedColor };
      if (Object.keys(next).length >= 3) {
        setTimeout(() => {
          onComplete({ correct_count: 1, total_count: 1 });
        }, 1000);
      }
      return next;
    });
  };

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto py-2">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-black uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5 text-rose-600" />
          <span>{content.instruction || 'Pick a color and tap to paint!'}</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Color the Sunny Sky 🎨
        </h2>
      </div>

      {/* Interactive Painting Shapes */}
      <div className="p-4 sm:p-8 rounded-3xl bg-slate-50 border-2 sm:border-3 border-slate-200 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
        <button
          onClick={() => colorShape('sun')}
          style={{ backgroundColor: coloredParts['sun'] || '#FEF3C7' }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-amber-300 shadow-md flex items-center justify-center text-2xl sm:text-3xl transition-transform active:scale-95"
          title="Sun"
        >
          ☀️
        </button>

        <button
          onClick={() => colorShape('cloud')}
          style={{ backgroundColor: coloredParts['cloud'] || '#E0F2FE' }}
          className="w-20 h-14 sm:w-24 sm:h-16 rounded-2xl sm:rounded-3xl border-3 border-sky-300 shadow-md flex items-center justify-center text-2xl sm:text-3xl transition-transform active:scale-95"
          title="Cloud"
        >
          ☁️
        </button>

        <button
          onClick={() => colorShape('rainbow')}
          style={{ backgroundColor: coloredParts['rainbow'] || '#F3E8FF' }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-3 border-purple-300 shadow-md flex items-center justify-center text-2xl sm:text-3xl transition-transform active:scale-95"
          title="Rainbow"
        >
          🌈
        </button>
      </div>

      {/* Palette Colors */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose your color:</p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {palette.map((hex) => (
            <button
              key={hex}
              onClick={() => setSelectedColor(hex)}
              style={{ backgroundColor: hex }}
              className={`
                w-9 h-9 sm:w-12 sm:h-12 rounded-2xl border-3 transition-transform active:scale-90 shadow-sm
                ${selectedColor === hex ? 'ring-3 sm:ring-4 ring-slate-400 scale-110 sm:scale-115 border-white' : 'border-transparent hover:scale-105'}
              `}
            />
          ))}
        </div>
      </div>

      {Object.keys(coloredParts).length >= 3 && (
        <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>Beautiful painting! You are a true artist! ⭐</span>
        </div>
      )}
    </div>
  );
};
