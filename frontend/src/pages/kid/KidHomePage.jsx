import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Sparkles,
  Star,
  Gamepad2,
  BookOpen,
  Palette,
  Trophy,
  ArrowRight,
  Compass,
  Play,
  Shapes,
  Binary,
  Type,
  Leaf,
  Video,
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { ActivityRunner } from '../../components/learning/ActivityRunner';

export const KidHomePage = () => {
  const { selectedChild, childSummary, refreshSummary } = useOutletContext();
  const [activeActivity, setActiveActivity] = useState(null);

  const childName = childSummary?.child?.first_name || selectedChild?.first_name || 'Explorer';
  const childAge = childSummary?.child?.age || 3.5;
  const currentLevel = childSummary?.level;

  const categories = [
    { title: 'Letters & Words', icon: Type, color: 'bg-emerald-500', count: '12 Activities', path: '/kid/explore?area=ALPHABET_PHONICS' },
    { title: 'Numbers & Math', icon: Binary, color: 'bg-sky-500', count: '15 Activities', path: '/kid/explore?area=NUMBERS_MATH' },
    { title: 'Shapes & Colors', icon: Shapes, color: 'bg-purple-500', count: '10 Activities', path: '/kid/explore?area=SHAPES_COLORS' },
    { title: 'Storybooks', icon: BookOpen, color: 'bg-amber-500', count: '6 Storybooks', path: '/kid/stories' },
    { title: 'Science & Nature', icon: Leaf, color: 'bg-teal-500', count: '8 Adventures', path: '/kid/explore?area=SCIENCE_NATURE' },
    { title: 'Learning Videos', icon: Video, color: 'bg-indigo-500', count: '10 Videos', path: '/kid/videos' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Cheerful Personalized Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-400 via-brand-500 to-indigo-500 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span>{currentLevel ? `${currentLevel.name} Universe (Ages ${currentLevel.min_age}–${currentLevel.max_age})` : 'Play & Learn Sandbox'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Hi {childName}! Ready to play and explore? 🚀
          </h1>

          <p className="text-xs sm:text-sm text-sky-100 font-medium">
            You have earned <span className="font-black text-amber-300">{childSummary?.total_stars || 12} Stars</span> so far! Complete today's fun activities to unlock new badges!
          </p>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute right-4 -bottom-4 text-8xl opacity-30 select-none pointer-events-none hidden sm:block">
          🎨
        </div>
      </div>

      {/* Continue Adventure & Today's Challenge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Today's Challenge */}
        {childSummary?.today_challenge && (
          <Card className="p-5 sm:p-6 rounded-3xl border-3 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50/50 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs uppercase tracking-wider shadow-xs">
                🎯 Today's Challenge
              </span>
              <span className="font-extrabold text-xs text-amber-800">
                ⭐ +{childSummary.today_challenge.star_reward || 2} Stars
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              {childSummary.today_challenge.title}
            </h3>
            <p className="text-xs text-slate-600 mb-4 line-clamp-2">
              {childSummary.today_challenge.description || 'Complete this fun challenge to earn bonus stars!'}
            </p>

            <button
              onClick={() => setActiveActivity(childSummary.today_challenge)}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-102 active:scale-95"
            >
              <Play className="w-4 h-4 fill-amber-950" />
              <span>Start Challenge</span>
            </button>
          </Card>
        )}

        {/* Continue Adventure / Recent Activity */}
        <Card className="p-5 sm:p-6 rounded-3xl border-3 border-sky-300 bg-gradient-to-br from-sky-50 to-blue-50/50 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 rounded-full bg-brand-500 text-white font-black text-xs uppercase tracking-wider shadow-xs">
              ⚡ Continue Learning
            </span>
            <span className="font-extrabold text-xs text-sky-700">
              {currentLevel?.name || 'Active Stage'}
            </span>
          </div>

          <h3 className="text-lg font-black text-slate-900 mb-1">
            {childSummary?.continue_activity?.title || 'Number Safari & Counting 1-5'}
          </h3>
          <p className="text-xs text-slate-600 mb-4 line-clamp-2">
            {childSummary?.continue_activity?.description || 'Pick up where you left off and keep mastering your learning universe!'}
          </p>

          <button
            onClick={() => setActiveActivity(childSummary?.continue_activity || childSummary?.recommended_activities?.[0])}
            className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-102 active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play Now</span>
          </button>
        </Card>
      </div>

      {/* Recommended Activities Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-sky-100 text-sky-700">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Fun Activities for You
            </h2>
          </div>
          <Link
            to="/kid/explore"
            className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {childSummary?.recommended_activities?.map((act) => (
            <div
              key={act.id}
              onClick={() => setActiveActivity(act)}
              className="p-5 rounded-3xl bg-white border-2 border-slate-200 hover:border-brand-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-black">
                    {act.area_name || 'Learning'}
                  </span>
                  <span className="text-xs font-black text-amber-600">
                    ⭐ +{act.star_reward || 2}
                  </span>
                </div>
                <h4 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {act.description}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-extrabold text-slate-400">
                <span>⏱️ {act.estimated_duration_minutes || 4} mins</span>
                <span className="text-brand-600 flex items-center gap-1 group-hover:underline">
                  <span>Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Universe Explorer Categories */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Explore Learning Worlds
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link
                key={i}
                to={cat.path}
                className="p-4 rounded-3xl bg-white border-2 border-slate-200 hover:border-brand-400 hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-2 group hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-2xl ${cat.color} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  {cat.title}
                </h4>
                <span className="text-[10px] font-bold text-slate-400">
                  {cat.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Interactive Activity Runner Modal */}
      {activeActivity && (
        <ActivityRunner
          activity={activeActivity}
          child={childSummary?.child || selectedChild}
          onClose={() => setActiveActivity(null)}
          onComplete={() => {
            refreshSummary();
          }}
        />
      )}
    </div>
  );
};
