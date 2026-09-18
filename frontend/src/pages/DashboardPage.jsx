import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Sparkles,
  Calendar,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Camera,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  Badge,
  Button,
} from '../components/ui';
import { studentService } from '../services/studentService';
import { attendanceService } from '../services/attendanceService';
import { feeService } from '../services/feeService';
import { activityService } from '../services/activityService';
import { communicationService } from '../services/communicationService';

export const DashboardPage = () => {
  const { user, activeMembership, activeRole } = useAuth();
  const navigate = useNavigate();

  const isTeacher = activeRole === 'TEACHER';

  // Live Phase 2 Queries
  const { data: childrenData } = useQuery({
    queryKey: ['children-count'],
    queryFn: () => studentService.getChildren(),
  });

  const { data: attendanceSummaryData } = useQuery({
    queryKey: ['attendance-summary-today'],
    queryFn: () => attendanceService.getAttendanceSummary(),
  });

  const { data: feeStatsData } = useQuery({
    queryKey: ['fee-stats-today'],
    queryFn: () => feeService.getFeeStats(),
  });

  const { data: pickupRecordsData } = useQuery({
    queryKey: ['pickup-records-today-dash'],
    queryFn: () => studentService.getPickupRecords(),
  });

  const { data: recentActivitiesData } = useQuery({
    queryKey: ['recent-activities-dash'],
    queryFn: () => activityService.getActivities(),
  });

  const { data: recentAnnouncementsData } = useQuery({
    queryKey: ['recent-announcements-dash'],
    queryFn: () => communicationService.getAnnouncements(),
  });

  const totalChildren = childrenData?.count || (Array.isArray(childrenData) ? childrenData.length : 0);
  const att = attendanceSummaryData?.data || { present: 0, absent: 0, late: 0, attendance_rate: 0 };
  const fees = feeStatsData?.data || { today_collections: 0, total_pending_due: 0, overdue_count: 0 };
  const pickups = pickupRecordsData?.results || (Array.isArray(pickupRecordsData) ? pickupRecordsData : []);
  const pickedUpCount = pickups.filter((p) => p.status === 'PICKED_UP').length;
  const waitingPickupCount = totalChildren - pickedUpCount;

  const activities = recentActivitiesData?.results || (Array.isArray(recentActivitiesData) ? recentActivitiesData : []);
  const announcements = recentAnnouncementsData?.results || (Array.isArray(recentAnnouncementsData) ? recentAnnouncementsData : []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good Day, ${user?.first_name || 'Educator'} 👋`}
        subtitle={`${activeMembership?.school_name || 'Sunrise Kids Academy'} • ${isTeacher ? 'Teacher Workspace' : 'School Operational Control'}`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/app/attendance')}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Take Attendance</span>
            </Button>
          </div>
        }
      />

      {/* Primary Live Operational Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Attendance</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{att.present}</span>
            <span className="text-xs text-slate-500">of {totalChildren || 0} Present ({att.attendance_rate}%)</span>
          </div>
          <div className="text-xs text-slate-400">
            Absent: <strong className="text-rose-600">{att.absent}</strong> • Late: <strong className="text-amber-600">{att.late}</strong>
          </div>
        </div>

        {/* Children Enrolled */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Learners</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalChildren}</div>
          <p className="text-xs text-slate-400 font-medium">Ages 2–10 • Playgroup to Primary</p>
        </div>

        {/* Safe Dismissal */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dismissal Status</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pickedUpCount}</span>
            <span className="text-xs text-slate-500">Picked Up Today</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">{waitingPickupCount} children waiting in care</p>
        </div>

        {/* Fee Collections (Admins) OR Learning Studio (Teachers) */}
        {!isTeacher ? (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Collections</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-700">₹{fees.today_collections.toLocaleString()}</div>
            <p className="text-xs text-slate-400 font-medium">Pending: ₹{fees.total_pending_due.toLocaleString()}</p>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Learning Quests</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-brand-700">Active Quests</div>
            <p className="text-xs text-slate-400 font-medium">Classroom assignments ready</p>
          </div>
        )}
      </div>

      {/* Daily Workflow Quick Action Tiles */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold">Daily Educator & Operational Workflows</h3>
          <p className="text-xs text-blue-100 mt-0.5">Quick 1-tap actions optimized for school daily operations.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/app/attendance')}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-left space-y-1.5 border border-white/10 group"
          >
            <Calendar className="w-5 h-5 text-blue-200 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm">Mark Attendance</div>
            <div className="text-[11px] text-blue-200">1-tap mass check-in</div>
          </button>

          <button
            onClick={() => navigate('/app/activities')}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-left space-y-1.5 border border-white/10 group"
          >
            <Camera className="w-5 h-5 text-amber-200 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm">Post Moment</div>
            <div className="text-[11px] text-blue-200">Classroom photo story</div>
          </button>

          <button
            onClick={() => navigate('/app/pickup')}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-left space-y-1.5 border border-white/10 group"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm">Safe Dismissal</div>
            <div className="text-[11px] text-blue-200">Verify guardian PIN</div>
          </button>

          {!isTeacher ? (
            <button
              onClick={() => navigate('/app/payments')}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-left space-y-1.5 border border-white/10 group"
            >
              <CreditCard className="w-5 h-5 text-purple-200 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm">Record Payment</div>
              <div className="text-[11px] text-blue-200">Generate receipt</div>
            </button>
          ) : (
            <button
              onClick={() => navigate('/app/learning')}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-left space-y-1.5 border border-white/10 group"
            >
              <Sparkles className="w-5 h-5 text-amber-200 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm">Learning Studio</div>
              <div className="text-[11px] text-blue-200">Quests & homework</div>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Grid: Recent Classroom Moments & School Bulletins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Classroom Moments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Recent Classroom Moments</h3>
            </div>
            <Link to="/app/activities" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No moments published today.</p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 3).map((act) => (
                <div key={act.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-3">
                  {act.media_urls?.[0] ? (
                    <img
                      src={act.media_urls[0]}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                      🎨
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{act.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{act.activity_date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{act.description}</p>
                    <span className="text-[10px] font-semibold text-blue-600 mt-1 block">
                      {act.section_name || 'School-wide'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcements Noticeboard */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Active Bulletins & Notices</h3>
            </div>
            <Link to="/app/communication" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Manage
            </Link>
          </div>

          {announcements.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No active announcements.</p>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {ann.priority_display || ann.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">{ann.publish_date}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{ann.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{ann.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
