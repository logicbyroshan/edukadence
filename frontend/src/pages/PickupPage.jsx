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
import { studentService } from '../services/studentService';
import { academicService } from '../services/academicService';
import { ShieldCheck, UserCheck, Phone, Key, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const PickupPage = () => {
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [activeDismissalChild, setActiveDismissalChild] = useState(null);
  const [dismissalForm, setDismissalForm] = useState({
    status: 'PICKED_UP',
    picked_up_by_name: '',
    picked_up_by_relationship: '',
    pin: '',
    notes: '',
  });

  const { data: childrenData, isLoading } = useQuery({
    queryKey: ['children-pickup'],
    queryFn: () => studentService.getChildren(),
  });

  const { data: pickupRecordsData } = useQuery({
    queryKey: ['pickup-records-today', todayStr],
    queryFn: () => studentService.getPickupRecords({ date: todayStr }),
  });

  const children = childrenData?.results || (Array.isArray(childrenData) ? childrenData : []);
  const pickupRecords = pickupRecordsData?.results || (Array.isArray(pickupRecordsData) ? pickupRecordsData : []);

  const recordDismissalMutation = useMutation({
    mutationFn: (payload) => studentService.recordDismissal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-records-today'] });
      setActiveDismissalChild(null);
      setDismissalForm({ status: 'PICKED_UP', picked_up_by_name: '', picked_up_by_relationship: '', pin: '', notes: '' });
    },
  });

  const handleOpenDismissModal = (child, currentRecord) => {
    setActiveDismissalChild(child);
    setDismissalForm({
      status: currentRecord?.status === 'PICKED_UP' ? 'PICKED_UP' : 'PICKED_UP',
      picked_up_by_name: currentRecord?.picked_up_by_name || '',
      picked_up_by_relationship: currentRecord?.picked_up_by_relationship || '',
      pin: '',
      notes: currentRecord?.notes || '',
    });
  };

  // Quick state changer for Ready for Pickup
  const handleQuickReady = (child) => {
    recordDismissalMutation.mutate({
      child_id: child.id,
      status: 'READY_FOR_PICKUP',
      notes: 'Announced at gate waiting area',
    });
  };

  // Metrics
  const totalStudents = children.length;
  const pickedUpCount = pickupRecords.filter((r) => r.status === 'PICKED_UP').length;
  const readyCount = pickupRecords.filter((r) => r.status === 'READY_FOR_PICKUP').length;
  const waitingCount = totalStudents - pickedUpCount - readyCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safe Pickup & Dismissal"
        description="Daily child collection workflow, authorized guardian verification, and dismissal log."
      />

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Waiting in Classroom</span>
          <div className="text-3xl font-bold text-slate-800">{waitingCount}</div>
        </div>
        <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-amber-700 uppercase">Ready at Gate / Waiting Pod</span>
          <div className="text-3xl font-bold text-amber-800">{readyCount}</div>
        </div>
        <div className="bg-emerald-50/60 p-5 rounded-xl border border-emerald-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-emerald-700 uppercase">Dismissed & Picked Up</span>
          <div className="text-3xl font-bold text-emerald-800">{pickedUpCount}</div>
        </div>
      </div>

      {/* Children Dismissal Queue */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200">
          <LoadingState message="Loading dismissal queue..." />
        </div>
      ) : children.length === 0 ? (
        <EmptyState title="No children found" description="Enroll children to begin dismissal management." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map((child) => {
            const record = pickupRecords.find((r) => r.child === child.id);
            const currentStatus = record?.status || 'WAITING';

            return (
              <div
                key={child.id}
                className={`bg-white p-5 rounded-2xl border transition-all shadow-sm flex flex-col justify-between gap-4 ${
                  currentStatus === 'PICKED_UP'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : currentStatus === 'READY_FOR_PICKUP'
                    ? 'border-amber-300 bg-amber-50/30 ring-2 ring-amber-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {child.profile_photo_url ? (
                      <img src={child.profile_photo_url} alt={child.full_name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                        {child.first_name[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{child.full_name}</h4>
                      <p className="text-xs text-slate-500">
                        {child.current_class?.display_name || 'Classroom'} • ID: {child.admission_number}
                      </p>
                    </div>
                  </div>

                  <Badge variant={currentStatus === 'PICKED_UP' ? 'success' : currentStatus === 'READY_FOR_PICKUP' ? 'warning' : 'neutral'}>
                    {currentStatus}
                  </Badge>
                </div>

                {/* Dismissal details if recorded */}
                {record?.picked_up_by_name && (
                  <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 flex items-center justify-between">
                    <span>
                      Collected by: <strong>{record.picked_up_by_name}</strong> ({record.picked_up_by_relationship || 'Guardian'})
                    </span>
                    {record.pin_verified && (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PIN Verified
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {currentStatus !== 'READY_FOR_PICKUP' && currentStatus !== 'PICKED_UP' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReady(child)}
                      className="text-xs text-amber-700 hover:bg-amber-50 flex-1"
                    >
                      Mark Ready at Gate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleOpenDismissModal(child, record)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 gap-1.5 flex-1"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{currentStatus === 'PICKED_UP' ? 'Edit Dismissal' : 'Verify & Dismiss'}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dismissal Modal */}
      {activeDismissalChild && (
        <Modal
          isOpen={!!activeDismissalChild}
          onClose={() => setActiveDismissalChild(null)}
          title={`Dismissal Verification: ${activeDismissalChild.full_name}`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              recordDismissalMutation.mutate({
                child_id: activeDismissalChild.id,
                ...dismissalForm,
              });
            }}
            className="space-y-4"
          >
            <FormField label="Dismissal Status" required>
              <select
                value={dismissalForm.status}
                onChange={(e) => setDismissalForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="PICKED_UP">Picked Up & Dismissed</option>
                <option value="READY_FOR_PICKUP">Ready at Gate / Waiting Area</option>
                <option value="WAITING">Waiting in Classroom</option>
              </select>
            </FormField>

            <FormField label="Collector Full Name" required>
              <Input
                placeholder="e.g. Ramesh Sharma"
                value={dismissalForm.picked_up_by_name}
                onChange={(e) => setDismissalForm((p) => ({ ...p, picked_up_by_name: e.target.value }))}
                required
              />
            </FormField>

            <FormField label="Relationship to Child" required>
              <Input
                placeholder="e.g. Grandfather, Mother, Driver"
                value={dismissalForm.picked_up_by_relationship}
                onChange={(e) => setDismissalForm((p) => ({ ...p, picked_up_by_relationship: e.target.value }))}
                required
              />
            </FormField>

            <FormField label="4-Digit Dismissal PIN (Optional)">
              <Input
                placeholder="e.g. 4829"
                value={dismissalForm.pin}
                onChange={(e) => setDismissalForm((p) => ({ ...p, pin: e.target.value }))}
                maxLength={8}
              />
            </FormField>

            <FormField label="Dismissal Remarks">
              <Input
                placeholder="Remarks..."
                value={dismissalForm.notes}
                onChange={(e) => setDismissalForm((p) => ({ ...p, notes: e.target.value }))}
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setActiveDismissalChild(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={recordDismissalMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                Confirm Handoff
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
