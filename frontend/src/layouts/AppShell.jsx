import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { EduKadenceLogo } from '../components/EduKadenceLogo';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  HeartHandshake,
  Calendar,
  ShieldCheck,
  CreditCard,
  Camera,
  Megaphone,
  BarChart3,
  BookOpen,
  UserCheck,
  FileText,
} from 'lucide-react';
import { Avatar, Badge, Dropdown, DropdownItem, DropdownDivider } from '../components/ui';

export const AppShell = () => {
  const { user, activeMembership, activeRole, logout, switchSchool } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navGroups = [
    {
      label: null,
      items: [
        { label: 'Dashboard', path: '/app', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Learning Studio', path: '/app/learning', icon: <Sparkles className="w-4 h-4" /> },
      ],
    },
    {
      label: 'People',
      items: [
        { label: 'Children Directory', path: '/app/children', icon: <Sparkles className="w-4 h-4" /> },
        { label: 'Parents & Guardians', path: '/app/parents', icon: <HeartHandshake className="w-4 h-4" /> },
        { label: 'Teachers & Staff', path: '/app/teachers', icon: <UserCheck className="w-4 h-4" /> },
      ],
    },
    {
      label: 'School Operations',
      items: [
        { label: 'Classes & Sections', path: '/app/classes', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Daily Attendance', path: '/app/attendance', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Classroom Moments', path: '/app/activities', icon: <Camera className="w-4 h-4" /> },
        { label: 'Safe Dismissal', path: '/app/pickup', icon: <ShieldCheck className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Finance',
      items: [
        { label: 'Fees & Invoicing', path: '/app/fees', icon: <CreditCard className="w-4 h-4" /> },
        { label: 'Payments & Receipts', path: '/app/payments', icon: <FileText className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Communication',
      items: [
        { label: 'Announcements', path: '/app/communication', icon: <Megaphone className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Analytics',
      items: [
        { label: 'Reports & Export', path: '/app/reports', icon: <BarChart3 className="w-4 h-4" /> },
      ],
    },
    {
      label: 'System',
      items: [
        { label: 'Schools Directory', path: '/app/schools', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Users & RBAC', path: '/app/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Settings', path: '/app/settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentSchool = activeMembership?.school_name || 'Sunrise Kids Academy';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/app" className="flex items-center">
              <EduKadenceLogo className="h-7 sm:h-8" />
            </Link>
          </div>

          {/* School Switcher & Status Bar */}
          <div className="flex items-center gap-3">
            {/* School Switcher Dropdown */}
            {user?.memberships?.length > 0 && (
              <Dropdown
                align="right"
                trigger={
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">{currentSchool}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                }
              >
                <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch School Context
                </div>
                {user.memberships.map((m) => (
                  <DropdownItem
                    key={m.id}
                    onClick={() => switchSchool(m.school_id)}
                    className={m.school_id === activeMembership?.school_id ? 'bg-blue-50 text-blue-700 font-semibold' : ''}
                  >
                    <div className="flex flex-col">
                      <span>{m.school_name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{m.role} • {m.school_code}</span>
                    </div>
                  </DropdownItem>
                ))}
              </Dropdown>
            )}

            {/* Academic Year Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-200">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>AY 2026-2027</span>
            </div>

            {/* Switch Experience Shortcuts */}
            <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-3">
              <Link
                to="/parent"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Preview Parent Portal"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-blue-500" />
                <span>Parent View</span>
              </Link>
              <Link
                to="/kid"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                title="Preview Kid Mode"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Kid Mode</span>
              </Link>
            </div>

            {/* User Profile Menu */}
            <Dropdown
              align="right"
              trigger={
                <div className="flex items-center gap-2 pl-2 cursor-pointer select-none">
                  <Avatar name={user?.full_name} src={user?.avatar} size="sm" />
                  <div className="hidden lg:flex flex-col text-left leading-none">
                    <span className="text-xs font-semibold text-slate-800">{user?.full_name || 'User'}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{activeRole}</span>
                  </div>
                </div>
              }
            >
              <div className="px-3.5 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || user?.username}</p>
                <div className="mt-2">
                  <Badge variant="primary" size="sm">
                    {activeRole}
                  </Badge>
                </div>
              </div>
              <DropdownItem icon={<Settings className="w-4 h-4" />} onClick={() => navigate('/app/settings')}>
                School Settings
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem icon={<LogOut className="w-4 h-4" />} danger onClick={handleLogout}>
                Sign Out
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for Desktop & Collapsible for Mobile */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col justify-between overflow-y-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-4 space-y-5">
            {/* Experience Pill */}
            <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center gap-2.5 text-blue-800">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">Experience</span>
                <span className="text-xs font-semibold">{activeRole === 'TEACHER' ? 'Teacher Workspace' : 'School Management'}</span>
              </div>
            </div>

            {/* Navigation Groups */}
            <nav className="space-y-4">
              {navGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  {group.label && (
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {group.label}
                    </div>
                  )}
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all
                          ${isActive
                            ? 'bg-blue-600 text-white shadow-sm font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                        `}
                      >
                        <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>EduKadence v4.0</span>
              <span className="text-emerald-600 font-semibold">● Phase 4 Live</span>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
