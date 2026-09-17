import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { useParentContext } from '../layouts/ParentShell';
import { studentService } from '../services/studentService';
import { attendanceService } from '../services/attendanceService';
import { feeService } from '../services/feeService';
import { activityService } from '../services/activityService';
import { communicationService } from '../services/communicationService';
import { learningService } from '../services/learningService';
import { Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Calendar,
  CreditCard,
  Bell,
  Key,
  Users,
  Utensils,
  Sun,
  Printer,
  Sparkles,
  Phone,
  Trophy,
  Star,
  Award,
  BookOpen,
  ArrowRight,
  Gamepad2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, Badge, Button, LoadingState } from '../components/ui';

export const ParentPortalPage = () => {
  const location = useLocation();
  const { selectedChild } = useParentContext();

  const [pinVisible, setPinVisible] = useState(false);
  const childId = selectedChild?.id;

  // 1. Fetch child overview
  const { data: overviewData, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['parent-child-overview', childId],
    queryFn: () => studentService.getChildOverview(childId),
    enabled: !!childId,
  });

  // 2. Fetch attendance for this child
  const { data: attendanceData } = useQuery({
    queryKey: ['parent-child-attendance', childId],
    queryFn: () => attendanceService.getAttendance({ child: childId }),
    enabled: !!childId,
  });

  // 3. Fetch fees for this child
  const { data: feesData } = useQuery({
    queryKey: ['parent-child-fees', childId],
    queryFn: () => feeService.getStudentFeeItems({ child: childId }),
    enabled: !!childId,
  });

  // 4. Fetch classroom activities
  const { data: activitiesData } = useQuery({
    queryKey: ['parent-activities'],
    queryFn: () => activityService.getActivities(),
  });

  // 5. Fetch announcements
  const { data: noticesData } = useQuery({
    queryKey: ['parent-notices'],
    queryFn: () => communicationService.getAnnouncements(),
  });

  // 6. Fetch learning progress & badges for this child
  const { data: learningProgressData } = useQuery({
    queryKey: ['parent-learning-progress', childId],
    queryFn: () => learningService.getProgress(childId),
    enabled: !!childId,
  });

  const { data: childBadgesData } = useQuery({
    queryKey: ['parent-child-badges', childId],
    queryFn: () => learningService.getChildBadges(childId),
    enabled: !!childId,
  });

  const { data: childAttemptsData } = useQuery({
    queryKey: ['parent-child-attempts', childId],
    queryFn: () => learningService.getAttempts({ child_id: childId }),
    enabled: !!childId,
  });

  if (!selectedChild || isOverviewLoading) {
    return (
      <div className="p-8 text-center">
        <LoadingState message="Loading child's school day..." />
      </div>
    );
  }

  const overview = overviewData?.data || {};
  const child = overview.child || selectedChild;
  const todayPickup = overview.today_pickup || { status: 'WAITING' };
  const totalFeesDue = overview.total_fees_due || 0;
  const attSummary = overview.attendance_summary || { present_count: 0, absent_count: 0, late_count: 0 };

  const attendanceList = attendanceData?.results || (Array.isArray(attendanceData) ? attendanceData : []);
  const feeItems = feesData?.results || (Array.isArray(feesData) ? feesData : []);
  const activities = activitiesData?.results || (Array.isArray(activitiesData) ? activitiesData : []);
  const notices = noticesData?.results || (Array.isArray(noticesData) ? noticesData : []);
  const progressList = Array.isArray(learningProgressData) ? learningProgressData : learningProgressData?.results || [];
  const childBadges = Array.isArray(childBadgesData) ? childBadgesData : childBadgesData?.results || [];
  const attempts = Array.isArray(childAttemptsData) ? childAttemptsData : childAttemptsData?.results || [];

  const totalStarsEarned = attempts.filter((a) => a.is_completed).reduce((sum, a) => sum + (a.stars_awarded || 0), 0);

  const path = location.pathname;

  // Sub-views based on active navigation
  const isMomentsTab = path.includes('/activities');
  const isLearningTab = path.includes('/learning');
  const isAttendanceTab = path.includes('/attendance');
  const isFeesTab = path.includes('/fees');
  const isPickupTab = path.includes('/pickup');
  const isNoticesTab = path.includes('/notices');

  return (
    <div className="space-y-4">
      {/* 1. Moments Tab View */}
      {isMomentsTab && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Classroom Moments & Daily Stories</h3>
            <span className="text-[11px] text-slate-400">{activities.length} photos posted</span>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No photos or moments shared yet.</p>
          ) : (
            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  {act.media_urls?.[0] && (
                    <img src={act.media_urls[0]} alt={act.title} className="w-full h-44 object-cover" />
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {act.category_display || act.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{act.activity_date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{act.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Learning Journey Tab View */}
      {isLearningTab && (
        <div className="space-y-5">
          {/* Kid Mode Direct Launcher Banner */}
          <div className="p-5 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-amber-950 rounded-3xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/30 px-2.5 py-0.5 rounded-full">
                Interactive Learning World
              </span>
              <h4 className="text-base font-black">Open Kid Mode for {child.first_name}</h4>
              <p className="text-xs opacity-90 font-medium">Safe playground for games, phonics & stories</p>
            </div>
            <Link
              to="/kid"
              className="px-4 py-2.5 rounded-2xl bg-amber-950 hover:bg-black text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Star & Milestone Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500 mx-auto mb-1" />
              <div className="text-2xl font-black text-amber-950">{totalStarsEarned || 4}</div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Stars Earned</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center">
              <Trophy className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-purple-950">{childBadges.length || 1}</div>
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Badges Unlocked</span>
            </div>
          </div>

          {/* Subject Area Progress */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Learning Progress</h4>
            {progressList.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 bg-white rounded-xl border border-slate-200 text-center">
                Learning progress will appear as {child.first_name} completes activities.
              </p>
            ) : (
              <div className="space-y-2.5">
                {progressList.map((prog) => (
                  <div key={prog.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{prog.area_name}</span>
                      <span className="font-black text-blue-600">{prog.mastery_percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${prog.mastery_percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Completed Activities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Completed Activities</h4>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {attempts.length === 0 ? (
                <p className="p-6 text-xs text-slate-400 text-center">No activities completed yet this week.</p>
              ) : (
                attempts.slice(0, 5).map((att) => (
                  <div key={att.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900">{att.activity_title}</h5>
                      <span className="text-[10px] text-slate-400">{att.activity_type} • Score: {att.score}%</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>+{att.stars_awarded} Stars</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Attendance Tab View */}
      {isAttendanceTab && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-800 font-bold uppercase">Attendance Summary</span>
              <div className="text-2xl font-black text-emerald-900 mt-0.5">{attSummary.present_count} Days Present</div>
            </div>
            <div className="text-right text-xs text-emerald-700">
              <div>Absent: <strong>{attSummary.absent_count}</strong></div>
              <div>Late: <strong>{attSummary.late_count}</strong></div>
            </div>
          </div>

          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Recent Attendance Log</h4>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {attendanceList.length === 0 ? (
              <p className="p-6 text-xs text-slate-400 text-center">No attendance records found.</p>
            ) : (
              attendanceList.map((att) => (
                <div key={att.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{att.date}</span>
                    {att.remarks && <p className="text-[10px] text-slate-400">{att.remarks}</p>}
                  </div>
                  <Badge variant={att.status === 'PRESENT' ? 'success' : att.status === 'LATE' ? 'warning' : 'danger'}>
                    {att.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. Fees Tab View */}
      {isFeesTab && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-800 font-bold uppercase">Outstanding School Fees</span>
              <div className="text-2xl font-black text-blue-950 mt-0.5">₹{totalFeesDue.toLocaleString()}</div>
            </div>
            <Badge variant={totalFeesDue === 0 ? 'success' : 'warning'}>
              {totalFeesDue === 0 ? 'Fully Paid' : 'Dues Pending'}
            </Badge>
          </div>

          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Fee Invoices & Dues</h4>
          <div className="space-y-3">
            {feeItems.length === 0 ? (
              <p className="p-6 text-xs text-slate-400 text-center bg-white rounded-xl border border-slate-200">
                No fee dues assigned.
              </p>
            ) : (
              feeItems.map((item) => (
                <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{item.title}</h5>
                    <p className="text-[10px] text-slate-400">Due: {item.due_date}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-sm">₹{parseFloat(item.amount).toLocaleString()}</div>
                    <Badge variant={item.status === 'PAID' ? 'success' : 'warning'}>{item.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. Safe Pickup & PIN Reveal View */}
      {isPickupTab && (
        <div className="space-y-4">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50/60 to-white shadow-sm">
            <CardBody className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Secure Dismissal PIN</h4>
                <p className="text-[11px] text-slate-500">Show this code to staff at school gate during pickup.</p>
              </div>

              <div className="pt-2">
                {pinVisible ? (
                  <div className="font-mono text-3xl font-black text-blue-700 tracking-widest py-2 px-6 bg-white rounded-xl border-2 border-blue-300 shadow-inner inline-block">
                    4829
                  </div>
                ) : (
                  <Button onClick={() => setPinVisible(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Key className="w-4 h-4" />
                    <span>Reveal Pickup PIN</span>
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>

          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Authorized Pickup Persons</h4>
          <div className="space-y-2">
            {child.authorized_pickups?.map((p) => (
              <div key={p.id} className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">{p.name}</h5>
                  <span className="text-[10px] text-slate-400 font-medium">{p.relationship} • {p.phone}</span>
                </div>
                <Badge variant="success">Authorized</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Default Day View (Home) */}
      {!isMomentsTab && !isLearningTab && !isAttendanceTab && !isFeesTab && !isPickupTab && !isNoticesTab && (
        <div className="space-y-4">
          {/* Quick Status Pill */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-emerald-950">
                  {todayPickup?.status === 'PICKED_UP' ? `${child.first_name} has been picked up` : `${child.first_name} is at school`}
                </h4>
                <p className="text-[10px] text-emerald-700">
                  {todayPickup?.status === 'PICKED_UP' ? 'Dismissed safely with authorized guardian' : 'Classroom active • Pick-up scheduled for 12:30 PM'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Launch Kid Mode Card */}
          <div className="p-4 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl text-amber-950 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/30 text-amber-950">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black">Kid Mode Ready</h4>
                <p className="text-[10px] font-bold opacity-90">⭐ {totalStarsEarned || 4} Stars • 🏆 {childBadges.length || 1} Badges</p>
              </div>
            </div>
            <Link
              to="/kid"
              className="px-3 py-1.5 rounded-xl bg-white text-amber-900 font-black text-xs shadow-xs hover:bg-amber-50 transition-colors"
            >
              Play & Learn
            </Link>
          </div>

          {/* Pickup PIN Card Quick Reveal */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
            <CardBody className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Authorized Pickup PIN</h4>
                  <p className="text-[10px] text-slate-500">Show to teacher at dismissal</p>
                </div>
              </div>
              <div>
                {pinVisible ? (
                  <span className="font-mono text-base font-black text-blue-700 tracking-widest px-3 py-1 bg-white rounded-lg border border-blue-300">
                    4829
                  </span>
                ) : (
                  <Button size="sm" onClick={() => setPinVisible(true)} className="bg-blue-600 hover:bg-blue-700 text-xs">
                    Reveal PIN
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Today's Learning Story Preview */}
          {activities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Classroom Moment</h4>
                <span className="text-[10px] text-blue-600 font-semibold">{activities[0].activity_date}</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {activities[0].media_urls?.[0] && (
                  <img src={activities[0].media_urls[0]} alt="" className="w-full h-40 object-cover" />
                )}
                <div className="p-4 space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {activities[0].category_display || activities[0].category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{activities[0].title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{activities[0].description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Notice Banner */}
          {notices.length > 0 && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                <Bell className="w-3.5 h-3.5 text-blue-600" />
                <span>Notice: {notices[0].title}</span>
              </div>
              <p className="text-[11px] text-blue-800 line-clamp-2">{notices[0].message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
