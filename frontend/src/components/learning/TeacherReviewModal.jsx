import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, CheckCircle, Clock, AlertCircle, Award, Star, MessageSquare,
  Send, User, BookOpen, Sparkles, RefreshCw, BarChart2
} from 'lucide-react';
import { learningService } from '../../services/learningService';
import { Button, Badge, Modal, Card, LoadingState } from '../ui';

const PRESET_FEEDBACKS = [
  '⭐ Super effort! Keep shining!',
  '🎯 Wonderful accuracy and attention to detail!',
  '👏 Great progress today! Proud of you.',
  '💪 Good attempt! Let\'s practice counting together tomorrow.',
  '🌟 Creative thinking and excellent matching!',
];

export const TeacherReviewModal = ({ isOpen, onClose, assignmentId }) => {
  const queryClient = useQueryClient();
  const [selectedChild, setSelectedChild] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(null);

  const {
    data: progressData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['assignmentProgress', assignmentId],
    queryFn: () => learningService.getClassProgress(assignmentId),
    enabled: !!assignmentId && isOpen,
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ childId, feedback }) =>
      learningService.submitTeacherFeedback(assignmentId, {
        child_id: childId,
        feedback,
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignmentProgress', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['homeworkAssignments'] });
      setFeedbackSuccess(variables.childId);
      setTimeout(() => setFeedbackSuccess(null), 3000);
      setSelectedChild(null);
      setFeedbackText('');
    },
  });

  const handleOpenFeedback = (child) => {
    setSelectedChild(child);
    setFeedbackText(child.teacher_feedback || '');
  };

  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (!selectedChild || !feedbackText.trim()) return;
    feedbackMutation.mutate({
      childId: selectedChild.child_id,
      feedback: feedbackText.trim(),
    });
  };

  if (!isOpen) return null;

  const stats = progressData?.stats || {
    total_students: 0,
    completed: 0,
    in_progress: 0,
    not_started: 0,
    completion_rate: 0,
    avg_score: 0,
  };

  const students = progressData?.students || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-brand-900 via-brand-800 to-navy-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-brand-200">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-skybrand-300">
                  Assignment Review
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-200 font-mono">
                  {progressData?.assignment?.section_name || 'Class Roster'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {progressData?.assignment?.homework_title || 'Homework Submission Progress'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center">
              <LoadingState message="Loading class submissions..." />
            </div>
          ) : (
            <>
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Roster Total</span>
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-navy-900 mt-1">{stats.total_students}</div>
                  <span className="text-xs text-slate-500">Enrolled children</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-700 uppercase">Completed</span>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-900 mt-1">{stats.completed}</div>
                  <span className="text-xs text-emerald-700 font-medium">
                    {stats.completion_rate}% completion rate
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-700 uppercase">In Progress</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-amber-900 mt-1">{stats.in_progress}</div>
                  <span className="text-xs text-amber-700">Currently practicing</span>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-700 uppercase">Avg Score</span>
                    <Star className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">{stats.avg_score}%</div>
                  <span className="text-xs text-purple-700">Across activities</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                  <span>Class Completion Progress</span>
                  <span>{stats.completed} of {stats.total_students} students ({stats.completion_rate}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(stats.completed / (stats.total_students || 1)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${(stats.in_progress / (stats.total_students || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Student Roster Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-semibold text-navy-900 text-sm">
                    Student Submissions & Encouragement
                  </h3>
                  <span className="text-xs text-slate-500">
                    Showing {students.length} students
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {students.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No student progress records found for this assignment.
                    </div>
                  ) : (
                    students.map((student) => {
                      const isComplete = student.status === 'COMPLETED';
                      const isInProgress = student.status === 'IN_PROGRESS';
                      const isNotStarted = student.status === 'NOT_STARTED';

                      return (
                        <div
                          key={student.child_id}
                          className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Student Info */}
                          <div className="flex items-center space-x-3 min-w-[200px]">
                            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center border border-brand-200 text-sm">
                              {student.child_name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <div className="font-semibold text-navy-900 text-sm">
                                {student.child_name}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center space-x-2">
                                <span>Level: {student.learning_level || 'Default'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status & Metrics */}
                          <div className="flex items-center space-x-4 flex-wrap gap-y-2">
                            {/* Status badge */}
                            <div>
                              {isComplete && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Completed
                                </span>
                              )}
                              {isInProgress && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3 mr-1" />
                                  In Progress
                                </span>
                              )}
                              {isNotStarted && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                  Not Started
                                </span>
                              )}
                            </div>

                            {/* Completed count */}
                            <div className="text-xs font-medium text-slate-700 min-w-[90px]">
                              {student.completed_activities_count} / {student.total_activities_count} activities
                            </div>

                            {/* Score & Stars */}
                            <div className="flex items-center space-x-2 min-w-[110px]">
                              <span className="text-xs font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                                {student.average_score}%
                              </span>
                              <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-400 mr-1" />
                                {student.total_stars_earned}
                              </span>
                            </div>
                          </div>

                          {/* Teacher Feedback / Action */}
                          <div className="flex items-center space-x-2">
                            {student.teacher_feedback ? (
                              <div className="text-xs text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200 max-w-xs truncate flex items-center space-x-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                                <span className="truncate">"{student.teacher_feedback}"</span>
                              </div>
                            ) : null}

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs font-semibold"
                              onClick={() => handleOpenFeedback(student)}
                            >
                              <MessageSquare className="w-3.5 h-3.5 mr-1" />
                              {student.teacher_feedback ? 'Edit Feedback' : 'Give Feedback'}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close Review
          </Button>
        </div>
      </div>

      {/* Teacher Feedback Modal / Popover */}
      {selectedChild && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-navy-900 text-base">
                  Feedback for {selectedChild.child_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedChild(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Provide encouragement or specific practice notes. This will be shown to the parent and in the child's learning view.
            </p>

            {/* Quick preset stamps */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Quick Positive Encouragements:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_FEEDBACKS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFeedbackText(preset)}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 border border-slate-200 transition-colors text-slate-700 text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <form onSubmit={handleSendFeedback} className="space-y-4">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Write an encouraging note..."
                rows={3}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedChild(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={feedbackMutation.isPending || !feedbackText.trim()}
                  className="bg-brand-600 hover:bg-brand-700 text-white"
                >
                  {feedbackMutation.isPending ? 'Saving...' : 'Save Feedback'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
