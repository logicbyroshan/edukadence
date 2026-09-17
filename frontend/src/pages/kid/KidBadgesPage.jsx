import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Trophy,
  Star,
  Sparkles,
  Award,
  BookOpen,
  Binary,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { learningService } from '../../services/learningService';

export const KidBadgesPage = () => {
  const { selectedChild, childSummary } = useOutletContext();
  const [allBadges, setAllBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewardsData();
  }, [selectedChild]);

  const loadRewardsData = async () => {
    setLoading(true);
    try {
      const childId = selectedChild?.id || childSummary?.child?.id;
      const [badges, childBadges, prog] = await Promise.all([
        learningService.getBadges(),
        childId ? learningService.getChildBadges(childId) : Promise.resolve([]),
        childId ? learningService.getProgress(childId) : Promise.resolve([]),
      ]);
      setAllBadges(badges);
      setEarnedBadges(childBadges);
      setProgressList(prog);
    } catch (err) {
      console.error('Error loading badges and rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadgeIds = new Set(earnedBadges.map((cb) => cb.badge?.id || cb.badge));
  const childName = childSummary?.child?.first_name || selectedChild?.first_name || 'Explorer';
  const totalStars = childSummary?.total_stars || 12;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Trophy World Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-amber-950 shadow-lg flex items-center justify-between">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm text-xs font-black">
            <Trophy className="w-4 h-4 text-amber-950" />
            <span>My Achievement World</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {childName}'s Trophy Chest 🏆
          </h1>
          <p className="text-xs sm:text-sm font-bold opacity-90">
            Look at all the shiny stars and badges you have earned on your learning journey!
          </p>
        </div>

        {/* Star Chest Total */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 shadow-md border-2 border-amber-300 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-white shadow-sm animate-bounce-slow">
            <Star className="w-7 h-7 fill-white" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight block">
              {totalStars}
            </span>
            <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
              Total Stars
            </span>
          </div>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Learning Badges ({earnedBadges.length} / {allBadges.length} Unlocked)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allBadges.map((badge) => {
            const isUnlocked = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`
                  p-5 rounded-3xl border-3 transition-all flex flex-col justify-between
                  ${isUnlocked
                    ? 'bg-white border-amber-300 shadow-md scale-102 ring-2 ring-amber-200'
                    : 'bg-slate-50/80 border-slate-200 opacity-60'}
                `}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${isUnlocked ? 'bg-amber-100' : 'bg-slate-200 text-slate-400'}`}>
                      {isUnlocked ? '🏆' : <Lock className="w-5 h-5 text-slate-400" />}
                    </div>
                    {isUnlocked ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                        UNLOCKED ⭐
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
                        {badge.required_count} Stars Needed
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900">{badge.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress by Learning Area */}
      {progressList.length > 0 && (
        <div className="space-y-4 pt-2">
          <h3 className="text-base sm:text-lg font-black text-slate-900 px-1">
            Learning Area Mastery
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {progressList.map((prog) => (
              <div
                key={prog.id}
                className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">
                    {prog.area_name || 'Subject Area'}
                  </span>
                  <span className="text-xs font-black text-brand-600">
                    {prog.mastery_percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-sky-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, prog.mastery_percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>{prog.activities_completed_count} completed</span>
                  <span>⭐ {prog.total_stars_earned} stars</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
