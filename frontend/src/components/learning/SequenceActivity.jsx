import React, { useState } from 'react';
import { Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

export const SequenceActivity = ({ content = {}, onComplete }) => {
  const targetSequence = content.sequence || [1, 2, 3, 4, 5];
  // Shuffle numbers for child to tap in sequence
  const [shuffled] = useState(() => [...targetSequence].sort(() => Math.random() - 0.5));
  const [tappedSequence, setTappedSequence] = useState([]);
  const [isError, setIsError] = useState(false);

  const handleTap = (num) => {
    if (tappedSequence.includes(num)) return;
    const expected = targetSequence[tappedSequence.length];

    if (num === expected) {
      const next = [...tappedSequence, num];
      setTappedSequence(next);

      if (next.length === targetSequence.length) {
        setTimeout(() => {
          onComplete({ correct_count: targetSequence.length, total_count: targetSequence.length });
        }, 1000);
      }
    } else {
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
      }, 800);
    }
  };

  const handleReset = () => {
    setTappedSequence([]);
    setIsError(false);
  };

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto py-2">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>{content.instruction || 'Tap in numerical order!'}</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Rocket Number Launch 🚀
        </h2>
      </div>

      {/* Progress sequence slots */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 min-h-[50px]">
        {targetSequence.map((_, i) => (
          <div
            key={i}
            className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border-2 sm:border-3 flex items-center justify-center font-black text-lg sm:text-xl transition-all
              ${tappedSequence[i] !== undefined
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm scale-105'
                : 'bg-slate-100 border-dashed border-slate-300 text-slate-400'}
            `}
          >
            {tappedSequence[i] !== undefined ? tappedSequence[i] : (i + 1)}
          </div>
        ))}
      </div>

      {/* Number Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
        {shuffled.map((num) => {
          const isUsed = tappedSequence.includes(num);
          return (
            <button
              key={num}
              onClick={() => handleTap(num)}
              disabled={isUsed}
              className={`
                w-12 h-12 sm:w-16 sm:h-16 rounded-2xl font-black text-xl sm:text-2xl border-2 sm:border-3 transition-all active:scale-95 shadow-sm
                ${isUsed
                  ? 'bg-slate-100 border-slate-200 text-slate-300 opacity-50'
                  : isError
                  ? 'bg-rose-100 border-rose-400 text-rose-800'
                  : 'bg-white hover:bg-sky-50 border-sky-300 text-slate-800 hover:scale-105'}
              `}
            >
              {num}
            </button>
          );
        })}
      </div>

      {tappedSequence.length > 0 && tappedSequence.length < targetSequence.length && (
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Order</span>
        </button>
      )}

      {tappedSequence.length === targetSequence.length && (
        <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>3... 2... 1... Blast off! 🚀⭐</span>
        </div>
      )}
    </div>
  );
};
