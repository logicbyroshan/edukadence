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
  Sparkles,
  Building2,
  Users,
} from 'lucide-react';
import { Avatar, Badge } from '../components/ui';

export const ParentContext = createContext();

export const useParentContext = () => useContext(ParentContext);

export const ParentShell = () => {
  const { user, activeMembership } = useAuth();
  const location = useLocation();

  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  // Fetch children connected to this parent account
  const { data: childrenData } = useQuery({
    queryKey: ['parent-children-list'],
    queryFn: () => studentService.getChildren(),
  });

  const children = Array.isArray(childrenData) ? childrenData : childrenData?.results || [];
  const selectedChild = children[selectedChildIndex] || children[0] || null;

  const navItems = [
    { label: 'Day View', path: '/parent', icon: Home },
    { label: 'Moments', path: '/parent/activities', icon: Clock },
    { label: 'Learning', path: '/parent/learning', icon: Sparkles },
    { label: 'Attendance', path: '/parent/attendance', icon: Users },
    { label: 'Fees', path: '/parent/fees', icon: CreditCard },
    { label: 'Pickup PIN', path: '/parent/pickup', icon: ShieldCheck },
  ];

  return (
    <ParentContext.Provider value={{ selectedChild, children, setSelectedChildIndex, selectedChildIndex }}>
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start pb-20 sm:pb-24 antialiased">
        <div className="w-full max-w-lg bg-white min-h-screen shadow-xl flex flex-col relative border-x border-slate-200/60">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <EduKadenceLogo className="h-6.5 sm:h-7" showText={true} subtitle={activeMembership?.school_name || 'Parent Connect'} />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                to="/app"
                className="p-1.5 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200/80"
                title="Switch to School Admin"
                aria-label="Switch to School Admin"
              >
                <Building2 className="w-4 h-4" />
              </Link>
              <Avatar name={user?.full_name || 'Parent'} src={user?.avatar} size="xs" />
            </div>
          </header>

          {/* Sibling Switcher Header Bar */}
          {children.length > 0 && (
            <div className="bg-gradient-to-r from-brand-50/90 to-skybrand-50/80 border-b border-brand-100 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar
                  src={selectedChild?.profile_photo_url}
                  name={selectedChild?.full_name}
                  size="sm"
                  shape="circle"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[110px] sm:max-w-[150px]">
                      {selectedChild?.full_name}
                    </span>
                    <Badge variant="primary" size="sm">
                      {selectedChild?.current_class?.display_name || 'Enrolled'}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">
                    ID: {selectedChild?.admission_number}
                  </p>
                </div>
              </div>

              {/* Multi-Child Sibling Selector */}
              {children.length > 1 && (
                <div className="flex items-center gap-1 bg-white p-0.5 sm:p-1 rounded-xl border border-brand-200 shadow-2xs overflow-x-auto no-scrollbar shrink-0 max-w-[130px] sm:max-w-[200px]">
                  {children.map((c, idx) => {
                    const isSelected = selectedChildIndex === idx;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedChildIndex(idx)}
                        className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        aria-pressed={isSelected}
                      >
                        {c.first_name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <Outlet />
          </main>

          {/* Bottom Mobile Navigation Bar */}
          <nav
            className="fixed bottom-0 w-full max-w-lg bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 sm:px-2 py-1 sm:py-1.5 grid grid-cols-6 z-40 shadow-lg"
            aria-label="Parent Portal Navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all min-h-[46px] sm:min-h-[48px] select-none
                    ${isActive
                      ? 'text-brand-600 font-bold bg-brand-50/70 scale-102'
                      : 'text-slate-400 hover:text-slate-700 font-medium'}
                  `}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0 ${isActive ? 'text-brand-600 stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  <span className="text-[9px] sm:text-[10px] mt-0.5 leading-none truncate w-full text-center tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </ParentContext.Provider>
  );
};
