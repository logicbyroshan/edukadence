import React, { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const MemoryActivity = ({ content = {}, onComplete }) => {
  const initialCards = content.cards || ['🦁', '🦁', '🐼', '🐼', '🐸', '🐸'];
  // Shuffle cards on mount
  const [cards] = useState(() =>
    initialCards
      .map((emoji, index) => ({ id: index, emoji }))
      .sort(() => Math.random() - 0.5)
  );

  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedEmojis, setMatchedEmojis] = useState(new Set());

  const handleCardClick = (index) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index)) return;
    const card = cards[index];
    if (matchedEmojis.has(card.emoji)) return;

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      const card1 = cards[nextFlipped[0]];
      const card2 = cards[nextFlipped[1]];

      if (card1.emoji === card2.emoji) {
        const nextMatched = new Set(matchedEmojis);
        nextMatched.add(card1.emoji);
        setMatchedEmojis(nextMatched);
        setFlippedIndices([]);

        if (nextMatched.size * 2 >= cards.length) {
          setTimeout(() => {
            onComplete({ correct_count: cards.length / 2, total_count: cards.length / 2 });
          }, 1000);
        }
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto py-2">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span>{content.instruction || 'Find the matching pairs!'}</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Jungle Memory Match 🐵
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2 max-w-xs mx-auto">
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedEmojis.has(card.emoji);
          return (
            <button
              key={idx}
              onClick={() => handleCardClick(idx)}
              className={`
                h-20 sm:h-24 rounded-2xl font-black text-3xl sm:text-4xl border-3 transition-all transform duration-300 flex items-center justify-center select-none active:scale-95 shadow-sm
                ${isFlipped
                  ? 'bg-white border-amber-300 rotate-0'
                  : 'bg-gradient-to-br from-indigo-500 to-brand-600 border-brand-700 text-white'}
              `}
            >
              {isFlipped ? card.emoji : '❓'}
            </button>
          );
        })}
      </div>

      {matchedEmojis.size * 2 >= cards.length && (
        <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>You found all matching animals! ⭐</span>
        </div>
      )}
    </div>
  );
};
