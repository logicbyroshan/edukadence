import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Box } from 'lucide-react';

export const SortActivity = ({ content = {}, onComplete }) => {
  const baskets = content.baskets || [
    { id: 'big', title: 'Big Box 📦' },
    { id: 'small', title: 'Small Box 🛍️' },
  ];

  const items = content.items || [
    { id: 'i1', label: '🐘 Elephant', basket: 'big' },
    { id: 'i2', label: '🐜 Ant', basket: 'small' },
    { id: 'i3', label: '🚌 Big Bus', basket: 'big' },
    { id: 'i4', label: '🍓 Strawberry', basket: 'small' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortedItems, setSortedItems] = useState({ big: [], small: [] });
  const [isFinished, setIsFinished] = useState(false);

  const currentItem = items[currentIndex];

  const handleBasketClick = (basketId) => {
    if (!currentItem) return;

    if (currentItem.basket === basketId) {
      setSortedItems((prev) => ({
        ...prev,
        [basketId]: [...(prev[basketId] || []), currentItem],
      }));

      if (currentIndex + 1 >= items.length) {
        setIsFinished(true);
        setTimeout(() => {
          onComplete({ correct_count: items.length, total_count: items.length });
        }, 1000);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto py-2">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>{content.instruction || 'Sort items into the right box!'}</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Where does this toy belong?
        </h2>
      </div>

      {/* Active Item to Sort */}
      {!isFinished && currentItem && (
        <div className="p-5 rounded-3xl bg-white border-3 border-purple-200 shadow-md inline-block min-w-[200px] animate-in zoom-in duration-200">
          <span className="text-xs font-bold text-slate-400 block mb-1">
            Item {currentIndex + 1} of {items.length}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            {currentItem.label}
          </span>
        </div>
      )}

      {/* Target Baskets */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 pt-2">
        {baskets.map((basket) => (
          <button
            key={basket.id}
            onClick={() => handleBasketClick(basket.id)}
            disabled={isFinished}
            className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-purple-50 hover:bg-purple-100 border-2 sm:border-3 border-dashed border-purple-300 transition-all flex flex-col items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <span className="text-xs sm:text-lg font-black text-purple-900">{basket.title}</span>
            <div className="min-h-[40px] sm:min-h-[50px] flex flex-wrap gap-1 items-center justify-center">
              {sortedItems[basket.id]?.map((it) => (
                <span
                  key={it.id}
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl bg-white border border-purple-200 text-[10px] sm:text-xs font-bold text-slate-700 shadow-xs"
                >
                  {it.label}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {isFinished && (
        <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>Everything sorted neatly! ⭐</span>
        </div>
      )}
    </div>
  );
};
