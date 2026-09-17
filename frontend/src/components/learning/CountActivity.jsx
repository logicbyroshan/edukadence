import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export const CountActivity = ({ content = {}, onComplete }) => {
  const targetCount = content.count || 4;
  const itemEmoji = content.item_emoji || '🍎';
  const options = content.options || [2, 3, 4, 5];
  const [tappedIndices, setTappedIndices] = useState(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const toggleItem = (index) => {
    setTappedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleSelectAnswer = (num) => {
    setSelectedAnswer(num);
    if (num === targetCount) {
      setIsCorrect(true);
      setTimeout(() => {
        onComplete({ correct_count: 1, total_count: 1, answer_metadata: { answered: num } });
      }, 1000);
    } else {
      setIsCorrect(false);
      setTimeout(() => {
        setIsCorrect(null);
        setSelectedAnswer(null);
      }, 1200);
    }
  };

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto py-2">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{content.instruction || 'Touch each item to count!'}</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          How many {itemEmoji} do you see?
        </h2>
      </div>

      {/* Interactive Item Tap Canvas */}
      <div className="p-6 rounded-3xl bg-amber-50/70 border-3 border-amber-200 flex items-center justify-center flex-wrap gap-4 min-h-[140px]">
        {Array.from({ length: targetCount }).map((_, idx) => {
          const isTapped = tappedIndices.has(idx);
          return (
            <button
              key={idx}
              onClick={() => toggleItem(idx)}
              className={`
                text-5xl sm:text-6xl p-3 rounded-2xl transition-all duration-200 active:scale-90 select-none
                ${isTapped ? 'bg-amber-300 ring-4 ring-amber-400 scale-110' : 'hover:scale-105'}
              `}
              title={`Item ${idx + 1}`}
            >
              {itemEmoji}
            </button>
          );
        })}
      </div>

      {/* Count Selection Options */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Select the correct number:
        </p>
        <div className="flex items-center justify-center gap-3">
          {options.map((num) => {
            const isSelected = selectedAnswer === num;
            return (
              <button
                key={num}
                onClick={() => handleSelectAnswer(num)}
                disabled={isCorrect === true}
                className={`
                  w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-black text-xl sm:text-2xl border-3 transition-all active:scale-95 shadow-sm
                  ${isSelected && isCorrect === true
                    ? 'bg-emerald-500 border-emerald-600 text-white ring-4 ring-emerald-200 scale-110'
                    : isSelected && isCorrect === false
                    ? 'bg-rose-100 border-rose-400 text-rose-800'
                    : 'bg-white hover:bg-sky-50 border-sky-200 text-slate-800 hover:border-sky-400'}
                `}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {isCorrect === true && (
        <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>Great counting! There are {targetCount} {itemEmoji}! ⭐</span>
        </div>
      )}

      {isCorrect === false && (
        <div className="p-3 bg-rose-100 text-rose-900 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 animate-in fade-in">
          <XCircle className="w-4 h-4 text-rose-600" />
          <span>Count again carefully! You can do it! 🌱</span>
        </div>
      )}
    </div>
  );
};
