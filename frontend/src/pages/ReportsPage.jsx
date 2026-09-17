import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PageHeader,
  Button,
  Badge,
  Table,
  LoadingState,
} from '../components/ui';
import { reportService } from '../services/reportService';
import { Download, FileSpreadsheet, BarChart3, Users, DollarSign, Calendar } from 'lucide-react';

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('strength');

  const { data: strengthData, isLoading: isStrengthLoading } = useQuery({
    queryKey: ['report-class-strength'],
    queryFn: () => reportService.getClassStrengthReport(),
    enabled: activeTab === 'strength',
  });

  const { data: attendanceData, isLoading: isAttendanceLoading } = useQuery({
    queryKey: ['report-attendance'],
    queryFn: () => reportService.getAttendanceReport(),
    enabled: activeTab === 'attendance',
  });

  const { data: feeData, isLoading: isFeeLoading } = useQuery({
    queryKey: ['report-fees'],
    queryFn: () => reportService.getFeeReport(),
    enabled: activeTab === 'fees',
  });

  const classList = strengthData?.data?.classes || [];
  const attendanceSections = attendanceData?.data?.summary_by_section || {};
  const feeReport = feeData?.data || { total_collected: 0, total_pending_due: 0, overdue_count: 0, by_payment_method: [] };

  const handleDownloadCsv = (type) => {
    window.open(reportService.getExportUrl(type), '_blank');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Data Export"
        description="Clean operational summaries and CSV exports for class strength, attendance, and fee collections."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadCsv('children')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Children CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadCsv('attendance')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Attendance CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadCsv('fees')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Fee Payments CSV</span>
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('strength')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'strength' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Class Capacity & Strength
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'attendance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Attendance Breakdown
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'fees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Financial Collections
        </button>
      </div>

      {/* Strength Tab */}
      {activeTab === 'strength' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Total Enrolled in School</span>
            <span className="text-2xl font-black text-blue-700">{strengthData?.data?.total_school_enrolled || 0} Students</span>
          </div>

          {isStrengthLoading ? (
            <div className="p-12 bg-white rounded-xl border border-slate-200">
              <LoadingState message="Calculating class strength..." />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {classList.map((cls) => (
                <div key={cls.section_id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{cls.display_name}</h4>
                    <span className="text-xs text-slate-500">
                      Boys: {cls.boys_count} • Girls: {cls.girls_count}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 block">Enrolled / Cap</span>
                      <strong className="text-slate-900">{cls.enrolled} / {cls.capacity}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Available Seats</span>
                      <Badge variant={cls.available_seats > 0 ? 'success' : 'danger'}>
                        {cls.available_seats} Seats
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {isAttendanceLoading ? (
            <div className="p-12 bg-white rounded-xl border border-slate-200">
              <LoadingState message="Aggregating attendance rates..." />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {Object.entries(attendanceSections).map(([secName, val]) => (
                <div key={val.section_id} className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{secName}</h4>
                    <span className="text-xs text-slate-500">
                      Present: {val.present} • Absent: {val.absent} • Late: {val.late}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-emerald-700">{val.attendance_rate}%</span>
                    <Badge variant={val.attendance_rate >= 85 ? 'success' : 'warning'}>
                      {val.attendance_rate >= 85 ? 'Healthy' : 'Needs Follow-up'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fee Tab */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Collected</span>
              <div className="text-2xl font-bold text-emerald-600">₹{feeReport.total_collected.toLocaleString()}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Pending Balance</span>
              <div className="text-2xl font-bold text-amber-600">₹{feeReport.total_pending_due.toLocaleString()}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Overdue Count</span>
              <div className="text-2xl font-bold text-rose-600">{feeReport.overdue_count}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-base">Collections by Payment Method</h4>
            <div className="divide-y divide-slate-100">
              {feeReport.by_payment_method?.map((m) => (
                <div key={m.payment_method} className="py-3 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">{m.payment_method}</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">₹{parseFloat(m.total_amount).toLocaleString()}</span>
                    <span className="text-xs text-slate-400 ml-2">({m.total_transactions} txns)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
