import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Badge,
  Card,
  Modal,
  FormField,
  Input,
  LoadingState,
  ErrorState,
} from '../components/ui';
import { studentService } from '../services/studentService';
import { feeService } from '../services/feeService';
import { attendanceService } from '../services/attendanceService';
import { activityService } from '../services/activityService';
import {
  ArrowLeft,
  Calendar,
  Phone,
  ShieldCheck,
  CreditCard,
  Camera,
  Users,
  Clock,
  Plus,
  Heart,
  Key,
  CheckCircle2,
} from 'lucide-react';

export const ChildProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isAddCollectorModalOpen, setIsAddCollectorModalOpen] = useState(false);

  const [collectorData, setCollectorData] = useState({
    name: '',
    relationship: '',
    phone: '',
    pickup_pin: '',
    photo_url: '',
  });

  const [dismissalData, setDismissalData] = useState({
    status: 'PICKED_UP',
    picked_up_by_name: '',
    picked_up_by_relationship: '',
    pin: '',
  });

  const { data: overviewData, isLoading, error } = useQuery({
    queryKey: ['child-overview', id],
    queryFn: () => studentService.getChildOverview(id),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['child-attendance', id],
    queryFn: () => attendanceService.getAttendance({ child: id }),
    enabled: activeTab === 'attendance',
  });

  const { data: feeItemsData } = useQuery({
    queryKey: ['child-fees', id],
    queryFn: () => feeService.getStudentFeeItems({ child: id }),
    enabled: activeTab === 'fees',
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['child-activities', id],
    queryFn: () => activityService.getActivities(),
    enabled: activeTab === 'activities',
  });

  const recordDismissalMutation = useMutation({
    mutationFn: (payload) => studentService.recordDismissal({ child_id: id, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-overview', id] });
      setIsPickupModalOpen(false);
    },
  });

  const addCollectorMutation = useMutation({
    mutationFn: (payload) => studentService.createAuthorizedPickup({ child: id, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-overview', id] });
      setIsAddCollectorModalOpen(false);
      setCollectorData({ name: '', relationship: '', phone: '', pickup_pin: '', photo_url: '' });
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 bg-white rounded-xl border border-slate-200">
        <LoadingState message="Loading child profile..." />
      </div>
    );
  }

  if (error || !overviewData?.data) {
    return <ErrorState message="Failed to load child profile" onRetry={() => navigate('/app/children')} />;
  }

  const { child, today_pickup, total_fees_due, attendance_summary } = overviewData.data;
  const attendanceList = attendanceData?.results || (Array.isArray(attendanceData) ? attendanceData : []);
  const feeItemsList = feeItemsData?.results || (Array.isArray(feeItemsData) ? feeItemsData : []);
  const activitiesList = activitiesData?.results || (Array.isArray(activitiesData) ? activitiesData : []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Heart },
    { id: 'parents', label: `Parents (${child.parents?.length || 0})`, icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'fees', label: 'Fees & Invoices', icon: CreditCard },
    { id: 'pickups', label: 'Safe Pickups', icon: ShieldCheck },
    { id: 'activities', label: 'Classroom Moments', icon: Camera },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/app/children')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Children Directory</span>
      </button>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {child.profile_photo_url ? (
            <img
              src={child.profile_photo_url}
              alt={child.full_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-2xl">
              {child.first_name?.[0] || 'C'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{child.full_name}</h1>
              <Badge variant={child.status === 'ACTIVE' ? 'success' : 'neutral'}>{child.status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
              <span>ID: <strong className="text-slate-800">{child.admission_number}</strong></span>
              <span>•</span>
              <span>Class: <strong className="text-slate-800">{child.current_class?.display_name || 'Unassigned'}</strong></span>
              <span>•</span>
              <span>DOB: <strong className="text-slate-800">{child.date_of_birth}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsAddCollectorModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Add Pickup Person</span>
          </Button>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsPickupModalOpen(true)}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Record Dismissal</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Metrics */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance (Recent)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{attendance_summary.present_count}</span>
              <span className="text-xs text-slate-500">Days Present</span>
            </div>
            <div className="text-xs text-slate-500">
              Absent: <strong className="text-rose-600">{attendance_summary.absent_count}</strong> • Late: <strong className="text-amber-600">{attendance_summary.late_count}</strong>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fees Outstanding</span>
            <div className="text-3xl font-bold text-slate-900">
              ₹{total_fees_due.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              {total_fees_due === 0 ? 'All fees paid up to date' : 'Pending dues for this term'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Dismissal Status</span>
            <div className="flex items-center gap-2">
              <Badge variant={today_pickup?.status === 'PICKED_UP' ? 'success' : 'neutral'}>
                {today_pickup?.status || 'WAITING'}
              </Badge>
            </div>
            <div className="text-xs text-slate-500">
              {today_pickup?.picked_up_by_name
                ? `Picked up by: ${today_pickup.picked_up_by_name}`
                : 'Waiting in classroom for dismissal'}
            </div>
          </div>

          {/* Health & Safety Details */}
          <div className="md:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Health & Emergency Safety</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-lg">
                <span className="text-xs text-slate-400 font-medium">Blood Group</span>
                <p className="font-semibold text-slate-800 mt-0.5">{child.blood_group || 'Not Specified'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <span className="text-xs text-slate-400 font-medium">Emergency Contact</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {child.emergency_contact_name || 'Guardian'} ({child.emergency_contact_phone || 'None'})
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <span className="text-xs text-slate-400 font-medium">Medical & Allergy Notes</span>
                <p className="font-semibold text-slate-800 mt-0.5">{child.medical_notes || 'No known allergies'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'parents' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {child.parents?.map((p) => (
              <div key={p.relationship_id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {p.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{p.name}</h4>
                    <Badge variant={p.is_primary_contact ? 'primary' : 'neutral'}>
                      {p.relationship_type} {p.is_primary_contact ? '• Primary' : ''}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.phone}</span>
                    </div>
                    {p.email && <div>Email: {p.email}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4">
          <h3 className="font-bold text-slate-900 mb-3 text-base">Attendance History</h3>
          {attendanceList.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No attendance records found yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {attendanceList.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-slate-900">{item.date}</span>
                    {item.remarks && <span className="text-xs text-slate-400 ml-2">({item.remarks})</span>}
                  </div>
                  <Badge variant={item.status === 'PRESENT' ? 'success' : item.status === 'LATE' ? 'warning' : 'danger'}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Assigned Dues & Invoices</h3>
          {feeItemsList.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No fee dues assigned.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {feeItemsList.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-400">Due Date: {item.due_date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">₹{parseFloat(item.amount).toLocaleString()}</div>
                    <Badge variant={item.status === 'PAID' ? 'success' : 'warning'}>{item.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pickups' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {child.authorized_pickups?.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    {p.name[0]}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{p.name}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                      {p.relationship}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <div>Phone: <strong>{p.phone}</strong></div>
                    {p.pickup_pin && (
                      <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                        <Key className="w-3.5 h-3.5" />
                        <span>Pickup PIN: {p.pickup_pin}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activitiesList.map((act) => (
            <div key={act.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  {act.category_display || act.category}
                </span>
                <span className="text-xs text-slate-400">{act.activity_date}</span>
              </div>
              <h4 className="font-bold text-slate-900">{act.title}</h4>
              <p className="text-sm text-slate-600">{act.description}</p>
              {act.media_urls?.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {act.media_urls.map((url, idx) => (
                    <img key={idx} src={url} alt="Class activity" className="h-32 w-full object-cover rounded-lg" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Record Dismissal Modal */}
      <Modal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        title={`Record Dismissal for ${child.full_name}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            recordDismissalMutation.mutate(dismissalData);
          }}
          className="space-y-4"
        >
          <FormField label="Dismissal Status" required>
            <select
              value={dismissalData.status}
              onChange={(e) => setDismissalData((p) => ({ ...p, status: e.target.value }))}
              className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="PICKED_UP">Picked Up & Dismissed</option>
              <option value="READY_FOR_PICKUP">Ready at Gate / Waiting Area</option>
              <option value="WAITING">Waiting in Classroom</option>
            </select>
          </FormField>
          <FormField label="Picked Up By (Name)">
            <Input
              value={dismissalData.picked_up_by_name}
              onChange={(e) => setDismissalData((p) => ({ ...p, picked_up_by_name: e.target.value }))}
              placeholder="e.g. Grandma Sharma"
            />
          </FormField>
          <FormField label="Relationship to Child">
            <Input
              value={dismissalData.picked_up_by_relationship}
              onChange={(e) => setDismissalData((p) => ({ ...p, picked_up_by_relationship: e.target.value }))}
              placeholder="e.g. Grandmother / Mother"
            />
          </FormField>
          <FormField label="Verification PIN (Optional)">
            <Input
              value={dismissalData.pin}
              onChange={(e) => setDismissalData((p) => ({ ...p, pin: e.target.value }))}
              placeholder="e.g. 4829"
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsPickupModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={recordDismissalMutation.isPending}>
              Save Dismissal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Pickup Person Modal */}
      <Modal
        isOpen={isAddCollectorModalOpen}
        onClose={() => setIsAddCollectorModalOpen(false)}
        title="Add Authorized Pickup Person"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addCollectorMutation.mutate(collectorData);
          }}
          className="space-y-4"
        >
          <FormField label="Full Name" required>
            <Input
              value={collectorData.name}
              onChange={(e) => setCollectorData((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Ramesh Sharma"
              required
            />
          </FormField>
          <FormField label="Relationship to Child" required>
            <Input
              value={collectorData.relationship}
              onChange={(e) => setCollectorData((p) => ({ ...p, relationship: e.target.value }))}
              placeholder="e.g. Grandfather, Driver, Babysitter"
              required
            />
          </FormField>
          <FormField label="Phone Number" required>
            <Input
              value={collectorData.phone}
              onChange={(e) => setCollectorData((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+1 (555) 000-0000"
              required
            />
          </FormField>
          <FormField label="Secret 4-Digit Pickup PIN">
            <Input
              value={collectorData.pickup_pin}
              onChange={(e) => setCollectorData((p) => ({ ...p, pickup_pin: e.target.value }))}
              placeholder="e.g. 4829"
              maxLength={8}
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAddCollectorModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={addCollectorMutation.isPending}>
              Save Authorized Person
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
