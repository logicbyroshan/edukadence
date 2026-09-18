import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PageHeader,
  Button,
  Badge,
  Avatar,
  FormField,
  LoadingState,
  EmptyState,
} from '../components/ui';
import { academicService } from '../services/academicService';
import { attendanceService } from '../services/attendanceService';
import { Check, X, Clock, Calendar, CheckCheck, Save, Users } from 'lucide-react';

export const AttendancePage = () => {
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [records, setRecords] = useState({});

  // 1. Fetch available classroom sections
  const { data: sectionsData, isLoading: isSectionsLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: () => academicService.getSections(),
  });

  const sections = Array.isArray(sectionsData) ? sectionsData : sectionsData?.results || [];

  // Automatically select the first section if none selected
  useEffect(() => {
    if (!selectedSectionId && sections.length > 0) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  // 2. Fetch roster for the selected section
  const { data: rosterData, isLoading: isRosterLoading } = useQuery({
    queryKey: ['section-roster', selectedSectionId],
    queryFn: () => academicService.getSectionRoster(selectedSectionId),
    enabled: !!selectedSectionId,
  });

  // 3. Fetch existing attendance for this section and date
  const { data: existingAttendance } = useQuery({
    queryKey: ['attendance-records', selectedSectionId, selectedDate],
    queryFn: () => attendanceService.getAttendance({ section: selectedSectionId, date: selectedDate }),
    enabled: !!selectedSectionId && !!selectedDate,
  });

  const roster = rosterData?.data?.roster || [];
  const existingList = existingAttendance?.results || (Array.isArray(existingAttendance) ? existingAttendance : []);

  // Initialize or populate local attendance state when roster or existing records load
  useEffect(() => {
    if (roster.length > 0) {
      const initialMap = {};
      roster.forEach((enr) => {
        const found = existingList.find((att) => att.child === enr.child);
        initialMap[enr.child] = {
          status: found ? found.status : 'PRESENT',
          remarks: found ? found.remarks || '' : '',
        };
      });
      setRecords(initialMap);
    }
  }, [rosterData, existingAttendance]);

  const bulkMarkMutation = useMutation({
    mutationFn: (payload) => attendanceService.bulkMarkAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
      alert('Attendance saved successfully!');
    },
  });

  const handleStatusChange = (childId, newStatus) => {
    setRecords((prev) => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        status: newStatus,
      },
    }));
  };

  const handleRemarksChange = (childId, remarks) => {
    setRecords((prev) => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        remarks,
      },
    }));
  };

  const markAll = (status) => {
    const updated = {};
    roster.forEach((enr) => {
      updated[enr.child] = {
        ...records[enr.child],
        status,
      };
    });
    setRecords(updated);
  };

  const handleSave = () => {
    const payloadRecords = Object.entries(records).map(([childId, val]) => ({
      child_id: childId,
      status: val.status,
      remarks: val.remarks,
    }));

    bulkMarkMutation.mutate({
      section_id: selectedSectionId,
      date: selectedDate,
      records: payloadRecords,
    });
  };

  // Metrics
  const totalStudents = roster.length;
  const presentCount = Object.values(records).filter((r) => r.status === 'PRESENT').length;
  const absentCount = Object.values(records).filter((r) => r.status === 'ABSENT').length;
  const lateCount = Object.values(records).filter((r) => r.status === 'LATE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Attendance"
        description="Fast 1-tap attendance marking for classroom cohorts."
        actions={
          <Button onClick={handleSave} isLoading={bulkMarkMutation.isPending} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4" />
            <span>Save Attendance</span>
          </Button>
        }
      />

      {/* Filter and Control Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Class Section</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="py-2 px-3 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.display_name} ({s.enrolled_count || 0} students)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="py-2 px-3 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Quick Bulk Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={() => markAll('PRESENT')} className="gap-1.5 text-xs text-emerald-700 hover:bg-emerald-50">
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All Present</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAll('ABSENT')} className="gap-1.5 text-xs text-rose-700 hover:bg-rose-50">
            <X className="w-4 h-4 text-rose-600" />
            <span>Mark All Absent</span>
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Enrolled</span>
            <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
          </div>
          <Users className="w-8 h-8 text-blue-500 opacity-20" />
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase">Present</span>
            <div className="text-2xl font-bold text-emerald-800">{presentCount}</div>
          </div>
          <Check className="w-8 h-8 text-emerald-600 opacity-30" />
        </div>
        <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-700 uppercase">Absent</span>
            <div className="text-2xl font-bold text-rose-800">{absentCount}</div>
          </div>
          <X className="w-8 h-8 text-rose-600 opacity-30" />
        </div>
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700 uppercase">Late Arrival</span>
            <div className="text-2xl font-bold text-amber-800">{lateCount}</div>
          </div>
          <Clock className="w-8 h-8 text-amber-600 opacity-30" />
        </div>
      </div>

      {/* Student List */}
      {isRosterLoading || isSectionsLoading ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200">
          <LoadingState message="Loading class roster..." />
        </div>
      ) : roster.length === 0 ? (
        <EmptyState
          title="No students enrolled in this section"
          description="Enroll students into this section to begin recording daily attendance."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {roster.map((student) => {
            const childId = student.child;
            const currentRec = records[childId] || { status: 'PRESENT', remarks: '' };

            return (
              <div
                key={student.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={student.child_photo_url}
                    name={student.child_name}
                    size="md"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{student.child_name}</h4>
                    <span className="text-xs text-slate-500">Roll No: {student.roll_number || 'N/A'} • ID: {student.child_admission_number}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Toggle Buttons */}
                  <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(childId, 'PRESENT')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        currentRec.status === 'PRESENT'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Present</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(childId, 'ABSENT')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        currentRec.status === 'ABSENT'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Absent</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(childId, 'LATE')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        currentRec.status === 'LATE'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Late</span>
                    </button>
                  </div>

                  {/* Remarks Input */}
                  <input
                    type="text"
                    placeholder="Optional note (e.g. excused, doctor)"
                    value={currentRec.remarks}
                    onChange={(e) => handleRemarksChange(childId, e.target.value)}
                    className="py-1.5 px-3 text-xs border border-slate-200 rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
