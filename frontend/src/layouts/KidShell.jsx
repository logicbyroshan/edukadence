import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { EduKadenceLogo } from '../components/EduKadenceLogo';
import {
  Sparkles,
  Star,
  Gamepad2,
  BookOpen,
  Palette,
  LogOut,
  Volume2,
  ShieldAlert,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ui';

export const KidShell = () => {
  const navigate = useNavigate();
  const [exitModalOpen, setExitModalOpen] = useState(false);

  const confirmExit = () => {
    setExitModalOpen(false);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 flex flex-col antialiased selection:bg-amber-200">
      {/* Kid Mode Cheerful Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b-2 border-sky-100 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <EduKadenceLogo className="h-8 sm:h-9" />
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>KID MODE • PLAY & LEARN</span>
          </div>
        </div>

        {/* Stars counter & Sound & Exit trigger */}
        <div className="flex items-center gap-3">
          {/* Reward Stars */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-400 text-amber-950 font-extrabold text-sm shadow-sm border border-amber-500">
            <Star className="w-4 h-4 fill-amber-950" />
            <span>12 Stars</span>
          </div>

          <button
            className="p-2 rounded-2xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors"
            title="Sound On"
            aria-label="Toggle Sound"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Safe Guardian Exit Button */}
          <button
            onClick={() => setExitModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Kid Mode</span>
          </button>
        </div>
      </header>

      {/* Main Kid Mode Canvas */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Exit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        onConfirm={confirmExit}
        title="Leave Kid Mode?"
        message="Are you an adult or educator? Click continue to exit the child learning environment."
        confirmText="Exit to Dashboard"
        cancelText="Stay and Play"
        variant="warning"
      />
    </div>
  );
};
