import React, { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const DragDropActivity = ({ content = {}, onComplete }) => {
  const targetLabel = content.target_label || 'Caterpillar 🐛';
  const initialItems = content.items || [
    { id: 'd1', label: '🍃 Leaf 1' },
    { id: 'd2', label: '🌿 Leaf 2' },
    { id: 'd3', label: '🌱 Leaf 3' },
  ];

  const [remainingItems, setRemainingItems] = useState(initialItems);
  const [fedItems, setFedItems] = useState([]);

  const handleFeed = (item) => {
    setRemainingItems((prev) => prev.filter((i) => i.id !== item.id));
    const nextFed = [...fedItems, item];
    setFedItems(nextFed);

    if (nextFed.length === initialItems.length) {
      setTimeout(() => {
        onComplete({ correct_count: initialItems.length, total_count: initialItems.length });
      }, 1000);
    }
  };

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto py-2">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{content.instruction || 'Tap items to feed the hungry friend!'}</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Feed the {targetLabel}
        </h2>
      </div>

      {/* Target Plate */}
      <div className="p-8 rounded-3xl bg-emerald-50 border-4 border-dashed border-emerald-300 min-h-[140px] flex flex-col items-center justify-center gap-3">
        <span className="text-4xl animate-bounce-slow">🐛</span>
        <span className="text-sm font-extrabold text-emerald-900">
          {fedItems.length === initialItems.length ? 'Burp! Yum yum, thank you! 🥰' : 'I am hungry! Give me yummy leaves!'}
        </span>
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {fedItems.map((it) => (
            <span key={it.id} className="px-3 py-1 bg-white border border-emerald-300 rounded-full text-xs font-bold text-emerald-800 shadow-xs">
              {it.label}
            </span>
          ))}
        </div>
      </div>

      {/* Available Items */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {remainingItems.map((it) => (
          <button
            key={it.id}
            onClick={() => handleFeed(it)}
            className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white hover:bg-emerald-50 border-2 sm:border-3 border-emerald-200 text-slate-800 font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            {it.label}
          </button>
        ))}
      </div>

      {fedItems.length === initialItems.length && (
        <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>The caterpillar is happily fed! ⭐</span>
        </div>
      )}
    </div>
  );
};
