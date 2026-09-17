import React, { useState } from 'react';
import {
  Sparkles,
  Star,
  Gamepad2,
  BookOpen,
  Palette,
  Volume2,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Smile,
  Shapes,
  Music,
} from 'lucide-react';
import { Card, CardBody, Badge, Button } from '../components/ui';

export const KidModePage = () => {
  const [selectedAgeStage, setSelectedAgeStage] = useState('stage-3-4');
  const [interactiveScore, setInteractiveScore] = useState(0);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  const ageStages = [
    {
      id: 'stage-2-3',
      name: 'Explore',
      age: 'Age 2–3',
      color: 'bg-emerald-500',
      badge: 'Sensory & Sounds',
      description: 'Big buttons, animal sounds, color recognition & sensory matching.',
      activities: ['Animal Sound Box', 'Big & Small Sorting', 'Color Pop'],
    },
    {
      id: 'stage-3-4',
      name: 'Discover',
      age: 'Age 3–4',
      color: 'bg-sky-500',
      badge: 'Phonics & Shapes',
      description: 'Letter tracing, counting 1 to 10, pattern discovery & story listening.',
      activities: ['Letter Letter Sound', 'Number Safari 1-10', 'Shape Garden'],
    },
    {
      id: 'stage-4-5',
      name: 'Learn',
      age: 'Age 4–5',
      color: 'bg-brand-600',
      badge: 'Reading & Counting',
      description: 'Early word rhyming, counting 1 to 20, voice-assisted storybooks.',
      activities: ['Rhyme Time', 'Puzzle Quest', 'Storybook Theatre'],
    },
    {
      id: 'stage-5-7',
      name: 'Build',
      age: 'Age 5–7',
      color: 'bg-purple-600',
      badge: 'Math & Logic',
      description: 'Sentence creation, basic addition & subtraction, logical reasoning.',
      activities: ['Word Crafter', 'Math Tile Jump', 'Drawing Studio'],
    },
    {
      id: 'stage-7-9',
      name: 'Create',
      age: 'Age 7–9',
      color: 'bg-rose-500',
      badge: 'Stories & Science',
      description: 'Reading comprehension quests, multiplication adventures & nature science.',
      activities: ['Mystery Chapter Story', 'Space Science Lab', 'Comic Maker'],
    },
    {
      id: 'stage-9-10',
      name: 'Grow',
      age: 'Age 9–10',
      color: 'bg-amber-600',
      badge: 'Projects & Sprints',
      description: 'Critical thinking challenges, self-directed homework sprints & streaks.',
      activities: ['Math Sprint Arena', 'World Geography Explorer', 'Brain Logic Arena'],
    },
  ];

  const handleInteractiveAnswer = (isCorrect) => {
    if (isCorrect) {
      setInteractiveScore((prev) => prev + 1);
      setExerciseCompleted(true);
    }
  };

  const activeStage = ageStages.find((s) => s.id === selectedAgeStage);

  return (
    <div className="space-y-6">
      {/* Kid Mode Cheerful Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-400 via-brand-500 to-indigo-500 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold mb-3">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Age-Appropriate Play & Learn Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hi Leo! Ready to play and learn today?
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 mt-1">
            Choose your learning universe below and unlock new stars!
          </p>
        </div>
      </div>

      {/* Age Stage Progression Selectors */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Developmental Stages (Ages 2–10)
          </h3>
          <span className="text-xs text-slate-500 font-medium">Select a stage to explore</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ageStages.map((stage) => {
            const isSelected = stage.id === selectedAgeStage;
            return (
              <button
                key={stage.id}
                onClick={() => {
                  setSelectedAgeStage(stage.id);
                  setExerciseCompleted(false);
                }}
                className={`
                  p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden select-none
                  ${isSelected
                    ? 'border-brand-500 bg-white ring-2 ring-brand-400 shadow-md scale-[1.02]'
                    : 'border-slate-200 bg-white/80 hover:bg-white hover:border-slate-300'}
                `}
              >
                <div className={`w-3 h-3 rounded-full ${stage.color} mb-2`} />
                <h4 className="text-xs font-bold text-slate-900 leading-tight">{stage.name}</h4>
                <span className="text-[10px] font-semibold text-slate-500">{stage.age}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Activities & Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Exercise Simulator */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-2 border-sky-200 bg-white p-6 rounded-3xl shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-100 text-amber-700">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Interactive Activity: {activeStage?.name} Adventure
                  </h4>
                  <p className="text-xs text-slate-500">{activeStage?.badge}</p>
                </div>
              </div>
              <Badge variant="kid" size="md">
                ⭐ +1 Star Reward
              </Badge>
            </div>

            {/* Simulated Interactive Question */}
            <div className="p-6 rounded-2xl bg-sky-50/70 border border-sky-100 text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                Visual Matching Challenge
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Which shape has 3 corners? 🔺
              </h3>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
                <button
                  onClick={() => handleInteractiveAnswer(true)}
                  className={`
                    p-4 rounded-2xl font-bold text-sm border-2 transition-all active:scale-95
                    ${exerciseCompleted
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-4 ring-emerald-200'
                      : 'bg-white hover:bg-sky-100 text-slate-800 border-sky-200 shadow-xs'}
                  `}
                >
                  <span className="text-2xl block mb-1">🔺</span>
                  <span>Triangle</span>
                </button>

                <button
                  onClick={() => handleInteractiveAnswer(false)}
                  className="p-4 rounded-2xl font-bold text-sm bg-white hover:bg-sky-100 text-slate-800 border-2 border-sky-200 shadow-xs transition-all active:scale-95"
                >
                  <span className="text-2xl block mb-1">🟦</span>
                  <span>Square</span>
                </button>

                <button
                  onClick={() => handleInteractiveAnswer(false)}
                  className="p-4 rounded-2xl font-bold text-sm bg-white hover:bg-sky-100 text-slate-800 border-2 border-sky-200 shadow-xs transition-all active:scale-95"
                >
                  <span className="text-2xl block mb-1">🟡</span>
                  <span>Circle</span>
                </button>
              </div>

              {exerciseCompleted && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 animate-in fade-in">
                  <Trophy className="w-4 h-4 text-emerald-700" />
                  <span>Awesome job, Leo! You earned 1 Star! ⭐</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Stage Catalog & Storybooks */}
        <div className="space-y-4">
          <Card className="p-5 rounded-3xl border border-slate-200 bg-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              {activeStage?.name} Units
            </h4>
            <div className="space-y-2.5">
              {activeStage?.activities.map((act, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-brand-600">
                      {i + 1}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{act}</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
