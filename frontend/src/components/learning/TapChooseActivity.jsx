import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export const TapChooseActivity = ({ content = {}, onComplete }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const options = content.options || [
    { id: 'opt1', label: 'Triangle', icon: '🔺', is_correct: true },
    { id: 'opt2', label: 'Square', icon: '🟦', is_correct: false },
    { id: 'opt3', label: 'Circle', icon: '🟡', is_correct: false },
  ];

  const handleSelect = (opt) => {
    setSelectedId(opt.id);
    if (opt.is_correct) {
      setIsCorrect(true);
      setTimeout(() => {
        onComplete({ correct_count: 1, total_count: 1, answer_metadata: { selected: opt.id } });
      }, 1000);
    } else {
      setIsCorrect(false);
      setTimeout(() => {
        setIsCorrect(null);
        setSelectedId(null);
      }, 1200);
    }
  };

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto py-2">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>{content.instruction || 'Tap the right answer!'}</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {content.question || 'Which one is correct?'}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
        {options.map((opt) => {
          const isThisSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt)}
              disabled={isCorrect === true}
              className={`
                p-5 rounded-3xl border-3 transition-all flex flex-col items-center justify-center gap-3 active:scale-95 select-none shadow-sm
                ${isThisSelected && isCorrect === true
                  ? 'bg-emerald-500 border-emerald-600 text-white ring-4 ring-emerald-200 scale-105'
                  : isThisSelected && isCorrect === false
                  ? 'bg-rose-100 border-rose-400 text-rose-800 shake'
                  : 'bg-white hover:bg-sky-50 border-sky-200 text-slate-800 hover:border-sky-400'}
              `}
            >
              <span className="text-4xl sm:text-5xl block animate-bounce-slow">
                {opt.icon || '⭐'}
              </span>
              <span className="text-base font-black">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {isCorrect === true && (
        <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>Super! That is correct! ⭐</span>
        </div>
      )}

      {isCorrect === false && (
        <div className="p-3 bg-rose-100 text-rose-900 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 animate-in fade-in">
          <XCircle className="w-4 h-4 text-rose-600" />
          <span>Oops! Try again, little explorer! 🌱</span>
        </div>
      )}
    </div>
  );
};
