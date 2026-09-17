import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { schoolService } from '../services/schoolService';
import {
  Users,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
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
  LoadingState,
} from '../components/ui';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, activeMembership } = useAuth();
  const schoolId = activeMembership?.school_id;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['schoolStats', schoolId],
    queryFn: () => schoolService.getSchoolStats(schoolId),
    enabled: !!schoolId,
  });

  const statCards = [
    {
      title: 'Total Enrolled Children',
      value: stats?.children_count ?? 28,
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      change: '+4 this month',
      trend: 'positive',
    },
    {
      title: 'Active Teachers & Staff',
      value: stats?.teachers_count ?? 4,
      icon: <GraduationCap className="w-5 h-5 text-brand-600" />,
      change: '100% capacity',
      trend: 'neutral',
    },
    {
      title: 'Connected Parents',
      value: stats?.parents_count ?? 26,
      icon: <HeartHandshake className="w-5 h-5 text-skybrand-500" />,
      change: '96% app engagement',
      trend: 'positive',
    },
    {
      title: 'Today’s Attendance',
      value: '95.8%',
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      change: '27 of 28 present',
      trend: 'positive',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.first_name || 'Principal'}!`}
        subtitle={`Managing ${activeMembership?.school_name || 'EduKadence School'} • Academic Year 2026-2027`}
        action={
          <div className="flex items-center gap-2">
            <Link to="/parent">
              <Button variant="secondary" size="sm" leftIcon={<HeartHandshake className="w-4 h-4 text-skybrand-500" />}>
                Parent Portal
              </Button>
            </Link>
            <Link to="/kid">
              <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}>
                Launch Kid Mode
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card key={index} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{card.title}</span>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                {card.icon}
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {isLoading ? '...' : card.value}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className={card.trend === 'positive' ? 'text-emerald-600' : 'text-slate-500'}>
                {card.change}
              </span>
            </p>
          </Card>
        ))}
      </div>

      {/* Grid: Foundation Status & School Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Foundation Status */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              action={<Badge variant="success" size="sm" dot>Phase 1 Active</Badge>}
            >
              <CardTitle>Core SaaS Architecture Status</CardTitle>
              <CardDescription>
                Verified foundations established for multi-school tenancy and role-based access.
              </CardDescription>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900">Strict Tenant Data Isolation</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Foreign-key scoped queries ensure zero cross-school data visibility.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900">5 Foundational Roles</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Super Admin, School Admin, Teacher, Parent, and Child Kid Mode.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900">Stateless JWT Lifecycle</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Short-lived access tokens with automatic rotation & blacklisting.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900">25+ Design System Primitives</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Accessible, responsive UI derived from EduKadence brand identity.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Action Cards */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to="/app/schools"
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-brand-700">
                        Multi-School Directory
                      </h4>
                      <p className="text-[11px] text-slate-500">Inspect registered schools</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/app/users"
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-brand-700">
                        Members & Role Assignments
                      </h4>
                      <p className="text-[11px] text-slate-500">Manage school permissions</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Col: Active School Profile & Age Focus */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Profile</CardTitle>
              <CardDescription>Active tenant context details</CardDescription>
            </CardHeader>
            <CardBody className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">School Name</span>
                <p className="font-semibold text-slate-800">{activeMembership?.school_name || 'Little Sprouts Montessori'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[11px]">School Code</span>
                  <p className="font-semibold text-slate-800">{activeMembership?.school_code || 'LSM-01'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Age Focus</span>
                  <p className="font-semibold text-slate-800">2 – 6 Years</p>
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Target Capacity</span>
                <p className="font-semibold text-slate-800">120 Students (Small School Model)</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Active Academic Year</span>
                <p className="font-semibold text-slate-800">2026-2027 (Sept 1 – June 30)</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <Link to="/app/settings">
                  <Button variant="secondary" size="sm" className="w-full">
                    Configure School Settings
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
