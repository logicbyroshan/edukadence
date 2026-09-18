import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  AlertCircle,
  MoveUp,
  MoveDown,
  Check,
  Search,
} from 'lucide-react';
import {
  Modal,
  Button,
  Input,
  Textarea,
  Select,
  FormField,
  Badge,
  Card,
} from '../ui';
import { ActivityRunner } from './ActivityRunner';
import { learningService } from '../../services/learningService';
import { academicService } from '../../services/academicService';
import { studentService } from '../../services/studentService';

export const HomeworkBuilderModal = ({
  isOpen,
  onClose,
  initialData = null,
  levels = [],
  areas = [],
  topics = [],
  onSaved,
}) => {
  const [step, setStep] = useState(1); // 1: Info, 2: Activities, 3: Schedule
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Step 1: Info State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [levelId, setLevelId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [themeColor, setThemeColor] = useState('sky');

  // Step 2: Activities Selection
  const [availableActivities, setAvailableActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewActivity, setPreviewActivity] = useState(null);

  // Step 3: Scheduling & Target
  const [sections, setSections] = useState([]);
  const [targetSectionId, setTargetSectionId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [assignImmediately, setAssignImmediately] = useState(true);

  // Load activities & classes
  useEffect(() => {
    if (isOpen) {
      // Default due date: today + 3 days
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDueDate(d.toISOString().split('T')[0]);

      learningService.getActivities().then((acts) => {
        setAvailableActivities(acts || []);
      }).catch(() => {});

      academicService.getSections().then((secs) => {
        setSections(secs || []);
        if (secs?.length > 0 && !targetSectionId) {
          setTargetSectionId(secs[0].id);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  // Prepopulate if editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setInstructions(initialData.instructions || '');
      setLevelId(initialData.learning_level || (levels[0]?.id || ''));
      setAreaId(initialData.learning_area || (areas[0]?.id || ''));
      setTopicId(initialData.topic || '');
      setDifficulty(initialData.difficulty || 'EASY');
      setDurationMinutes(initialData.estimated_duration_minutes || 10);
      setThemeColor(initialData.theme_color || 'sky');

      if (initialData.items) {
        setSelectedActivities(
          initialData.items.map((item) => item.activity_detail || { id: item.activity, title: item.activity_title })
        );
      }
    } else {
      if (levels.length > 0 && !levelId) setLevelId(levels[0].id);
      if (areas.length > 0 && !areaId) setAreaId(areas[0].id);
      setStep(1);
    }
  }, [initialData, levels, areas, isOpen]);

  const handleToggleActivity = (act) => {
    if (selectedActivities.some((a) => a.id === act.id)) {
      setSelectedActivities(selectedActivities.filter((a) => a.id !== act.id));
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  const handleMoveActivity = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= selectedActivities.length) return;
    const items = [...selectedActivities];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    setSelectedActivities(items);
  };

  const handleNextStep = () => {
    setFormError('');
    if (step === 1) {
      if (!title.trim()) {
        setFormError('Please provide a quest title.');
        return;
      }
      if (!levelId) {
        setFormError('Please select a learning stage.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedActivities.length === 0) {
        setFormError('Please select at least 1 interactive activity for this homework quest.');
        return;
      }
      setStep(3);
    }
  };

  const handleSaveHomework = async (status = 'PUBLISHED') => {
    setFormError('');
    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim() || description.trim(),
        learning_level: levelId,
        learning_area: areaId || null,
        topic: topicId || null,
        difficulty,
        estimated_duration_minutes: parseInt(durationMinutes, 10) || 10,
        theme_color: themeColor,
        status: status,
        activity_ids: selectedActivities.map((a) => a.id),
      };

      let hwRecord;
      if (initialData?.id) {
        hwRecord = await learningService.updateHomework(initialData.id, payload);
      } else {
        hwRecord = await learningService.createHomework(payload);
      }

      // If assigning to a class immediately on Step 3
      if (assignImmediately && targetSectionId && dueDate) {
        const selectedSec = sections.find((s) => s.id === targetSectionId);
        await learningService.createAssignment({
          homework: hwRecord.id,
          target_type: 'SECTION',
          section: targetSectionId,
          class_level: selectedSec?.class_level || null,
          due_date: dueDate,
          teacher_notes: teacherNotes,
          status: 'PUBLISHED',
        });
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving homework:', err);
      setFormError(err.response?.data?.error?.message || 'Failed to save homework quest. Please check all fields.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLibrary = availableActivities.filter((a) => {
    const matchesSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !levelId || a.learning_level === levelId || a.learning_level_id === levelId;
    return matchesSearch && matchesLevel;
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? 'Edit Homework Quest' : 'Create Interactive Homework Quest'}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between px-2 sm:px-6">
            <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? 'text-brand-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                1
              </div>
              <span>Quest Info</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? 'text-brand-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                2
              </div>
              <span>Select Activities ({selectedActivities.length})</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-2 text-xs font-bold ${step >= 3 ? 'text-brand-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                3
              </div>
              <span>Assign & Schedule</span>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <FormField label="Homework / Quest Title" required>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Letter A & Safari Animal Safari"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Target Learning Stage" required>
                  <Select
                    value={levelId}
                    onChange={(e) => setLevelId(e.target.value)}
                    options={levels.map((l) => ({ value: l.id, label: `${l.name} (${l.min_age}-${l.max_age}y)` }))}
                  />
                </FormField>

                <FormField label="Curriculum Domain">
                  <Select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    options={areas.map((a) => ({ value: a.id, label: a.name }))}
                  />
                </FormField>

                <FormField label="Topic (Optional)">
                  <Select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    options={[
                      { value: '', label: 'General / None' },
                      ...topics.filter((t) => !areaId || t.learning_area === areaId).map((t) => ({ value: t.id, label: t.name })),
                    ]}
                  />
                </FormField>
              </div>

              <FormField label="Child-Facing Instructions">
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Help Pip the bear find letter A objects and matching animal sounds!"
                  rows={3}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Difficulty">
                  <Select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    options={[
                      { value: 'EASY', label: 'Easy (Level 1)' },
                      { value: 'MEDIUM', label: 'Medium (Level 2)' },
                      { value: 'HARD', label: 'Challenging (Level 3)' },
                    ]}
                  />
                </FormField>

                <FormField label="Estimated Time">
                  <Select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    options={[
                      { value: 5, label: '5 minutes' },
                      { value: 10, label: '10 minutes' },
                      { value: 15, label: '15 minutes' },
                    ]}
                  />
                </FormField>

                <FormField label="Visual Theme Card">
                  <Select
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    options={[
                      { value: 'sky', label: 'Sky Blue 🌤️' },
                      { value: 'emerald', label: 'Forest Green 🌲' },
                      { value: 'amber', label: 'Sunny Amber ☀️' },
                      { value: 'purple', label: 'Magic Purple 🔮' },
                    ]}
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* STEP 2: Activity Selection & Ordering */}
          {step === 2 && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Available Activities Library */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Activity Library ({filteredLibrary.length})
                    </span>
                    <Badge variant="primary" size="sm">
                      Select to Add
                    </Badge>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search activities..."
                      className="pl-8 text-xs"
                    />
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {filteredLibrary.map((act) => {
                      const isSelected = selectedActivities.some((a) => a.id === act.id);
                      return (
                        <div
                          key={act.id}
                          onClick={() => handleToggleActivity(act)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{act.title}</p>
                            <p className="text-[10px] text-slate-400">
                              {act.activity_type} • ⭐ +{act.star_reward || 2}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewActivity(act);
                              }}
                              className="p-1 text-slate-400 hover:text-sky-600 rounded-md"
                              title="Preview Activity"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                              isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Selected Homework Sequence */}
                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Quest Sequence ({selectedActivities.length})
                    </span>
                    <span className="text-[11px] font-bold text-amber-700">
                      ⭐ Total Stars: {selectedActivities.reduce((acc, a) => acc + (a.star_reward || 2), 0)}
                    </span>
                  </div>

                  {selectedActivities.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No activities added yet. Click items on the left to include them in this quest.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {selectedActivities.map((act, idx) => (
                        <div
                          key={act.id || idx}
                          className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                              <p className="text-[10px] text-slate-400">{act.activity_type}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveActivity(idx, -1)}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move Up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === selectedActivities.length - 1}
                              onClick={() => handleMoveActivity(idx, 1)}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move Down"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleActivity(act)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Scheduling & Assigning */}
          {step === 3 && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-black">Ready to launch "{title}"!</p>
                  <p className="text-xs text-amber-900">
                    Children in the selected classroom section will instantly see this quest in their Kid Mode sandbox.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Target Classroom Section" required>
                  <Select
                    value={targetSectionId}
                    onChange={(e) => setTargetSectionId(e.target.value)}
                    options={sections.map((s) => ({ value: s.id, label: `${s.display_name || s.name}` }))}
                  />
                </FormField>

                <FormField label="Due Date" required>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </FormField>
              </div>

              <FormField label="Teacher Announcement & Parent Note">
                <Textarea
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Optional notes visible to parents and teachers..."
                  rows={2}
                />
              </FormField>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={assignImmediately}
                  onChange={(e) => setAssignImmediately(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Publish and assign to classroom students immediately</span>
              </label>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={handleNextStep}
                >
                  Continue
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleSaveHomework('DRAFT')}
                    disabled={isSaving}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => handleSaveHomework('PUBLISHED')}
                    loading={isSaving}
                  >
                    Publish & Assign Quest
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Test Preview Modal */}
      {previewActivity && (
        <ActivityRunner
          activity={previewActivity}
          previewMode={true}
          onClose={() => setPreviewActivity(null)}
        />
      )}
    </>
  );
};
