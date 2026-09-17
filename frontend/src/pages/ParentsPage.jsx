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
import { studentService } from '../services/studentService';
import { Plus, Users, Phone, Mail, UserCheck, Shield } from 'lucide-react';

export const ParentsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    relationship_type: 'MOTHER',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    preferred_communication: 'IN_APP',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['parents'],
    queryFn: () => studentService.getParents(),
  });

  const parentsList = data?.results || (Array.isArray(data) ? data : []);

  const createParentMutation = useMutation({
    mutationFn: (payload) => studentService.createParent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      setIsModalOpen(false);
      setForm({ first_name: '', last_name: '', relationship_type: 'MOTHER', phone: '', email: '', occupation: '', address: '', preferred_communication: 'IN_APP' });
    },
  });

  const columns = [
    {
      header: 'Parent / Guardian',
      accessorKey: 'full_name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            {row.original.first_name?.[0] || 'P'}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.original.full_name}</div>
            <div className="text-xs text-slate-500">{row.original.occupation || 'Parent'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Relationship',
      accessorKey: 'relationship_type',
      cell: ({ row }) => <Badge variant="neutral">{row.original.relationship_type}</Badge>,
    },
    {
      header: 'Contact Info',
      accessorKey: 'phone',
      cell: ({ row }) => (
        <div className="text-xs space-y-0.5">
          <div className="font-semibold text-slate-800">{row.original.phone}</div>
          {row.original.email && <div className="text-slate-400">{row.original.email}</div>}
        </div>
      ),
    },
    {
      header: 'Linked Children (Siblings)',
      accessorKey: 'children',
      cell: ({ row }) => {
        const kids = row.original.children || [];
        return kids.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {kids.map((k) => (
              <span key={k.id} className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                {k.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">No linked children</span>
        );
      },
    },
    {
      header: 'Preferred Channel',
      accessorKey: 'preferred_communication',
      cell: ({ row }) => <span className="text-xs text-slate-600 font-medium">{row.original.preferred_communication}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parents & Guardians Directory"
        description="First-class guardian profiles with multi-child sibling support."
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>Add Parent Profile</span>
          </Button>
        }
      />

      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200">
          <LoadingState message="Loading parents directory..." />
        </div>
      ) : parentsList.length === 0 ? (
        <EmptyState
          title="No parents registered yet"
          description="Create parent records and connect them to their enrolled children."
          actionText="Add Parent"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table data={parentsList} columns={columns} />
        </div>
      )}

      {/* Add Parent Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Parent / Guardian"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createParentMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First Name" required>
              <Input
                value={form.first_name}
                onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Last Name" required>
              <Input
                value={form.last_name}
                onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Relationship" required>
              <select
                value={form.relationship_type}
                onChange={(e) => setForm((p) => ({ ...p, relationship_type: e.target.value }))}
                className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="MOTHER">Mother</option>
                <option value="FATHER">Father</option>
                <option value="GUARDIAN">Legal Guardian</option>
                <option value="OTHER">Other Family Member</option>
              </select>
            </FormField>
            <FormField label="Phone Number" required>
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email Address">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="parent@example.com"
              />
            </FormField>
            <FormField label="Occupation">
              <Input
                value={form.occupation}
                onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))}
                placeholder="e.g. Pediatrician"
              />
            </FormField>
          </div>

          <FormField label="Home Address">
            <Input
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="124 Maple Street..."
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createParentMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              Save Parent Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
