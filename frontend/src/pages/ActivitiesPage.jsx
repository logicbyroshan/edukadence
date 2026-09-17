import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PageHeader,
  Button,
  Badge,
  Modal,
  FormField,
  Input,
  Textarea,
  LoadingState,
  EmptyState,
} from '../components/ui';
import { activityService } from '../services/activityService';
import { academicService } from '../services/academicService';
import { Camera, Plus, Sparkles, Calendar, Tag, Image as ImageIcon } from 'lucide-react';

export const ActivitiesPage = () => {
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'ART',
    activity_date: todayStr,
    section: '',
    class_level: '',
    academic_year: '',
    media_url_input: '',
  });

  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['activities', categoryFilter],
    queryFn: () => activityService.getActivities({ category: categoryFilter || undefined }),
  });

  const { data: sectionsData } = useQuery({
    queryKey: ['sections'],
    queryFn: () => academicService.getSections(),
  });

  const activities = activitiesData?.results || (Array.isArray(activitiesData) ? activitiesData : []);
  const sections = sectionsData?.results || (Array.isArray(sectionsData) ? sectionsData : []);

  const createActivityMutation = useMutation({
    mutationFn: (payload) => {
      const media_urls = payload.media_url_input
        ? payload.media_url_input.split(',').map((u) => u.trim()).filter(Boolean)
        : [];
      return activityService.createActivity({ ...payload, media_urls });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setIsModalOpen(false);
      setForm({
        title: '',
        description: '',
        category: 'ART',
        activity_date: todayStr,
        section: '',
        class_level: '',
        academic_year: '',
        media_url_input: '',
      });
    },
  });

  const categories = [
    { key: '', label: 'All Moments' },
    { key: 'ART', label: '🎨 Art & Craft' },
    { key: 'LEARNING', label: '🔤 Literacy & Math' },
    { key: 'MUSIC', label: '🎵 Music & Rhymes' },
    { key: 'OUTDOOR', label: '🌳 Outdoor Play' },
    { key: 'STORY', label: '📖 Storytelling' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classroom Moments & Daily Activities"
        description="Publish engaging learning milestones, sensory activities, and photo moments to parents."
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>Post New Moment</span>
          </Button>
        }
      />

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategoryFilter(c.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              categoryFilter === c.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200">
          <LoadingState message="Loading classroom moments..." />
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          title="No classroom moments posted yet"
          description="Share photos and stories of today's learning experiences with families."
          actionText="Post New Moment"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((act) => (
            <div key={act.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
              {/* Media banner if available */}
              {act.media_urls?.length > 0 && (
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={act.media_urls[0]}
                    alt={act.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {act.media_urls.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      +{act.media_urls.length - 1} more
                    </span>
                  )}
                </div>
              )}

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {act.category_display || act.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {act.activity_date}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg">{act.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-3">{act.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Class: <strong>{act.section_name || 'All School'}</strong></span>
                  <span>Posted by: <strong>{act.created_by_name || 'Teacher'}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Moment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Classroom Activity Moment"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createActivityMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <FormField label="Activity Title" required>
            <Input
              placeholder="e.g. 🎨 Finger Painting & Color Exploration"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Category" required>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="ART">Art & Craft</option>
                <option value="LEARNING">Literacy & Numeracy</option>
                <option value="MUSIC">Music & Rhymes</option>
                <option value="OUTDOOR">Outdoor Play</option>
                <option value="STORY">Storytelling</option>
                <option value="MEAL">Meal Time</option>
                <option value="OTHER">Special Event</option>
              </select>
            </FormField>

            <FormField label="Target Section">
              <select
                value={form.section}
                onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}
                className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Whole School</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.display_name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Date" required>
              <Input
                type="date"
                value={form.activity_date}
                onChange={(e) => setForm((p) => ({ ...p, activity_date: e.target.value }))}
                required
              />
            </FormField>
          </div>

          <FormField label="Description & Learning Story" required>
            <Textarea
              rows={3}
              placeholder="Share what the children explored, learned, and experienced today..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
            />
          </FormField>

          <FormField label="Photo URLs (Comma-separated)">
            <Input
              placeholder="https://images.unsplash.com/..., https://..."
              value={form.media_url_input}
              onChange={(e) => setForm((p) => ({ ...p, media_url_input: e.target.value }))}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createActivityMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              Publish Moment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
