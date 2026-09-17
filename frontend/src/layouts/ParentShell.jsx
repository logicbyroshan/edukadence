import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { EduKadenceLogo } from '../components/EduKadenceLogo';
import {
  Home,
  Clock,
  ShieldCheck,
  MessageSquare,
  User,
  Sparkles,
  Building2,
} from 'lucide-react';
import { Avatar, Badge } from '../components/ui';

export const ParentShell = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Day View', path: '/parent', icon: <Home className="w-5 h-5" /> },
    { label: 'Activities', path: '/parent/activities', icon: <Clock className="w-5 h-5" /> },
    { label: 'Pickup PIN', path: '/parent/pickup', icon: <ShieldCheck className="w-5 h-5" /> },
    { label: 'Messages', path: '/parent/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Account', path: '/parent/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start pb-20 antialiased">
      {/* Container simulating mobile-first viewport max-w-md or responsive tablet */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-lg flex flex-col">
        {/* Parent Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EduKadenceLogo className="h-6" showText={false} />
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">Parent Connect</h1>
              <span className="text-[10px] text-skybrand-600 font-medium">Little Sprouts Montessori</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/kid"
              className="p-1.5 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
              title="Open Kid Mode"
            >
              <Sparkles className="w-4 h-4" />
            </Link>
            <Link
              to="/app"
              className="p-1.5 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Switch to School Admin"
            >
              <Building2 className="w-4 h-4" />
            </Link>
            <Avatar name={user?.full_name || 'Parent'} src={user?.avatar} size="xs" />
          </div>
        </header>

        {/* Active Child Profile Selector Header */}
        <div className="bg-skybrand-50/60 border-b border-skybrand-100/80 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar
              name="Leo Doe"
              src="https://images.unsplash.com/photo-1595454223600-91fbdd774e1d?w=150&auto=format&fit=crop&q=80"
              size="sm"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Leo Doe</span>
                <Badge variant="sky" size="sm">Pre-K (Age 4)</Badge>
              </div>
              <p className="text-[10px] text-slate-500">Teacher: Sarah Jenkins • Room 102</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            ● Checked In
          </span>
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>

        {/* Bottom Mobile Navigation Bar */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-200/80 px-2 py-1 flex items-center justify-around z-40">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center py-1.5 px-3 rounded-xl transition-all
                  ${isActive ? 'text-brand-600 font-semibold' : 'text-slate-400 hover:text-slate-600 font-normal'}
                `}
              >
                {item.icon}
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
