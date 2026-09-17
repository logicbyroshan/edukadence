import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
import { feeService } from '../services/feeService';
import { academicService } from '../services/academicService';
import { CreditCard, Plus, ArrowRight, CheckCircle, Clock, AlertCircle, Layers, FileText } from 'lucide-react';

export const FeesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('dues');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);

  // Form states
  const [structureForm, setStructureForm] = useState({
    name: '',
    fee_type: 'TUITION',
    amount: '',
    frequency: 'MONTHLY',
    due_day: 10,
    academic_year: '',
    class_level: '',
  });

  const [assignForm, setAssignForm] = useState({
    fee_structure_id: '',
    academic_year_id: '',
    class_level_id: '',
    section_id: '',
    due_date: '',
    custom_title: '',
  });

  // Queries
  const { data: statsData } = useQuery({
    queryKey: ['fee-stats'],
    queryFn: () => feeService.getFeeStats(),
  });

  const { data: feeDuesData, isLoading: isDuesLoading } = useQuery({
    queryKey: ['student-fee-items'],
    queryFn: () => feeService.getStudentFeeItems(),
    enabled: activeTab === 'dues',
  });

  const { data: structuresData, isLoading: isStructuresLoading } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: () => feeService.getFeeStructures(),
    enabled: activeTab === 'structures',
  });

  const { data: classLevelsData } = useQuery({
    queryKey: ['class-levels'],
    queryFn: () => academicService.getClassLevels(),
  });

  const { data: sectionsData } = useQuery({
    queryKey: ['sections'],
    queryFn: () => academicService.getSections(),
  });

  const stats = statsData?.data || {
    today_collections: 0,
    month_collections: 0,
    total_pending_due: 0,
    overdue_count: 0,
  };

  const duesList = feeDuesData?.results || (Array.isArray(feeDuesData) ? feeDuesData : []);
  const structuresList = structuresData?.results || (Array.isArray(structuresData) ? structuresData : []);
  const classLevels = classLevelsData?.results || (Array.isArray(classLevelsData) ? classLevelsData : []);
  const sections = sectionsData?.results || (Array.isArray(sectionsData) ? sectionsData : []);

  // Mutations
  const assignBulkMutation = useMutation({
    mutationFn: (payload) => feeService.assignFeeBulk(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['student-fee-items'] });
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      setIsAssignModalOpen(false);
      alert(res.message || 'Fees assigned successfully!');
    },
  });

  const createStructureMutation = useMutation({
    mutationFn: (payload) => feeService.createFeeStructure(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      setIsStructureModalOpen(false);
      setStructureForm({ name: '', fee_type: 'TUITION', amount: '', frequency: 'MONTHLY', due_day: 10, academic_year: '', class_level: '' });
    },
  });

  const duesColumns = [
    {
      header: 'Child',
      accessorKey: 'child_name',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-900">{row.original.child_name}</div>
          <div className="text-xs text-slate-500">ID: {row.original.child_admission_number}</div>
        </div>
      ),
    },
    {
      header: 'Fee Item',
      accessorKey: 'title',
      cell: ({ row }) => <span className="font-medium text-slate-800">{row.original.title}</span>,
    },
    {
      header: 'Due Date',
      accessorKey: 'due_date',
    },
    {
      header: 'Amount / Balance',
      accessorKey: 'balance_due',
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-slate-900">₹{parseFloat(row.original.amount).toLocaleString()}</div>
          {parseFloat(row.original.balance_due) > 0 && parseFloat(row.original.balance_due) < parseFloat(row.original.amount) && (
            <div className="text-xs text-amber-600 font-semibold">
              Bal: ₹{parseFloat(row.original.balance_due).toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const s = row.original.status;
        const variant = s === 'PAID' ? 'success' : s === 'OVERDUE' ? 'danger' : 'warning';
        return <Badge variant={variant}>{s}</Badge>;
      },
    },
    {
      header: 'Action',
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/app/payments?fee_item=${row.original.id}&child=${row.original.child}`)}
          className="text-xs"
        >
          {row.original.status === 'PAID' ? 'View Receipts' : 'Record Payment'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        description="Configure fee structures, track student dues, and monitor collections."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/app/payments')} className="gap-2">
              <FileText className="w-4 h-4" />
              <span>Payments & Receipts</span>
            </Button>
            <Button onClick={() => setIsAssignModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>Assign Fee to Class</span>
            </Button>
          </div>
        }
      />

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Today's Collections</span>
          <div className="text-2xl font-bold text-emerald-600">₹{stats.today_collections.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Month to Date</span>
          <div className="text-2xl font-bold text-slate-900">₹{stats.month_collections.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Pending Dues</span>
          <div className="text-2xl font-bold text-amber-600">₹{stats.total_pending_due.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Overdue Items</span>
          <div className="text-2xl font-bold text-rose-600">{stats.overdue_count}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('dues')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'dues' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Student Fee Dues ({duesList.length})
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'structures' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Fee Structures ({structuresList.length})
        </button>
      </div>

      {/* Dues Tab Content */}
      {activeTab === 'dues' && (
        <div>
          {isDuesLoading ? (
            <div className="p-12 bg-white rounded-xl border border-slate-200">
              <LoadingState message="Loading fee dues..." />
            </div>
          ) : duesList.length === 0 ? (
            <EmptyState
              title="No fee dues assigned yet"
              description="Assign fee structures to classes or individual children to begin collecting payments."
              actionText="Assign Fee to Class"
              onAction={() => setIsAssignModalOpen(true)}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <Table data={duesList} columns={duesColumns} />
            </div>
          )}
        </div>
      )}

      {/* Fee Structures Tab Content */}
      {activeTab === 'structures' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsStructureModalOpen(true)} className="gap-2" size="sm">
              <Plus className="w-4 h-4" />
              <span>Create Fee Structure</span>
            </Button>
          </div>

          {isStructuresLoading ? (
            <div className="p-12 bg-white rounded-xl border border-slate-200">
              <LoadingState message="Loading structures..." />
            </div>
          ) : structuresList.length === 0 ? (
            <EmptyState
              title="No fee structures created"
              description="Define tuition and activity fee templates for your school."
              actionText="Create Fee Structure"
              onAction={() => setIsStructureModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {structuresList.map((str) => (
                <div key={str.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary">{str.fee_type}</Badge>
                    <span className="text-xs font-semibold text-slate-400 capitalize">{str.frequency?.toLowerCase()}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg">{str.name}</h4>
                  <div className="text-2xl font-black text-slate-900">₹{parseFloat(str.amount).toLocaleString()}</div>
                  <div className="text-xs text-slate-500">
                    Applicable to: <strong>{str.class_level_name || 'All School'}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mass Fee Assignment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Fee Structure to Class / Section"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            assignBulkMutation.mutate(assignForm);
          }}
          className="space-y-4"
        >
          <FormField label="Select Fee Structure" required>
            <select
              value={assignForm.fee_structure_id}
              onChange={(e) => setAssignForm((p) => ({ ...p, fee_structure_id: e.target.value }))}
              className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Choose Fee Structure...</option>
              {structuresList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (₹{s.amount})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Target Classroom Section" required>
            <select
              value={assignForm.section_id}
              onChange={(e) => setAssignForm((p) => ({ ...p, section_id: e.target.value }))}
              className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Choose Section...</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.display_name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Due Date" required>
            <Input
              type="date"
              value={assignForm.due_date}
              onChange={(e) => setAssignForm((p) => ({ ...p, due_date: e.target.value }))}
              required
            />
          </FormField>

          <FormField label="Custom Invoice Title">
            <Input
              placeholder="e.g. Nursery Tuition - Term 1"
              value={assignForm.custom_title}
              onChange={(e) => setAssignForm((p) => ({ ...p, custom_title: e.target.value }))}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={assignBulkMutation.isPending}>
              Assign Dues
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
