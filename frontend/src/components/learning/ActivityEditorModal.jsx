import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Wand2,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  Modal,
  Button,
  Input,
  Textarea,
  Select,
  FormField,
  Badge,
} from '../ui';
import { ActivityRunner } from './ActivityRunner';
import { learningService } from '../../services/learningService';

export const ActivityEditorModal = ({
  isOpen,
  onClose,
  initialData = null,
  levels = [],
  areas = [],
  topics = [],
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState('TEMPLATE'); // 'TEMPLATE' or 'CUSTOM'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [previewActivity, setPreviewActivity] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('TAP_CHOOSE');
  const [levelId, setLevelId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [starReward, setStarReward] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [contentPayload, setContentPayload] = useState({});

  // Dynamic Content Sub-State based on activity type
  // Tap Choose
  const [tapQuestion, setTapQuestion] = useState('Which one is correct?');
  const [tapOptions, setTapOptions] = useState([
    { id: 'opt-1', label: 'Option A 🍎', emoji: '🍎', is_correct: true },
    { id: 'opt-2', label: 'Option B 🍌', emoji: '🍌', is_correct: false },
    { id: 'opt-3', label: 'Option C 🥕', emoji: '🥕', is_correct: false },
  ]);

  // Match Pairs
  const [matchPrompt, setMatchPrompt] = useState('Match the matching pairs!');
  const [matchPairs, setMatchPairs] = useState([
    { left: 'Dog 🐶', right: 'Bone 🦴' },
    { left: 'Cat 🐱', right: 'Milk 🥛' },
    { left: 'Bird 🐦', right: 'Nest 🪺' },
  ]);

  // Count
  const [countPrompt, setCountPrompt] = useState('How many items do you see?');
  const [countEmoji, setCountEmoji] = useState('⭐');
  const [countTarget, setCountTarget] = useState(4);
  const [countOptions, setCountOptions] = useState('2, 3, 4, 5');

  // Sort
  const [sortPrompt, setSortPrompt] = useState('Sort items into the right groups!');
  const [sortCat1, setSortCat1] = useState('Fruits 🍎');
  const [sortCat2, setSortCat2] = useState('Vegetables 🥦');
  const [sortItems, setSortItems] = useState([
    { id: 's1', label: 'Apple 🍎', category_index: 0 },
    { id: 's2', label: 'Carrot 🥕', category_index: 1 },
    { id: 's3', label: 'Banana 🍌', category_index: 0 },
    { id: 's4', label: 'Broccoli 🥦', category_index: 1 },
  ]);

  // Simple Quiz
  const [quizQuestion, setQuizQuestion] = useState('What color is the sky on a sunny day?');
  const [quizOptions, setQuizOptions] = useState(['Blue 🌤️', 'Green 🌿', 'Red 🔴']);
  const [quizCorrectIdx, setQuizCorrectIdx] = useState(0);

  // Sequence
  const [seqPrompt, setSeqPrompt] = useState('What comes next in the sequence?');
  const [seqItems, setSeqItems] = useState('1, 2, 3, ?');
  const [seqAnswer, setSeqAnswer] = useState('4');

  // Trace
  const [traceChar, setTraceChar] = useState('A');
  const [tracePrompt, setTracePrompt] = useState('Trace the letter!');

  // Load Templates
  useEffect(() => {
    if (isOpen) {
      learningService.getActivityTemplates().then((tpls) => {
        setTemplates(tpls || []);
      }).catch(() => {});
    }
  }, [isOpen]);

  // Initialize form when initialData or levels load
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setActivityType(initialData.activity_type || 'TAP_CHOOSE');
      setLevelId(initialData.learning_level || (levels[0]?.id || ''));
      setAreaId(initialData.learning_area || (areas[0]?.id || ''));
      setTopicId(initialData.topic || '');
      setDifficulty(initialData.difficulty || 'EASY');
      setStarReward(initialData.star_reward || 2);
      setDurationMinutes(initialData.estimated_duration_minutes || 5);
      setContentPayload(initialData.content || {});
      setActiveTab('CUSTOM');
    } else {
      if (levels.length > 0 && !levelId) setLevelId(levels[0].id);
      if (areas.length > 0 && !areaId) setAreaId(areas[0].id);
    }
  }, [initialData, levels, areas, isOpen]);

  const handleApplyTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setTitle(tpl.title);
    setDescription(tpl.description || '');
    setActivityType(tpl.activity_type);
    setDifficulty(tpl.difficulty || 'EASY');
    setStarReward(tpl.star_reward || 2);

    const c = tpl.content || {};
    if (tpl.activity_type === 'TAP_CHOOSE') {
      setTapQuestion(c.prompt || 'Which one is correct?');
      if (c.options) setTapOptions(c.options);
    } else if (tpl.activity_type === 'MATCH') {
      setMatchPrompt(c.prompt || 'Match the pairs!');
      if (c.pairs) setMatchPairs(c.pairs);
    } else if (tpl.activity_type === 'COUNT') {
      setCountPrompt(c.prompt || 'How many?');
      setCountEmoji(c.emoji || '⭐');
      setCountTarget(c.count || 4);
      if (c.options) setCountOptions(c.options.join(', '));
    } else if (tpl.activity_type === 'SORT') {
      setSortPrompt(c.prompt || 'Sort the items!');
      if (c.categories) {
        setSortCat1(c.categories[0] || 'Group 1');
        setSortCat2(c.categories[1] || 'Group 2');
      }
      if (c.items) setSortItems(c.items);
    } else if (tpl.activity_type === 'TRACE') {
      setTraceChar(c.target_character || 'A');
      setTracePrompt(c.prompt || 'Trace the letter!');
    }

    setActiveTab('CUSTOM');
  };

  const buildStructuredContent = () => {
    switch (activityType) {
      case 'TAP_CHOOSE':
        return {
          prompt: tapQuestion,
          options: tapOptions,
        };
      case 'MATCH':
        return {
          prompt: matchPrompt,
          pairs: matchPairs,
        };
      case 'COUNT':
        return {
          prompt: countPrompt,
          item_emoji: countEmoji,
          count: parseInt(countTarget, 10) || 3,
          options: countOptions.split(',').map((s) => parseInt(s.trim(), 10) || 1),
          correct_answer: parseInt(countTarget, 10) || 3,
        };
      case 'SORT':
        return {
          prompt: sortPrompt,
          categories: [sortCat1, sortCat2],
          items: sortItems,
        };
      case 'SEQUENCE':
        return {
          prompt: seqPrompt,
          sequence: seqItems.split(',').map((s) => s.trim()),
          correct_answer: seqAnswer.trim(),
          options: [seqAnswer.trim(), '1', '2', '3'].filter((v, i, a) => a.indexOf(v) === i),
        };
      case 'QUIZ':
        return {
          questions: [
            {
              question: quizQuestion,
              options: quizOptions,
              correct_index: parseInt(quizCorrectIdx, 10) || 0,
            },
          ],
        };
      case 'TRACE':
        return {
          target_character: traceChar,
          prompt: tracePrompt,
        };
      case 'MEMORY':
        return {
          prompt: 'Find all matching pairs!',
          cards: ['🍎', '🍎', '🍌', '🍌', '🍓', '🍓'],
        };
      case 'COLOR':
        return {
          prompt: 'Paint with your favorite colors!',
          colors: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
        };
      default:
        return contentPayload;
    }
  };

  const handlePreview = () => {
    const payload = buildStructuredContent();
    const act = {
      id: 'preview-activity-id',
      title: title || 'Activity Preview',
      description: description,
      activity_type: activityType,
      difficulty,
      star_reward: starReward,
      level_name: levels.find((l) => l.id === levelId)?.name || 'Preview Stage',
      content: payload,
    };
    setPreviewActivity(act);
  };

  const handleSave = async (publishNow = true) => {
    if (!title.trim()) {
      setFormError('Please enter an activity title.');
      return;
    }
    if (!levelId) {
      setFormError('Please select a developmental learning stage.');
      return;
    }
    if (!areaId) {
      setFormError('Please select a curriculum learning area.');
      return;
    }

    setFormError('');
    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        activity_type: activityType,
        learning_level: levelId,
        learning_area: areaId,
        topic: topicId || null,
        difficulty,
        star_reward: parseInt(starReward, 10) || 2,
        estimated_duration_minutes: parseInt(durationMinutes, 10) || 5,
        status: publishNow ? 'PUBLISHED' : 'DRAFT',
        content: buildStructuredContent(),
      };

      if (initialData?.id) {
        await learningService.updateActivity(initialData.id, payload);
      } else {
        await learningService.createActivity(payload);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving activity:', err);
      setFormError(err.response?.data?.error?.message || 'Failed to save activity. Please check required fields.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? 'Edit Learning Activity' : 'Activity Studio — Create Interactive Activity'}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Header Switcher */}
          {!initialData && (
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('TEMPLATE')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'TEMPLATE'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                <span>1-Click Starter Templates</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('CUSTOM')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'CUSTOM'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Custom Activity Authoring</span>
              </button>
            </div>
          )}

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {activeTab === 'TEMPLATE' && !initialData ? (
            /* Template Catalog Grid */
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Choose a pre-configured, age-tailored template to quickly generate an interactive learning quest.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[58vh] overflow-y-auto p-1">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-brand-400 hover:bg-sky-50/40 bg-white shadow-xs cursor-pointer transition-all hover:scale-[1.01] group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600">
                        {tpl.title}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {tpl.activity_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{tpl.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>{tpl.template_category}</span>
                      <span className="text-brand-600 font-bold group-hover:underline">Use Template →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Custom Authoring Form */
            <div className="space-y-5 max-h-[64vh] overflow-y-auto pr-1">
              {/* Row 1: Title & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Activity Title" required>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Find the Hidden Apple"
                  />
                </FormField>

                <FormField label="Interactive Activity Type" required>
                  <Select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    options={[
                      { value: 'TAP_CHOOSE', label: 'Tap & Choose (Visual)' },
                      { value: 'MATCH', label: 'Match Pairs (Drag/Connect)' },
                      { value: 'COUNT', label: 'Counting & Numbers' },
                      { value: 'SORT', label: 'Sort into Groups' },
                      { value: 'SEQUENCE', label: 'Complete Pattern / Sequence' },
                      { value: 'TRACE', label: 'Letter & Line Tracing' },
                      { value: 'QUIZ', label: 'Visual Multiple Choice Quiz' },
                      { value: 'MEMORY', label: 'Memory Card Flip' },
                      { value: 'COLOR', label: 'Coloring Canvas' },
                    ]}
                  />
                </FormField>
              </div>

              {/* Row 2: Level, Area, Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Target Stage" required>
                  <Select
                    value={levelId}
                    onChange={(e) => setLevelId(e.target.value)}
                    options={levels.map((l) => ({ value: l.id, label: `${l.name} (${l.min_age}-${l.max_age}y)` }))}
                  />
                </FormField>

                <FormField label="Curriculum Area" required>
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
                      ...topics
                        .filter((t) => !areaId || t.learning_area === areaId)
                        .map((t) => ({ value: t.id, label: t.name })),
                    ]}
                  />
                </FormField>
              </div>

              {/* Row 3: Description / Child Instructions */}
              <FormField label="Teacher Instructions & Child Prompt">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what the child will do in this quest..."
                  rows={2}
                />
              </FormField>

              {/* Dynamic Interactive Builder Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Configure: {activityType}
                    </span>
                  </div>
                  <Badge variant="primary" size="sm">
                    Interactive Content
                  </Badge>
                </div>

                {/* Sub-form: TAP_CHOOSE */}
                {activityType === 'TAP_CHOOSE' && (
                  <div className="space-y-3.5">
                    <FormField label="Child Question Prompt">
                      <Input
                        value={tapQuestion}
                        onChange={(e) => setTapQuestion(e.target.value)}
                        placeholder="e.g. Can you find the glowing yellow star?"
                      />
                    </FormField>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Answer Options</label>
                      {tapOptions.map((opt, idx) => (
                        <div key={opt.id || idx} className="flex items-center gap-2">
                          <Input
                            value={opt.label}
                            onChange={(e) => {
                              const next = [...tapOptions];
                              next[idx].label = e.target.value;
                              setTapOptions(next);
                            }}
                            placeholder="Option Label (e.g. Apple 🍎)"
                            className="flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = tapOptions.map((o, i) => ({ ...o, is_correct: i === idx }));
                              setTapOptions(next);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                              opt.is_correct
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {opt.is_correct ? '✓ Correct' : 'Mark Correct'}
                          </button>
                          {tapOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setTapOptions(tapOptions.filter((_, i) => i !== idx))}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {tapOptions.length < 5 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          icon={<Plus className="w-3.5 h-3.5" />}
                          onClick={() =>
                            setTapOptions([
                              ...tapOptions,
                              { id: `opt-${Date.now()}`, label: `Option ${tapOptions.length + 1}`, is_correct: false },
                            ])
                          }
                        >
                          Add Option
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-form: MATCH */}
                {activityType === 'MATCH' && (
                  <div className="space-y-3.5">
                    <FormField label="Matching Instructions">
                      <Input
                        value={matchPrompt}
                        onChange={(e) => setMatchPrompt(e.target.value)}
                        placeholder="e.g. Connect the baby animal to its mother!"
                      />
                    </FormField>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Pairs to Connect</label>
                      {matchPairs.map((pair, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            value={pair.left}
                            onChange={(e) => {
                              const next = [...matchPairs];
                              next[idx].left = e.target.value;
                              setMatchPairs(next);
                            }}
                            placeholder="Left Item (e.g. Dog 🐶)"
                            className="flex-1"
                          />
                          <span className="text-slate-400 font-bold">⇄</span>
                          <Input
                            value={pair.right}
                            onChange={(e) => {
                              const next = [...matchPairs];
                              next[idx].right = e.target.value;
                              setMatchPairs(next);
                            }}
                            placeholder="Right Item (e.g. Bone 🦴)"
                            className="flex-1"
                          />
                          {matchPairs.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setMatchPairs(matchPairs.filter((_, i) => i !== idx))}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {matchPairs.length < 5 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          icon={<Plus className="w-3.5 h-3.5" />}
                          onClick={() => setMatchPairs([...matchPairs, { left: '', right: '' }])}
                        >
                          Add Matching Pair
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-form: COUNT */}
                {activityType === 'COUNT' && (
                  <div className="space-y-3.5">
                    <FormField label="Counting Prompt">
                      <Input
                        value={countPrompt}
                        onChange={(e) => setCountPrompt(e.target.value)}
                        placeholder="e.g. How many red apples are in the basket?"
                      />
                    </FormField>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormField label="Item Symbol / Emoji">
                        <Input
                          value={countEmoji}
                          onChange={(e) => setCountEmoji(e.target.value)}
                          placeholder="🍎, ⭐, 🎈"
                        />
                      </FormField>
                      <FormField label="Total Count (Target Answer)">
                        <Input
                          type="number"
                          value={countTarget}
                          onChange={(e) => setCountTarget(e.target.value)}
                          min={1}
                          max={20}
                        />
                      </FormField>
                      <FormField label="Choice Options (Comma separated)">
                        <Input
                          value={countOptions}
                          onChange={(e) => setCountOptions(e.target.value)}
                          placeholder="2, 3, 4, 5"
                        />
                      </FormField>
                    </div>
                  </div>
                )}

                {/* Sub-form: SORT */}
                {activityType === 'SORT' && (
                  <div className="space-y-3.5">
                    <FormField label="Sorting Prompt">
                      <Input
                        value={sortPrompt}
                        onChange={(e) => setSortPrompt(e.target.value)}
                        placeholder="e.g. Sort into Fruits and Vegetables!"
                      />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Group 1 Name">
                        <Input value={sortCat1} onChange={(e) => setSortCat1(e.target.value)} />
                      </FormField>
                      <FormField label="Group 2 Name">
                        <Input value={sortCat2} onChange={(e) => setSortCat2(e.target.value)} />
                      </FormField>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Items to Classify</label>
                      {sortItems.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-center gap-2">
                          <Input
                            value={item.label}
                            onChange={(e) => {
                              const next = [...sortItems];
                              next[idx].label = e.target.value;
                              setSortItems(next);
                            }}
                            placeholder="Item Name (e.g. Apple 🍎)"
                            className="flex-1"
                          />
                          <Select
                            value={item.category_index}
                            onChange={(e) => {
                              const next = [...sortItems];
                              next[idx].category_index = parseInt(e.target.value, 10);
                              setSortItems(next);
                            }}
                            options={[
                              { value: 0, label: `Group 1: ${sortCat1}` },
                              { value: 1, label: `Group 2: ${sortCat2}` },
                            ]}
                            className="w-44"
                          />
                          {sortItems.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setSortItems(sortItems.filter((_, i) => i !== idx))}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {sortItems.length < 6 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          icon={<Plus className="w-3.5 h-3.5" />}
                          onClick={() =>
                            setSortItems([
                              ...sortItems,
                              { id: `s-${Date.now()}`, label: 'New Item', category_index: 0 },
                            ])
                          }
                        >
                          Add Sort Item
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-form: QUIZ */}
                {activityType === 'QUIZ' && (
                  <div className="space-y-3.5">
                    <FormField label="Quiz Question">
                      <Input
                        value={quizQuestion}
                        onChange={(e) => setQuizQuestion(e.target.value)}
                        placeholder="e.g. Which animal is known as the king of the jungle?"
                      />
                    </FormField>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Answer Options</label>
                      {quizOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const next = [...quizOptions];
                              next[idx] = e.target.value;
                              setQuizOptions(next);
                            }}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => setQuizCorrectIdx(idx)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                              quizCorrectIdx === idx
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {quizCorrectIdx === idx ? '✓ Correct' : 'Mark Correct'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-form: TRACE */}
                {activityType === 'TRACE' && (
                  <div className="space-y-3.5">
                    <FormField label="Character to Trace">
                      <Input
                        value={traceChar}
                        onChange={(e) => setTraceChar(e.target.value.toUpperCase().slice(0, 2))}
                        placeholder="A, B, C or 1, 2"
                        className="w-32 font-bold text-lg text-center"
                      />
                    </FormField>
                    <FormField label="Tracing Instructions">
                      <Input
                        value={tracePrompt}
                        onChange={(e) => setTracePrompt(e.target.value)}
                        placeholder="Trace uppercase letter A with your finger!"
                      />
                    </FormField>
                  </div>
                )}

                {/* Sub-form: SEQUENCE */}
                {activityType === 'SEQUENCE' && (
                  <div className="space-y-3.5">
                    <FormField label="Sequence Prompt">
                      <Input value={seqPrompt} onChange={(e) => setSeqPrompt(e.target.value)} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Sequence Items (e.g. 1, 2, 3, ?)">
                        <Input value={seqItems} onChange={(e) => setSeqItems(e.target.value)} />
                      </FormField>
                      <FormField label="Correct Next Item (e.g. 4)">
                        <Input value={seqAnswer} onChange={(e) => setSeqAnswer(e.target.value)} />
                      </FormField>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: Star Rewards & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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

                <FormField label="Star Reward">
                  <Select
                    value={starReward}
                    onChange={(e) => setStarReward(e.target.value)}
                    options={[
                      { value: 1, label: '⭐ 1 Star' },
                      { value: 2, label: '⭐⭐ 2 Stars (Standard)' },
                      { value: 3, label: '⭐⭐⭐ 3 Stars (Bonus)' },
                    ]}
                  />
                </FormField>

                <FormField label="Estimated Time">
                  <Select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    options={[
                      { value: 3, label: '3 minutes' },
                      { value: 5, label: '5 minutes' },
                      { value: 10, label: '10 minutes' },
                    ]}
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {activeTab === 'CUSTOM' ? (
              <Button
                type="button"
                variant="secondary"
                icon={<Eye className="w-4 h-4 text-sky-600" />}
                onClick={handlePreview}
              >
                Test Preview
              </Button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>

              {activeTab === 'CUSTOM' && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => handleSave(true)}
                    loading={isSaving}
                  >
                    Publish Activity
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Test Preview Modal Runner */}
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
