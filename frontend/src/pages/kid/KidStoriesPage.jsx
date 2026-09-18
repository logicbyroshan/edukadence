import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BookOpen, Sparkles, Star, Play, Clock, ArrowRight } from 'lucide-react';
import { learningService } from '../../services/learningService';
import { ActivityRunner } from '../../components/learning/ActivityRunner';

export const KidStoriesPage = () => {
  const { selectedChild, childSummary, refreshSummary } = useOutletContext();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryActivity, setActiveStoryActivity] = useState(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const data = await learningService.getStories();
      setStories(data);
    } catch (err) {
      console.error('Error loading stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStory = (story) => {
    // Wrap story into an activity runner item
    setActiveStoryActivity({
      id: story.id,
      title: story.title,
      activity_type: 'STORY',
      star_reward: story.star_reward || 3,
      level_name: story.level_name,
      story: story,
    });
  };

  return (
    <div className="space-y-6">
      {/* Storybook Corner Banner */}
      <div className="p-4 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white shadow-lg flex items-center justify-between gap-3">
        <div className="space-y-1.5 sm:space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black">
            <BookOpen className="w-4 h-4 text-amber-200" />
            <span>Interactive Storybook Theatre</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black">
            Snuggle Up for Story Time! 📖
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 font-medium">
            Listen to cheerful illustrated tales, discover magical worlds, and answer fun story checkpoints.
          </p>
        </div>
        <span className="text-4xl sm:text-6xl hidden sm:block select-none">🐻</span>
      </div>

      {/* Storybook Library Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900 px-1">
          Featured Storybooks ({stories.length})
        </h3>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-sm">
            Opening storybook chest... ✨
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                onClick={() => handleOpenStory(story)}
                className="rounded-3xl bg-white border-2 border-slate-200 overflow-hidden shadow-sm hover:border-amber-400 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-slate-100 overflow-hidden relative">
                    <img
                      src={story.cover_image_url || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80'}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-amber-300 text-xs font-black flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-300" />
                      <span>+{story.star_reward || 3} Stars</span>
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      {story.level_name || 'All Ages'}
                    </span>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                      {story.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {story.synopsis}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{story.estimated_reading_minutes || 5} min read</span>
                  </span>
                  <span className="text-amber-600 font-black flex items-center gap-1 group-hover:underline">
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeStoryActivity && (
        <ActivityRunner
          activity={activeStoryActivity}
          child={childSummary?.child || selectedChild}
          onClose={() => setActiveStoryActivity(null)}
          onComplete={() => {
            refreshSummary();
          }}
        />
      )}
    </div>
  );
};
