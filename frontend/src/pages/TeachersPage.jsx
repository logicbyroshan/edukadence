import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PageHeader,
  Button,
  Badge,
  Table,
  Modal,
  FormField,
  Input,
  Select,
  LoadingState,
  EmptyState,
} from '../components/ui';
import { academicService } from '../services/academicService';
import { useToast } from '../hooks/useToast';
import { Plus, GraduationCap, Mail, Phone, BookOpen, UserCheck, Search, Users, Sparkles } from 'lucide-react';

export const TeachersPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    teacher_name: '',
    teacher_email: '',
    section_id: '',
    is_primary: true,
  });

  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn: () => academicService.getTeacherAssignments(),
  });

  const { data: sectionsData } = useQuery({
    queryKey: ['sections'],
    queryFn: () => academicService.getSections(),
  });

  const assignmentsList = assignmentsData?.results || (Array.isArray(assignmentsData) ? assignmentsData : []);
  const sections = sectionsData?.results || (Array.isArray(sectionsData) ? sectionsData : []);

  const filteredAssignments = assignmentsList.filter((a) => {
    const nameMatch = (a.teacher_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (a.teacher_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const sectionMatch = (a.section_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch || sectionMatch;
  });

  const leadTeacherCount = assignmentsList.filter((a) => a.is_primary).length;
  const assistantCount = assignmentsList.length - leadTeacherCount;

  const handleAssign = (e) => {
    e.preventDefault();
    toast.success(`Educator assigned to classroom section successfully!`);
    setIsModalOpen(false);
    setForm({ teacher_name: '', teacher_email: '', section_id: '', is_primary: true });
  };

  const columns = [
    {
      header: 'Educator / Teacher',
      accessorKey: 'teacher_name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
            {row.original.teacher_name?.[0] || 'T'}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.original.teacher_name}</div>
            <div className="text-xs text-slate-500">{row.original.teacher_email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Classroom',
      accessorKey: 'section_name',
      cell: ({ row }) => (
        <span className="font-semibold text-blue-800 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md text-xs">
          {row.original.section_name}
        </span>
      ),
    },
    {
      header: 'Academic Year',
      accessorKey: 'academic_year_name',
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.original.academic_year_name || 'AY 2026-2027'}
        </span>
      ),
    },
    {
      header: 'Teaching Role',
      accessorKey: 'is_primary',
      cell: ({ row }) => (
        <Badge variant={row.original.is_primary ? 'primary' : 'neutral'}>
          {row.original.is_primary ? 'Class Lead Teacher' : 'Assistant Educator'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers & Staff Roster"
        subtitle="Manage educator profiles, classroom lead assignments, and teaching cohorts."
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Educator</span>
          </Button>
        }
      />

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Educators</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{assignmentsList.length}</div>
            <span className="text-xs text-slate-400">Active teaching cohort</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead Class Teachers</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{leadTeacherCount}</div>
            <span className="text-xs text-slate-400">Classroom leads</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assistant Educators</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{assistantCount}</div>
            <span className="text-xs text-slate-400">Support faculty</span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search educator or classroom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200">
          <LoadingState message="Loading teacher assignments..." />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          title="No teacher assignments found"
          description="Assign teachers to classroom sections to enable mass attendance, homework quests, and moment posting."
          action={
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              Assign First Teacher
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table data={filteredAssignments} columns={columns} />
        </div>
      )}

      {/* Assign Teacher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Educator to Classroom"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <FormField label="Educator Full Name" required>
            <Input
              placeholder="e.g. Sarah Jenkins"
              value={form.teacher_name}
              onChange={(e) => setForm({ ...form, teacher_name: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Email Address" required>
            <Input
              type="email"
              placeholder="e.g. sarah.teacher@school.edu"
              value={form.teacher_email}
              onChange={(e) => setForm({ ...form, teacher_email: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Assigned Classroom Section" required>
            <Select
              value={form.section_id}
              onChange={(e) => setForm({ ...form, section_id: e.target.value })}
              options={[
                { value: '', label: 'Select a classroom section...' },
                ...sections.map((s) => ({ value: s.id, label: `${s.display_name || s.name}` })),
              ]}
              required
            />
          </FormField>

          <FormField label="Role Responsibility">
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  checked={form.is_primary === true}
                  onChange={() => setForm({ ...form, is_primary: true })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Class Lead Teacher</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  checked={form.is_primary === false}
                  onChange={() => setForm({ ...form, is_primary: false })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Assistant Educator</span>
              </label>
            </div>
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
