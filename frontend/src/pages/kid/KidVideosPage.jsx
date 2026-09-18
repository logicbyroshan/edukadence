import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Video, Sparkles, Star, Play, Clock, ArrowRight } from 'lucide-react';
import { learningService } from '../../services/learningService';
import { ActivityRunner } from '../../components/learning/ActivityRunner';

export const KidVideosPage = () => {
  const { selectedChild, childSummary, refreshSummary } = useOutletContext();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoActivity, setActiveVideoActivity] = useState(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await learningService.getVideos();
      setVideos(data);
    } catch (err) {
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVideo = (video) => {
    setActiveVideoActivity({
      id: video.id,
      title: video.title,
      activity_type: 'VIDEO',
      star_reward: 2,
      level_name: video.level_name,
      content: video,
    });
  };

  return (
    <div className="space-y-6">
      {/* Videos Hub Banner */}
      <div className="p-4 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg flex items-center justify-between gap-3">
        <div className="space-y-1.5 sm:space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black">
            <Video className="w-4 h-4 text-indigo-200" />
            <span>Curated Safe Learning Room</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black">
            Watch, Wonder & Discover! 🎬
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 font-medium">
            Safe, ad-free educational mini-videos exploring nature, science wonders, and rhymes.
          </p>
        </div>
        <span className="text-4xl sm:text-6xl hidden sm:block select-none">🍿</span>
      </div>

      {/* Videos List Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900 px-1">
          Learning Videos ({videos.length})
        </h3>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-sm">
            Loading video theatre... 🎬
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => handleOpenVideo(vid)}
                className="rounded-3xl bg-white border-2 border-slate-200 overflow-hidden shadow-sm hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-slate-900 overflow-hidden relative flex items-center justify-center">
                    <img
                      src={vid.thumbnail_url || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80'}
                      alt={vid.title}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute w-12 h-12 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-indigo-600 ml-0.5" />
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                      {vid.area_name || 'Science'}
                    </span>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {vid.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {vid.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{Math.floor(vid.duration_seconds / 60)} mins</span>
                  </span>
                  <span className="text-indigo-600 font-black flex items-center gap-1 group-hover:underline">
                    <span>Watch Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeVideoActivity && (
        <ActivityRunner
          activity={activeVideoActivity}
          child={childSummary?.child || selectedChild}
          onClose={() => setActiveVideoActivity(null)}
          onComplete={() => {
            refreshSummary();
          }}
        />
      )}
    </div>
  );
};
