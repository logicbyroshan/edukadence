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
  ShieldAlert,
} from 'lucide-react';
import { Avatar, Badge, Dropdown, DropdownItem, DropdownDivider } from '../components/ui';

export const AppShell = () => {
  const { user, activeMembership, activeRole, logout, switchSchool } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/app', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Schools & Tenancy', path: '/app/schools', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Users & Roles', path: '/app/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Settings', path: '/app/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentSchool = activeMembership?.school_name || 'Demo School';

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
                    <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
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
                    className={m.school_id === activeMembership?.school_id ? 'bg-brand-50 text-brand-700 font-semibold' : ''}
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
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                title="Preview Parent Portal"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-skybrand-500" />
                <span>Parent Portal</span>
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
                  <Badge variant="brand" size="sm">
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
            fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col justify-between
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-4 space-y-6">
            {/* Experience Pill */}
            <div className="px-3 py-2 rounded-xl bg-brand-50 border border-brand-100/80 flex items-center gap-2.5 text-brand-800">
              <div className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-900">Experience</span>
                <span className="text-xs font-semibold">School Administration</span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Foundation Modules
              </div>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all
                      ${isActive
                        ? 'bg-brand-600 text-white shadow-sm font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Planned Future Phase Modules Preview */}
            <div className="pt-2 border-t border-slate-100">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Phase 2+ Slots</span>
                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-normal">Planned</span>
              </div>
              <div className="mt-1 space-y-1 text-slate-400 text-xs px-3 py-1 leading-loose">
                <div className="flex items-center gap-2 text-slate-400 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>Children & Rosters</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>Attendance & Pickup</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>Activities & Feed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>EduKadence v1.0</span>
              <span className="text-emerald-600 font-semibold">● Multi-Tenant</span>
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
