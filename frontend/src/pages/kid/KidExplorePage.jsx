import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Star,
  Gamepad2,
  Filter,
  Play,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { learningService } from '../../services/learningService';
import { ActivityRunner } from '../../components/learning/ActivityRunner';

export const KidExplorePage = () => {
  const { selectedChild, childSummary, refreshSummary } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const [levels, setLevels] = useState([]);
  const [selectedLevelCode, setSelectedLevelCode] = useState('EXPLORE_2_3');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeActivity, setActiveActivity] = useState(null);

  const areaParam = searchParams.get('area');

  useEffect(() => {
    loadLevels();
  }, []);

  useEffect(() => {
    loadActivities();
  }, [selectedLevelCode, areaParam]);

  const loadLevels = async () => {
    try {
      const data = await learningService.getLevels();
      setLevels(data);
      if (childSummary?.level?.code) {
        setSelectedLevelCode(childSummary.level.code);
      }
    } catch (err) {
      console.error('Error loading levels:', err);
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    try {
      const params = { level_code: selectedLevelCode };
      if (areaParam) params.area = areaParam;
      const data = await learningService.getActivities(params);
      setActivities(data);
    } catch (err) {
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const levelColorMap = {
    EXPLORE_2_3: 'from-emerald-500 to-teal-600',
    DISCOVER_3_4: 'from-sky-500 to-blue-600',
    LEARN_4_5: 'from-blue-600 to-indigo-600',
    BUILD_5_7: 'from-purple-600 to-pink-600',
    CREATE_7_9: 'from-rose-500 to-orange-600',
    GROW_9_10: 'from-amber-500 to-yellow-600',
  };

  const currentLevelObj = levels.find((l) => l.code === selectedLevelCode);

  return (
    <div className="space-y-6">
      {/* Developmental Level Stage Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-600" />
            <span>Developmental Stages (Ages 2–10)</span>
          </h2>
          {areaParam && (
            <button
              onClick={() => setSearchParams({})}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Clear Filter ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {levels.map((lvl) => {
            const isSelected = lvl.code === selectedLevelCode;
            return (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevelCode(lvl.code)}
                className={`
                  p-3.5 rounded-3xl border-3 text-left transition-all relative overflow-hidden select-none
                  ${isSelected
                    ? 'border-brand-500 bg-white ring-4 ring-brand-200 shadow-md scale-102'
                    : 'border-slate-200 bg-white hover:border-slate-300'}
                `}
              >
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${levelColorMap[lvl.code] || 'from-brand-500 to-sky-500'} mb-2`} />
                <h4 className="text-xs font-black text-slate-900 leading-tight">{lvl.name}</h4>
                <span className="text-[10px] font-bold text-slate-500">
                  Ages {lvl.min_age}–{lvl.max_age}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Level Summary Header */}
      {currentLevelObj && (
        <div className={`p-6 rounded-3xl bg-gradient-to-r ${levelColorMap[selectedLevelCode] || 'from-brand-500 to-sky-500'} text-white shadow-md flex items-center justify-between`}>
          <div className="space-y-1 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black">
              {currentLevelObj.name} Universe (Ages {currentLevelObj.min_age}–{currentLevelObj.max_age})
            </h3>
            <p className="text-xs sm:text-sm opacity-90 font-medium">
              {currentLevelObj.description}
            </p>
          </div>
          <span className="text-4xl hidden sm:block">🌟</span>
        </div>
      )}

      {/* Activities Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900 px-1">
          Available Activities ({activities.length})
        </h3>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-sm">
            Loading adventures... ✨
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border-2 border-dashed border-slate-200 text-center space-y-2">
            <span className="text-4xl block">🎈</span>
            <h4 className="text-base font-black text-slate-800">New adventures coming soon!</h4>
            <p className="text-xs text-slate-500">Check another stage or explore storybooks!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((act) => (
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
                      ⭐ +{act.star_reward || 2} Stars
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
                    <span>Start Activity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Runner Modal */}
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
