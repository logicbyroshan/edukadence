import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles, BookOpen, Plus, Search, Filter, Play, Edit3, Copy, Trash2,
  CheckCircle, Clock, AlertCircle, Users, BarChart3, Layers, Star,
  Award, Send, Eye, Calendar, ArrowRight, Check, Compass, Compass as CompassIcon
} from 'lucide-react';
import { learningService } from '../services/learningService';
import { schoolService } from '../services/schoolService';
import { Button, Badge, Card, Table, LoadingState, EmptyState } from '../components/ui';
import { ActivityEditorModal } from '../components/learning/ActivityEditorModal';
import { HomeworkBuilderModal } from '../components/learning/HomeworkBuilderModal';
import { TeacherReviewModal } from '../components/learning/TeacherReviewModal';
import { ActivityRunner } from '../components/learning/ActivityRunner';

export const LearningStudioPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'homework' | 'activities' | 'progress'

  // Modals state
  const [isActivityEditorOpen, setIsActivityEditorOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityTemplate, setActivityTemplate] = useState(null);

  const [isHomeworkBuilderOpen, setIsHomeworkBuilderOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);

  const [reviewAssignmentId, setReviewAssignmentId] = useState(null);
  const [previewActivity, setPreviewActivity] = useState(null);

  // Filters
  const [homeworkFilter, setHomeworkFilter] = useState('ALL');
  const [activityOwnershipFilter, setActivityOwnershipFilter] = useState('ALL'); // ALL, MY, SCHOOL, GLOBAL
  const [activityAreaFilter, setActivityAreaFilter] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch queries
  const { data: homeworkList = [], isLoading: isLoadingHomework } = useQuery({
    queryKey: ['homeworkList', homeworkFilter],
    queryFn: () => learningService.getHomeworkList(),
  });

  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['homeworkAssignments'],
    queryFn: () => learningService.getAssignments(),
  });

  const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
    queryKey: ['activities', activityAreaFilter, activityTypeFilter],
    queryFn: () => learningService.getActivities({
      area: activityAreaFilter || undefined,
      activity_type: activityTypeFilter || undefined,
    }),
  });

  const { data: areas = [] } = useQuery({
    queryKey: ['learningAreas'],
    queryFn: () => learningService.getAreas(),
  });

  const { data: levels = [] } = useQuery({
    queryKey: ['learningLevels'],
    queryFn: () => learningService.getLevels(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['activityTemplates'],
    queryFn: () => learningService.getActivityTemplates(),
  });

  // Mutations
  const duplicateActivityMutation = useMutation({
    mutationFn: (id) => learningService.duplicateActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (id) => learningService.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const duplicateHomeworkMutation = useMutation({
    mutationFn: (id) => learningService.duplicateHomework(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeworkList'] });
    },
  });

  const publishHomeworkMutation = useMutation({
    mutationFn: (id) => learningService.publishHomework(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeworkList'] });
    },
  });

  const deleteHomeworkMutation = useMutation({
    mutationFn: (id) => learningService.deleteHomework(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeworkList'] });
    },
  });

  // Action handlers
  const handleCreateActivity = (template = null) => {
    setEditingActivity(null);
    setActivityTemplate(template);
    setIsActivityEditorOpen(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setActivityTemplate(null);
    setIsActivityEditorOpen(true);
  };

  const handleCreateHomework = () => {
    setEditingHomework(null);
    setIsHomeworkBuilderOpen(true);
  };

  const handleEditHomework = (hw) => {
    setEditingHomework(hw);
    setIsHomeworkBuilderOpen(true);
  };

  // Filtered Homework
  const filteredHomework = homeworkList.filter((hw) => {
    if (homeworkFilter !== 'ALL' && hw.status !== homeworkFilter) return false;
    if (searchQuery) {
      return (
        hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.topic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.learning_area_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  // Filtered Activities
  const filteredActivities = activities.filter((act) => {
    if (activityOwnershipFilter === 'MY' && !act.created_by) return false;
    if (activityOwnershipFilter === 'GLOBAL' && act.created_by) return false;
    if (searchQuery) {
      return (
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.activity_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  // Overview metrics calculation
  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE' || a.status === 'PUBLISHED');
  const totalSubmissionsToReview = assignments.reduce((acc, a) => acc + (a.completed_students_count || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-brand-900 via-navy-900 to-brand-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-brand-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-skybrand-300 text-xs font-semibold border border-brand-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Teacher Learning Studio • Phase 4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Learning Studio & Interactive Homework
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Design engaging multi-sensory activities, bundle them into learning quests, schedule assignments for your classes, and track child progress seamlessly.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => handleCreateActivity()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Activity
            </Button>
            <Button
              onClick={handleCreateHomework}
              className="bg-skybrand-500 hover:bg-skybrand-600 text-navy-950 font-bold text-sm shadow-lg hover:shadow-skybrand-500/30"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Homework Quest
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 bg-white px-4 pt-3 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'overview'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('homework')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'homework'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Homework Quests ({homeworkList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'activities'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Activity Studio ({activities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'progress'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Class Progress ({assignments.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW
         ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-l-4 border-l-brand-600 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                <span>Active Quests</span>
                <BookOpen className="w-4 h-4 text-brand-600" />
              </div>
              <div className="text-3xl font-extrabold text-navy-900 mt-2">
                {activeAssignments.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Currently assigned to classes</p>
            </Card>

            <Card className="p-5 border-l-4 border-l-emerald-600 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                <span>Completions</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-900 mt-2">
                {totalSubmissionsToReview}
              </div>
              <p className="text-xs text-emerald-700 mt-1">Child activity submissions</p>
            </Card>

            <Card className="p-5 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                <span>Authored Activities</span>
                <Layers className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-navy-900 mt-2">
                {activities.filter(a => a.created_by).length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Custom teacher creations</p>
            </Card>

            <Card className="p-5 border-l-4 border-l-purple-600 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                <span>Library Bank</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-extrabold text-purple-900 mt-2">
                {activities.length}
              </div>
              <p className="text-xs text-purple-700 mt-1">Ready-to-use activities</p>
            </Card>
          </div>

          {/* Active Homework Assignments Quick Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-navy-900">Current Class Assignments</h3>
                <p className="text-xs text-slate-500">Live homework quests assigned to your student rosters</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('progress')}
                className="text-xs font-semibold"
              >
                View Full Roster <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {assignments.length === 0 ? (
              <Card className="p-8 text-center bg-slate-50/50">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-navy-900 text-sm">No Active Assignments</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Assign a homework quest to your section or class so children can play and learn in Kid Mode.
                </p>
                <Button
                  size="sm"
                  onClick={handleCreateHomework}
                  className="mt-4 bg-brand-600 text-white text-xs"
                >
                  Create Homework Quest
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.map((assignment) => {
                  const total = assignment.total_students_count || 1;
                  const completed = assignment.completed_students_count || 0;
                  const percent = Math.round((completed / total) * 100);

                  return (
                    <Card
                      key={assignment.id}
                      className="p-5 hover:shadow-lg transition-all border border-slate-200 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                            {assignment.section_name || assignment.class_level_name || 'Class Roster'}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-slate-400" />
                            Due {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No date'}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-navy-900 text-base line-clamp-1">
                            {assignment.homework_title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {assignment.notes || 'Interactive homework quest with auto-progress tracking.'}
                          </p>
                        </div>

                        {/* Progress Meter */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-xs font-semibold text-slate-600">
                            <span>Roster Completion</span>
                            <span>{completed} / {total} ({percent}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Assigned by {assignment.assigned_by_name || 'Teacher'}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReviewAssignmentId(assignment.id)}
                          className="text-xs font-semibold text-brand-600 border-brand-200 hover:bg-brand-50"
                        >
                          Review & Feedback
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Activity Creator Templates bar */}
          <div className="p-6 bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-purple-500/10 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy-900 text-base flex items-center">
                  <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
                  Quick Starter Templates
                </h3>
                <p className="text-xs text-slate-600">
                  Select a template to author a brand new interactive learning activity in seconds.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('activities')}
                className="text-xs font-semibold text-brand-700"
              >
                Browse All Templates <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {templates.slice(0, 6).map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleCreateActivity(tpl)}
                  className="p-3 bg-white rounded-xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {tpl.icon}
                  </div>
                  <div className="font-bold text-xs text-navy-900 group-hover:text-brand-600 truncate">
                    {tpl.title}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                    {tpl.activity_type}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: HOMEWORK QUESTS
         ========================================================================= */}
      {activeTab === 'homework' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Status:</span>
              {['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setHomeworkFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    homeworkFilter === status
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search homework..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-52"
                />
              </div>

              <Button
                onClick={handleCreateHomework}
                size="sm"
                className="bg-brand-600 text-white font-semibold text-xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                New Homework
              </Button>
            </div>
          </div>

          {/* Homework List */}
          {isLoadingHomework ? (
            <div className="py-16 text-center">
              <LoadingState message="Loading homework quests..." />
            </div>
          ) : filteredHomework.length === 0 ? (
            <EmptyState
              title="No Homework Quests Found"
              description="Create a homework quest with one or more interactive activities to assign to your students."
              actionLabel="+ Create First Homework"
              onAction={handleCreateHomework}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHomework.map((hw) => {
                const isPublished = hw.status === 'PUBLISHED';
                const isDraft = hw.status === 'DRAFT';

                return (
                  <Card
                    key={hw.id}
                    className="p-5 border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                          {hw.learning_area_name || 'General'}
                        </span>

                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isDraft
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {hw.status}
                        </span>
                      </div>

                      {/* Title & Info */}
                      <div>
                        <h4 className="font-bold text-navy-900 text-base group-hover:text-brand-600 transition-colors">
                          {hw.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {hw.instructions || 'Interactive activities bundled for student practice.'}
                        </p>
                      </div>

                      {/* Metadata Chips */}
                      <div className="flex items-center space-x-3 text-xs text-slate-600 pt-1">
                        <span className="flex items-center">
                          <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {hw.activity_count || hw.activities?.length || 0} activities
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          ~{hw.estimated_minutes || 10}m
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700">
                          {hw.target_level || 'ALL'}
                        </span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditHomework(hw)}
                          title="Edit Homework"
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateHomeworkMutation.mutate(hw.id)}
                          title="Duplicate Homework"
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this homework quest?')) {
                              deleteHomeworkMutation.mutate(hw.id);
                            }
                          }}
                          title="Delete Homework"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isDraft && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => publishHomeworkMutation.mutate(hw.id)}
                            className="text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Publish
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleEditHomework(hw)}
                          className="text-xs font-semibold bg-brand-600 text-white"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: ACTIVITY STUDIO & LIBRARY
         ========================================================================= */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          {/* Templates Section */}
          <div className="p-6 bg-gradient-to-r from-brand-900 via-navy-900 to-brand-950 rounded-2xl text-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-skybrand-400">
                  Starter Templates
                </span>
                <h3 className="text-xl font-bold text-white">Create New Interactive Activity</h3>
                <p className="text-xs text-slate-300">
                  Pick a template pattern to scaffold your activity instantly.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleCreateActivity()}
                className="bg-skybrand-500 hover:bg-skybrand-600 text-navy-950 font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Blank Activity
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleCreateActivity(tpl)}
                  className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all text-left group"
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {tpl.icon}
                  </div>
                  <div className="font-bold text-xs text-white truncate">{tpl.title}</div>
                  <div className="text-[10px] text-skybrand-300 uppercase tracking-wider">
                    {tpl.activity_type}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Bank Filter Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Origin:</span>
              {[
                { id: 'ALL', label: 'All Activities' },
                { id: 'MY', label: 'My Creations' },
                { id: 'GLOBAL', label: 'Global Library' },
              ].map((origin) => (
                <button
                  key={origin.id}
                  onClick={() => setActivityOwnershipFilter(origin.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activityOwnershipFilter === origin.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {origin.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <select
                value={activityAreaFilter}
                onChange={(e) => setActivityAreaFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Areas</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>

              <select
                value={activityTypeFilter}
                onChange={(e) => setActivityTypeFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Types</option>
                <option value="TAP_CHOICE">Tap / Choose</option>
                <option value="MATCH">Match</option>
                <option value="DRAG_DROP">Drag & Drop</option>
                <option value="COUNT">Count</option>
                <option value="SORT">Sort</option>
                <option value="SEQUENCE">Sequence</option>
                <option value="MEMORY">Memory</option>
                <option value="TRACE">Trace</option>
                <option value="COLOR">Color</option>
                <option value="QUIZ">Quiz</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-44"
                />
              </div>
            </div>
          </div>

          {/* Activities Grid */}
          {isLoadingActivities ? (
            <div className="py-16 text-center">
              <LoadingState message="Loading activity library..." />
            </div>
          ) : filteredActivities.length === 0 ? (
            <EmptyState
              title="No Activities Found"
              description="Create a new interactive activity or adjust your filters."
              actionLabel="+ Create Activity"
              onAction={() => handleCreateActivity()}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredActivities.map((act) => {
                const isCustom = !!act.created_by;

                return (
                  <Card
                    key={act.id}
                    className="p-4 border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 font-mono">
                          {act.activity_type}
                        </span>
                        {isCustom ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                            Teacher Created
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            Global
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-navy-900 text-sm group-hover:text-brand-600 transition-colors line-clamp-1">
                          {act.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {act.instructions || act.payload?.prompt || 'Interactive challenge'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span className="flex items-center text-amber-600 font-semibold">
                          <Star className="w-3.5 h-3.5 mr-1 fill-amber-400 text-amber-500" />
                          {act.points || 10} pts
                        </span>
                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                          {act.difficulty || 'EASY'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreviewActivity(act)}
                        className="text-xs text-slate-600 hover:text-brand-600"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Preview
                      </Button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => duplicateActivityMutation.mutate(act.id)}
                          title="Duplicate"
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {isCustom && (
                          <>
                            <button
                              onClick={() => handleEditActivity(act)}
                              title="Edit"
                              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this activity?')) {
                                  deleteActivityMutation.mutate(act.id);
                                }
                              }}
                              title="Delete"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: CLASS PROGRESS & SUBMISSIONS
         ========================================================================= */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy-900">Class Homework Submissions</h3>
              <p className="text-xs text-slate-500">
                Review submissions, inspect student completion rates, and leave encouraging feedback notes.
              </p>
            </div>
          </div>

          {isLoadingAssignments ? (
            <div className="py-16 text-center">
              <LoadingState message="Loading class assignments..." />
            </div>
          ) : assignments.length === 0 ? (
            <EmptyState
              title="No Homework Assignments Yet"
              description="Assign your published homework quests to see class progress and submissions here."
              actionLabel="+ Assign Homework"
              onAction={handleCreateHomework}
            />
          ) : (
            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
              {assignments.map((assignment) => {
                const total = assignment.total_students_count || 1;
                const completed = assignment.completed_students_count || 0;
                const percent = Math.round((completed / total) * 100);

                return (
                  <div
                    key={assignment.id}
                    className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-[280px]">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                          {assignment.section_name || assignment.class_level_name || 'Class Roster'}
                        </span>
                        <span className="text-xs text-slate-500">
                          Due {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <h4 className="font-bold text-navy-900 text-base">
                        {assignment.homework_title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Assigned by {assignment.assigned_by_name || 'Teacher'} • {assignment.notes || 'Homework quest'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Meter */}
                      <div className="w-44 space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-600">
                          <span>{completed} of {total} completed</span>
                          <span className="font-bold text-navy-900">{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => setReviewAssignmentId(assignment.id)}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs whitespace-nowrap"
                      >
                        <Users className="w-3.5 h-3.5 mr-1.5" />
                        Review Roster
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODALS
         ========================================================================= */}
      {/* Activity Editor Modal */}
      <ActivityEditorModal
        isOpen={isActivityEditorOpen}
        onClose={() => setIsActivityEditorOpen(false)}
        activity={editingActivity}
        initialTemplate={activityTemplate}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['activities'] });
        }}
      />

      {/* Homework Builder Modal */}
      <HomeworkBuilderModal
        isOpen={isHomeworkBuilderOpen}
        onClose={() => setIsHomeworkBuilderOpen(false)}
        homework={editingHomework}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['homeworkList'] });
          queryClient.invalidateQueries({ queryKey: ['homeworkAssignments'] });
        }}
      />

      {/* Teacher Review & Feedback Modal */}
      <TeacherReviewModal
        isOpen={!!reviewAssignmentId}
        onClose={() => setReviewAssignmentId(null)}
        assignmentId={reviewAssignmentId}
      />

      {/* Activity Preview Modal */}
      {previewActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase">
                  Teacher Preview Mode
                </span>
                <h3 className="font-bold text-navy-900 text-base">{previewActivity.title}</h3>
              </div>
              <button
                onClick={() => setPreviewActivity(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <ActivityRunner
              activity={previewActivity}
              previewMode={true}
              onComplete={(result) => {
                // Preview completion
              }}
              onClose={() => setPreviewActivity(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
