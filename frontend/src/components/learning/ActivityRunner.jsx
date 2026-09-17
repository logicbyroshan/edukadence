import React, { useState } from 'react';
import {
  Sparkles,
  Star,
  Volume2,
  X,
  Trophy,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { Button, Badge } from '../ui';
import { learningService } from '../../services/learningService';

// Activity Sub-Renderers
import { TapChooseActivity } from './TapChooseActivity';
import { CountActivity } from './CountActivity';
import { MatchActivity } from './MatchActivity';
import { SortActivity } from './SortActivity';
import { MemoryActivity } from './MemoryActivity';
import { SequenceActivity } from './SequenceActivity';
import { TraceActivity } from './TraceActivity';
import { ColorActivity } from './ColorActivity';
import { QuizActivity } from './QuizActivity';
import { DragDropActivity } from './DragDropActivity';
import { StoryReader } from './StoryReader';
import { CuratedVideoPlayer } from './CuratedVideoPlayer';

export const ActivityRunner = ({ activity, child, onClose, onComplete }) => {
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const handleActivityComplete = async (result = {}) => {
    if (!activity || !child) return;
    setSubmitting(true);
    try {
      const payload = {
        child_id: child.id,
        correct_count: result.correct_count ?? 1,
        total_count: result.total_count ?? 1,
        is_completed: true,
        answer_metadata: result.answer_metadata || {},
      };
      const res = await learningService.submitAttempt(activity.id, payload);
      setCompletionData(res);
      setCompleted(true);
      if (onComplete) {
        onComplete(res);
      }
    } catch (err) {
      console.error('Error submitting activity attempt:', err);
      // Fallback completion state
      setCompletionData({
        stars_awarded: activity.star_reward || 2,
        score_percentage: 100,
      });
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    const type = activity.activity_type;
    const content = activity.content || {};

    switch (type) {
      case 'TAP_CHOOSE':
        return <TapChooseActivity content={content} onComplete={handleActivityComplete} />;
      case 'COUNT':
        return <CountActivity content={content} onComplete={handleActivityComplete} />;
      case 'MATCH':
        return <MatchActivity content={content} onComplete={handleActivityComplete} />;
      case 'SORT':
        return <SortActivity content={content} onComplete={handleActivityComplete} />;
      case 'MEMORY':
        return <MemoryActivity content={content} onComplete={handleActivityComplete} />;
      case 'SEQUENCE':
        return <SequenceActivity content={content} onComplete={handleActivityComplete} />;
      case 'TRACE':
        return <TraceActivity content={content} onComplete={handleActivityComplete} />;
      case 'COLOR':
        return <ColorActivity content={content} onComplete={handleActivityComplete} />;
      case 'QUIZ':
        return <QuizActivity content={content} onComplete={handleActivityComplete} />;
      case 'DRAG_DROP':
        return <DragDropActivity content={content} onComplete={handleActivityComplete} />;
      case 'STORY':
        return <StoryReader story={activity.story || content} onComplete={handleActivityComplete} />;
      case 'VIDEO':
        return <CuratedVideoPlayer video={content} onComplete={handleActivityComplete} />;
      default:
        return <TapChooseActivity content={content} onComplete={handleActivityComplete} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 antialiased">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border-4 border-sky-300 flex flex-col max-h-[92vh]">
        {/* Kid Runner Top Bar */}
        <div className="bg-gradient-to-r from-sky-400 via-brand-500 to-indigo-500 px-5 py-4 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight line-clamp-1">
                {activity.title}
              </h3>
              <p className="text-xs text-sky-100 font-medium">
                {activity.level_name || 'Learning Adventure'} • ⭐ +{activity.star_reward || 2} Stars
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Audio hint sound effect simulation
                const utterance = new SpeechSynthesisUtterance(activity.description || activity.title);
                window.speechSynthesis?.speak(utterance);
              }}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Read Instructions Aloud"
              aria-label="Sound Instruction"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Close Activity"
              aria-label="Close Activity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Activity Interactive Body */}
        <div className="p-5 sm:p-8 flex-1 overflow-y-auto flex flex-col justify-center bg-gradient-to-b from-sky-50/50 to-white">
          {!completed ? (
            renderContent()
          ) : (
            /* Joyful Star Celebration Screen */
            <div className="text-center space-y-5 py-6 animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 mx-auto rounded-full bg-amber-400 flex items-center justify-center text-white shadow-xl ring-8 ring-amber-100 animate-bounce">
                <Star className="w-14 h-14 fill-white text-white" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Awesome Job, {child?.first_name || 'Explorer'}! 🎉
                </h2>
                <p className="text-sm font-bold text-slate-600">
                  You completed <span className="text-brand-600">{activity.title}</span>!
                </p>
              </div>

              {/* Stars Earned Banner */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-950 font-black text-lg shadow-sm">
                <Star className="w-6 h-6 fill-amber-500 text-amber-600" />
                <span>+{completionData?.stars_awarded || activity.star_reward || 2} Stars Earned!</span>
              </div>

              {completionData?.badge_unlocked && (
                <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-900 max-w-md mx-auto space-y-1">
                  <div className="flex items-center justify-center gap-1.5 font-extrabold text-sm text-purple-700">
                    <Trophy className="w-4 h-4 text-purple-600" />
                    <span>NEW BADGE UNLOCKED!</span>
                  </div>
                  <p className="text-sm font-bold">{completionData.badge_unlocked}</p>
                </div>
              )}

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => setCompleted(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <span>Continue Adventure</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
