import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Volume2, BookOpen, CheckCircle2 } from 'lucide-react';

export const StoryReader = ({ story = {}, onComplete }) => {
  const scenes = story.scenes || [
    {
      scene_number: 1,
      title: 'The Morning Sunshine',
      text_content: 'Once upon a sunny morning, Pip the little bear woke up in his cozy mossy cave. A shimmering purple butterfly landed right on his nose!',
      illustration_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
      checkpoint_prompt: {
        question: 'Who woke up Pip the bear?',
        options: ['A Butterfly', 'A Frog'],
        answer: 'A Butterfly',
      },
    },
    {
      scene_number: 2,
      title: 'The Whispering Forest',
      text_content: 'Pip followed the fluttering butterfly past tall pine trees and singing bluebirds until they reached a field of bright yellow sunflowers.',
      illustration_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      checkpoint_prompt: {
        question: 'What color were the flowers?',
        options: ['Bright Yellow', 'Dark Grey'],
        answer: 'Bright Yellow',
      },
    },
  ];

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const currentScene = scenes[currentSceneIndex] || scenes[0];

  const handleNext = () => {
    if (currentSceneIndex + 1 >= scenes.length) {
      onComplete({ correct_count: scenes.length, total_count: scenes.length });
    } else {
      setCurrentSceneIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    }
  };

  const handlePrev = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((prev) => prev - 1);
      setSelectedAnswer(null);
    }
  };

  const readAloud = () => {
    const utterance = new SpeechSynthesisUtterance(currentScene.text_content);
    window.speechSynthesis?.speak(utterance);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-1">
      {/* Story Scene Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
            Page {currentSceneIndex + 1} of {scenes.length}
          </span>
        </div>
        <button
          onClick={readAloud}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold transition-colors"
        >
          <Volume2 className="w-4 h-4 text-sky-600" />
          <span>Read to Me</span>
        </button>
      </div>

      {/* Scene Illustration */}
      <div className="rounded-3xl overflow-hidden border-3 border-sky-200 shadow-md bg-slate-100 max-h-[220px]">
        <img
          src={currentScene.illustration_url}
          alt={currentScene.title}
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Scene Text */}
      <div className="p-5 rounded-3xl bg-amber-50/80 border-2 border-amber-200 text-left space-y-2">
        <h3 className="text-lg font-black text-amber-950">{currentScene.title}</h3>
        <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
          {currentScene.text_content}
        </p>
      </div>

      {/* Checkpoint Prompt (if any) */}
      {currentScene.checkpoint_prompt?.question && (
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 space-y-2 text-center">
          <p className="text-xs font-extrabold text-brand-600 uppercase">
            Story Question: {currentScene.checkpoint_prompt.question}
          </p>
          <div className="flex items-center justify-center gap-3">
            {currentScene.checkpoint_prompt.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedAnswer(opt)}
                className={`
                  px-4 py-2 rounded-xl text-xs font-extrabold border-2 transition-all
                  ${selectedAnswer === opt
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'}
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={currentSceneIndex === 0}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-sm flex items-center gap-2 shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <span>{currentSceneIndex + 1 === scenes.length ? 'Finish Story ⭐' : 'Next Page'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
