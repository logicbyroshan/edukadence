import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Button,
  Input,
  Select,
  Badge,
  Avatar,
  Table,
  Modal,
  FormField,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../components/ui';
import { studentService } from '../services/studentService';
import { academicService } from '../services/academicService';
import { Plus, Search, User, Filter, ArrowRight, Phone, Shield } from 'lucide-react';

export const ChildrenPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'MALE',
    admission_number: '',
    blood_group: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    profile_photo_url: '',
    notes: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['children', search, statusFilter],
    queryFn: () => studentService.getChildren({ search, status: statusFilter || undefined }),
  });

  const createChildMutation = useMutation({
    mutationFn: (newChild) => studentService.createChild(newChild),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      setIsModalOpen(false);
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'MALE',
        admission_number: '',
        blood_group: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        profile_photo_url: '',
        notes: '',
      });
    },
  });

  const childrenList = Array.isArray(data) ? data : data?.results || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    createChildMutation.mutate(formData);
  };

  const columns = [
    {
      header: 'Child',
      accessorKey: 'full_name',
      cell: ({ row }) => {
        const child = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={child.profile_photo_url}
              name={child.full_name || child.first_name}
              size="md"
            />
            <div>
              <div className="font-semibold text-slate-900">{child.full_name}</div>
              <div className="text-xs text-slate-500">ID: {child.admission_number}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Class / Section',
      accessorKey: 'current_class',
      cell: ({ row }) => {
        const cls = row.original.current_class;
        return cls ? (
          <span className="font-medium text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
            {cls.display_name || `${cls.class_level} - ${cls.section}`}
          </span>
        ) : (
          <span className="text-xs text-slate-400 italic">Not Enrolled</span>
        );
      },
    },
    {
      header: 'Date of Birth / Age',
      accessorKey: 'date_of_birth',
      cell: ({ row }) => (
        <div className="text-sm text-slate-700">
          <div>{row.original.date_of_birth}</div>
          <div className="text-xs text-slate-400 capitalize">{row.original.gender?.toLowerCase()}</div>
        </div>
      ),
    },
    {
      header: 'Emergency Contact',
      accessorKey: 'emergency_contact_phone',
      cell: ({ row }) => {
        const phone = row.original.emergency_contact_phone;
        return phone ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{phone}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">None</span>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === 'ACTIVE' ? 'success' : status === 'GRADUATED' ? 'info' : 'neutral';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      header: 'Action',
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/app/children/${row.original.id}`)}
          className="gap-1.5 text-xs"
        >
          <span>Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Children Directory"
        description="Comprehensive profiles for young learners (ages 2–10)."
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Enroll Child</span>
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by child name or admission number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Enrolled</option>
            <option value="INACTIVE">Inactive</option>
            <option value="GRADUATED">Graduated</option>
            <option value="TRANSFERRED">Transferred</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200">
          <LoadingState message="Loading children directory..." />
        </div>
      ) : error ? (
        <ErrorState message="Failed to load children records" onRetry={() => queryClient.invalidateQueries(['children'])} />
      ) : childrenList.length === 0 ? (
        <EmptyState
          title="No children enrolled yet"
          description="Enroll your first young learner to begin taking attendance, tracking fees, and posting classroom moments."
          actionText="Enroll Child"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table data={childrenList} columns={columns} />
        </div>
      )}

      {/* Enroll Child Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enroll New Child"
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="First Name" required>
              <Input
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="e.g. Aarav"
                required
              />
            </FormField>
            <FormField label="Middle Name">
              <Input
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </FormField>
            <FormField label="Last Name" required>
              <Input
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="e.g. Sharma"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Date of Birth" required>
              <Input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                required
              />
            </FormField>
            <FormField label="Gender" required>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </FormField>
            <FormField label="Admission / Student ID" required>
              <Input
                name="admission_number"
                value={formData.admission_number}
                onChange={handleInputChange}
                placeholder="e.g. SKA-2026-015"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Blood Group">
              <Input
                name="blood_group"
                value={formData.blood_group}
                onChange={handleInputChange}
                placeholder="e.g. B+, O+"
              />
            </FormField>
            <FormField label="Emergency Contact Name">
              <Input
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleInputChange}
                placeholder="Parent / Guardian Name"
              />
            </FormField>
            <FormField label="Emergency Phone">
              <Input
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
              />
            </FormField>
          </div>

          <FormField label="Photo URL">
            <Input
              name="profile_photo_url"
              value={formData.profile_photo_url}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          </FormField>

          <FormField label="Special Notes / Allergies">
            <Input
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="e.g. Nut allergy, asthma, preferred nickname"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createChildMutation.isPending}>
              Enroll Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
