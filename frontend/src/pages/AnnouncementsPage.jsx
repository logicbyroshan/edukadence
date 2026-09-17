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
import { communicationService } from '../services/communicationService';
import { academicService } from '../services/academicService';
import { Megaphone, Plus, Pin, Calendar, AlertTriangle, Info, Bell } from 'lucide-react';

export const AnnouncementsPage = () => {
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    audience_type: 'ALL_SCHOOL',
    priority: 'NORMAL',
    section: '',
    class_level: '',
    publish_date: todayStr,
    is_pinned: false,
  });

  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => communicationService.getAnnouncements(),
  });

  const { data: sectionsData } = useQuery({
    queryKey: ['sections'],
    queryFn: () => academicService.getSections(),
  });

  const announcements = announcementsData?.results || (Array.isArray(announcementsData) ? announcementsData : []);
  const sections = sectionsData?.results || (Array.isArray(sectionsData) ? sectionsData : []);

  const createAnnouncementMutation = useMutation({
    mutationFn: (payload) => communicationService.createAnnouncement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsModalOpen(false);
      setForm({
        title: '',
        message: '',
        audience_type: 'ALL_SCHOOL',
        priority: 'NORMAL',
        section: '',
        class_level: '',
        publish_date: todayStr,
        is_pinned: false,
      });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Bulletins & Announcements"
        description="Broadcast structured notices to whole school, specific classes, or sections."
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </Button>
        }
      />

      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200">
          <LoadingState message="Loading announcements..." />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          title="No announcements published"
          description="Create school-wide or classroom-specific notices for parents and staff."
          actionText="New Announcement"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-5 rounded-2xl border transition-all shadow-sm bg-white space-y-3 ${
                ann.is_pinned ? 'border-blue-200 bg-blue-50/10 ring-1 ring-blue-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {ann.is_pinned && (
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <Badge variant={ann.priority === 'HIGH' || ann.priority === 'URGENT' ? 'danger' : 'primary'}>
                    {ann.priority_display || ann.priority}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Audience: {ann.audience_display || ann.audience_type}
                  </span>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {ann.publish_date}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-lg">{ann.title}</h3>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{ann.message}</p>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                <span>Target: <strong>{ann.section_name || ann.class_level_name || 'Whole School'}</strong></span>
                <span>Posted by: <strong>{ann.created_by_name || 'Administration'}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Announcement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Announcement"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createAnnouncementMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <FormField label="Title" required>
            <Input
              placeholder="e.g. 🌿 Spring Nature Walk & Potting Activity"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Audience Scope" required>
              <select
                value={form.audience_type}
                onChange={(e) => setForm((p) => ({ ...p, audience_type: e.target.value }))}
                className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="ALL_SCHOOL">Whole School (All Parents & Staff)</option>
                <option value="SECTION">Specific Section</option>
              </select>
            </FormField>

            {form.audience_type === 'SECTION' && (
              <FormField label="Select Section">
                <select
                  value={form.section}
                  onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}
                  className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Choose Section...</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.display_name}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField label="Priority" required>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">Important / High</option>
                <option value="URGENT">Urgent Alert</option>
              </select>
            </FormField>
          </div>

          <FormField label="Message Body" required>
            <Textarea
              rows={4}
              placeholder="Enter announcement text for parents..."
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              required
            />
          </FormField>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pin_notice"
              checked={form.is_pinned}
              onChange={(e) => setForm((p) => ({ ...p, is_pinned: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="pin_notice" className="text-sm font-semibold text-slate-700 cursor-pointer">
              Pin notice to top of parent and staff dashboards
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createAnnouncementMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
