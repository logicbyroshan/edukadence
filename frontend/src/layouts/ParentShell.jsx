import React, { createContext, useContext, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { EduKadenceLogo } from '../components/EduKadenceLogo';
import { studentService } from '../services/studentService';
import {
  Home,
  Clock,
  ShieldCheck,
  CreditCard,
  Bell,
  Sparkles,
  Building2,
  Users,
  ChevronDown,
} from 'lucide-react';
import { Avatar, Badge } from '../components/ui';

export const ParentContext = createContext();

export const useParentContext = () => useContext(ParentContext);

export const ParentShell = () => {
  const { user, activeMembership } = useAuth();
  const location = useLocation();

  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  // Fetch children connected to this parent account
  const { data: childrenData, isLoading } = useQuery({
    queryKey: ['parent-children-list'],
    queryFn: () => studentService.getChildren(),
  });

  const children = Array.isArray(childrenData) ? childrenData : childrenData?.results || [];
  const selectedChild = children[selectedChildIndex] || children[0] || null;

  const navItems = [
    { label: 'Day View', path: '/parent', icon: <Home className="w-5 h-5" /> },
    { label: 'Moments', path: '/parent/activities', icon: <Clock className="w-5 h-5" /> },
    { label: 'Attendance', path: '/parent/attendance', icon: <Users className="w-5 h-5" /> },
    { label: 'Fees', path: '/parent/fees', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Pickup PIN', path: '/parent/pickup', icon: <ShieldCheck className="w-5 h-5" /> },
    { label: 'Notices', path: '/parent/notices', icon: <Bell className="w-5 h-5" /> },
  ];

  return (
    <ParentContext.Provider value={{ selectedChild, children, setSelectedChildIndex, selectedChildIndex }}>
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start pb-24 antialiased">
        <div className="w-full max-w-lg bg-white min-h-screen shadow-xl flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <EduKadenceLogo className="h-6" showText={false} />
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-none">Parent Connect</h1>
                <span className="text-[10px] text-blue-600 font-semibold">{activeMembership?.school_name || 'Sunrise Kids Academy'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
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

          {/* Sibling Switcher Header Bar */}
          {children.length > 0 && (
            <div className="bg-blue-50/70 border-b border-blue-100/80 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {selectedChild?.profile_photo_url ? (
                  <img
                    src={selectedChild.profile_photo_url}
                    alt={selectedChild.full_name}
                    className="w-9 h-9 rounded-full object-cover border border-blue-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {selectedChild?.first_name?.[0] || 'C'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{selectedChild?.full_name}</span>
                    <Badge variant="primary" size="sm">
                      {selectedChild?.current_class?.display_name || 'Enrolled'}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-500">ID: {selectedChild?.admission_number}</p>
                </div>
              </div>

              {/* Multi-Child Sibling Selector */}
              {children.length > 1 && (
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-blue-200 shadow-xs">
                  {children.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedChildIndex(idx)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        selectedChildIndex === idx
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {c.first_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 p-4 overflow-y-auto">
            <Outlet />
          </main>

          {/* Bottom Mobile Navigation Bar */}
          <nav className="fixed bottom-0 w-full max-w-lg bg-white border-t border-slate-200/80 px-1 py-1.5 flex items-center justify-around z-40 shadow-lg">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex flex-col items-center py-1 px-2 rounded-xl transition-all
                    ${isActive ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-normal'}
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
    </ParentContext.Provider>
  );
};
