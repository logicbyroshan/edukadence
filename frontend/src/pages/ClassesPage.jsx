import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PageHeader,
  Button,
  Badge,
  Modal,
  FormField,
  Input,
  LoadingState,
  EmptyState,
} from '../components/ui';
import { academicService } from '../services/academicService';
import { Plus, BookOpen, Users, DoorOpen, Layers, Check } from 'lucide-react';

export const ClassesPage = () => {
  const queryClient = useQueryClient();

  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');

  const [levelForm, setLevelForm] = useState({
    name: '',
    code: '',
    order_index: 1,
    description: '',
  });

  const [sectionForm, setSectionForm] = useState({
    class_level: '',
    name: '',
    capacity: 20,
    room_number: '',
  });

  const { data: classLevelsData, isLoading } = useQuery({
    queryKey: ['class-levels'],
    queryFn: () => academicService.getClassLevels(),
  });

  const classLevels = classLevelsData?.results || (Array.isArray(classLevelsData) ? classLevelsData : []);

  const createLevelMutation = useMutation({
    mutationFn: (payload) => academicService.createClassLevel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-levels'] });
      setIsLevelModalOpen(false);
      setLevelForm({ name: '', code: '', order_index: 1, description: '' });
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: (payload) => academicService.createSection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-levels'] });
      setIsSectionModalOpen(false);
      setSectionForm({ class_level: '', name: '', capacity: 20, room_number: '' });
    },
  });

  const handleOpenAddSection = (classId) => {
    setSelectedClassId(classId);
    setSectionForm((p) => ({ ...p, class_level: classId }));
    setIsSectionModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Classroom Sections"
        description="Configure academic grades, cohorts, room capacities, and teacher assignments."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsSectionModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </Button>
            <Button onClick={() => setIsLevelModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>Add Class Level</span>
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200">
          <LoadingState message="Loading classes and sections..." />
        </div>
      ) : classLevels.length === 0 ? (
        <EmptyState
          title="No classes configured yet"
          description="Create your school's grade structure (e.g. Playgroup, Nursery, LKG, UKG, Class 1)."
          actionText="Add Class Level"
          onAction={() => setIsLevelModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {classLevels.map((lvl) => (
            <div key={lvl.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{lvl.name}</h3>
                    <p className="text-xs text-slate-500">{lvl.description || `Grade code: ${lvl.code || 'N/A'}`}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAddSection(lvl.id)}
                  className="gap-1.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </Button>
              </div>

              {/* Sections Grid */}
              <div className="p-6">
                {!lvl.sections || lvl.sections.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No sections created for this grade yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {lvl.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-base">{sec.display_name}</h4>
                          <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                            {sec.room_number || 'Room TBD'}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Enrolled Students</span>
                            <strong className="text-slate-900 font-bold">{sec.enrolled_count || 0} / {sec.capacity}</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Primary Teacher</span>
                            <strong className="text-slate-800">{sec.primary_teacher?.name || 'Unassigned'}</strong>
                          </div>
                        </div>

                        {/* Capacity progress bar */}
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, ((sec.enrolled_count || 0) / sec.capacity) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Class Level Modal */}
      <Modal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        title="Add Class Level (Grade)"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createLevelMutation.mutate(levelForm);
          }}
          className="space-y-4"
        >
          <FormField label="Class Name" required>
            <Input
              placeholder="e.g. Nursery, LKG, UKG, Class 1"
              value={levelForm.name}
              onChange={(e) => setLevelForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Short Code">
              <Input
                placeholder="e.g. NUR, LKG"
                value={levelForm.code}
                onChange={(e) => setLevelForm((p) => ({ ...p, code: e.target.value }))}
              />
            </FormField>
            <FormField label="Sort Order">
              <Input
                type="number"
                value={levelForm.order_index}
                onChange={(e) => setLevelForm((p) => ({ ...p, order_index: parseInt(e.target.value) || 1 }))}
              />
            </FormField>
          </div>
          <FormField label="Description / Age Range">
            <Input
              placeholder="e.g. Ages 3–4 years"
              value={levelForm.description}
              onChange={(e) => setLevelForm((p) => ({ ...p, description: e.target.value }))}
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsLevelModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createLevelMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              Create Class Level
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title="Add Classroom Section"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createSectionMutation.mutate(sectionForm);
          }}
          className="space-y-4"
        >
          <FormField label="Class Level" required>
            <select
              value={sectionForm.class_level}
              onChange={(e) => setSectionForm((p) => ({ ...p, class_level: e.target.value }))}
              className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Select Grade Level...</option>
              {classLevels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name}
                </option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Section Name" required>
              <Input
                placeholder="e.g. A, B, Sunshine"
                value={sectionForm.name}
                onChange={(e) => setSectionForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Max Capacity" required>
              <Input
                type="number"
                value={sectionForm.capacity}
                onChange={(e) => setSectionForm((p) => ({ ...p, capacity: parseInt(e.target.value) || 20 }))}
                required
              />
            </FormField>
          </div>
          <FormField label="Room / Area Identifier">
            <Input
              placeholder="e.g. Room 101, Activity Pod A"
              value={sectionForm.room_number}
              onChange={(e) => setSectionForm((p) => ({ ...p, room_number: e.target.value }))}
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsSectionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createSectionMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              Create Section
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
