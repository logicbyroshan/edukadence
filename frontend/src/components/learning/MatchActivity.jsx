import React, { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const MatchActivity = ({ content = {}, onComplete }) => {
  const pairs = content.pairs || [
    { id: 'p1', left: '🐟 Fish', right: '🌊 Ocean' },
    { id: 'p2', left: '🐦 Bird', right: '🌳 Tree Nest' },
    { id: 'p3', left: '🐝 Bee', right: '🍯 Hive' },
  ];

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(new Set());

  const handleLeftClick = (p) => {
    if (matchedPairs.has(p.id)) return;
    setSelectedLeft(p);
  };

  const handleRightClick = (p) => {
    if (!selectedLeft) return;
    if (selectedLeft.id === p.id) {
      const nextMatched = new Set(matchedPairs);
      nextMatched.add(p.id);
      setMatchedPairs(nextMatched);
      setSelectedLeft(null);

      if (nextMatched.size === pairs.length) {
        setTimeout(() => {
          onComplete({ correct_count: pairs.length, total_count: pairs.length });
        }, 1000);
      }
    } else {
      // Mismatch animation
      setSelectedLeft(null);
    }
  };

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto py-2">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{content.instruction || 'Match the pairs!'}</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Connect Friends with their Homes! 🏡
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 pt-2">
        {/* Left column */}
        <div className="space-y-2.5 sm:space-y-3">
          {pairs.map((p) => {
            const isMatched = matchedPairs.has(p.id);
            const isSelected = selectedLeft?.id === p.id;
            return (
              <button
                key={`left-${p.id}`}
                onClick={() => handleLeftClick(p)}
                disabled={isMatched}
                className={`
                  w-full p-2.5 sm:p-4 rounded-2xl font-black text-xs sm:text-base border-2 sm:border-3 transition-all text-left flex items-center justify-between gap-1
                  ${isMatched
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-900 opacity-80'
                    : isSelected
                    ? 'bg-brand-500 border-brand-600 text-white ring-2 sm:ring-4 ring-brand-200 scale-102'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'}
                `}
              >
                <span className="truncate">{p.left}</span>
                {isMatched && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2.5 sm:space-y-3">
          {pairs.map((p) => {
            const isMatched = matchedPairs.has(p.id);
            return (
              <button
                key={`right-${p.id}`}
                onClick={() => handleRightClick(p)}
                disabled={isMatched}
                className={`
                  w-full p-2.5 sm:p-4 rounded-2xl font-black text-xs sm:text-base border-2 sm:border-3 transition-all text-left flex items-center justify-between gap-1
                  ${isMatched
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-900 opacity-80'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'}
                `}
              >
                <span className="truncate">{p.right}</span>
                {isMatched && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {matchedPairs.size === pairs.length && (
        <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>All pairs matched perfectly! ⭐</span>
        </div>
      )}
    </div>
  );
};
