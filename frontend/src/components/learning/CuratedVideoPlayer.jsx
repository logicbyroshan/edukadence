import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Play, Check } from 'lucide-react';

export const CuratedVideoPlayer = ({ video = {}, onComplete }) => {
  const [hasWatched, setHasWatched] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const checkpoint = video.checkpoint_question || {
    question: 'What parts of plants drink water?',
    options: ['Roots', 'Leaves'],
    answer: 'Roots',
  };

  const handleAnswer = (opt) => {
    setSelectedAnswer(opt);
    if (opt === checkpoint.answer) {
      setTimeout(() => {
        onComplete({ correct_count: 1, total_count: 1 });
      }, 1000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-1 text-center">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Curated Safe Learning Video</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {video.title || 'How Plants Drink Water'}
        </h2>
      </div>

      {/* Safe HTML5 Video Player */}
      <div className="rounded-3xl overflow-hidden border-4 border-indigo-200 shadow-lg bg-black aspect-video max-w-xl mx-auto">
        <video
          controls
          className="w-full h-full object-cover"
          poster={video.thumbnail_url || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80'}
          onEnded={() => setHasWatched(true)}
        >
          <source src={video.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4'} type="video/mp4" />
          Your browser does not support HTML video.
        </video>
      </div>

      {/* Checkpoint Question after watching or instant unlock */}
      <div className="p-5 rounded-3xl bg-indigo-50/70 border-2 border-indigo-200 max-w-xl mx-auto space-y-3">
        <p className="text-sm font-extrabold text-indigo-950">
          Quiz: {checkpoint.question}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {checkpoint.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className={`
                px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-black text-xs sm:text-sm border-2 transition-all active:scale-95
                ${selectedAnswer === opt && opt === checkpoint.answer
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                  : 'bg-white hover:bg-indigo-100 border-indigo-200 text-slate-800'}
              `}
            >
              {opt}
            </button>
          ))}
        </div>

        {selectedAnswer === checkpoint.answer && (
          <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Awesome! Roots absorb moisture from the earth! ⭐</span>
          </div>
        )}
      </div>
    </div>
  );
};
