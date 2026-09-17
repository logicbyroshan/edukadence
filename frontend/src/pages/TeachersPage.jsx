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
  LoadingState,
  EmptyState,
} from '../components/ui';
import { academicService } from '../services/academicService';
import { apiClient } from '../services/apiClient';
import { Plus, GraduationCap, Mail, Phone, BookOpen, UserCheck } from 'lucide-react';

export const TeachersPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    teacher_id: '',
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

  const columns = [
    {
      header: 'Educator / Teacher',
      accessorKey: 'teacher_name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
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
        <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
          {row.original.section_name}
        </span>
      ),
    },
    {
      header: 'Academic Year',
      accessorKey: 'academic_year_name',
    },
    {
      header: 'Role',
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
        title="Teachers & Educators"
        description="Manage educator profiles, classroom assignments, and teaching cohorts."
      />

      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200">
          <LoadingState message="Loading teacher assignments..." />
        </div>
      ) : assignmentsList.length === 0 ? (
        <EmptyState
          title="No teacher assignments yet"
          description="Assign teachers to classroom sections to enable mass attendance and moment posting."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table data={assignmentsList} columns={columns} />
        </div>
      )}
    </div>
  );
};
