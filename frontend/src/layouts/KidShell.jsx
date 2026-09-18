import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { EduKadenceLogo } from '../components/EduKadenceLogo';
import {
  Sparkles,
  Star,
  Gamepad2,
  BookOpen,
  Palette,
  LogOut,
  Volume2,
  VolumeX,
  Trophy,
  Video,
  Compass,
  Home,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { learningService } from '../services/learningService';
import { studentService } from '../services/studentService';
import { useAuth } from '../hooks/useAuth';

export const KidShell = () => {
  const { user, activeRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathError, setMathError] = useState(false);
  const [mathChallenge, setMathChallenge] = useState({ a: 7, b: 5 });

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childSummary, setChildSummary] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const kids = await studentService.getChildren();
      const list = kids.results || kids;
      setChildrenList(list);
      if (list && list.length > 0) {
        setSelectedChild(list[0]);
        loadSummary(list[0].id);
      } else {
        loadSummary(null);
      }
    } catch (err) {
      console.error('Error loading kids list:', err);
      loadSummary(null);
    }
  };

  const loadSummary = async (childId) => {
    try {
      const data = await learningService.getKidHome(childId);
      setChildSummary(data);
    } catch (err) {
      console.error('Error loading kid summary:', err);
    }
  };

  const switchChild = (child) => {
    setSelectedChild(child);
    loadSummary(child.id);
  };

  const openExitModal = () => {
    const a = Math.floor(Math.random() * 8) + 4;
    const b = Math.floor(Math.random() * 8) + 3;
    setMathChallenge({ a, b });
    setMathAnswer('');
    setMathError(false);
    setExitModalOpen(true);
  };

  const handleVerifyExit = async (e) => {
    e.preventDefault();
    if (parseInt(mathAnswer, 10) === mathChallenge.a + mathChallenge.b) {
      setExitModalOpen(false);
      if (activeRole === 'PARENT') {
        navigate('/parent');
      } else if (activeRole === 'CHILD') {
        await logout();
        navigate('/login');
      } else {
        navigate('/app');
      }
    } else {
      setMathError(true);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/kid', icon: Home },
    { label: 'Explore', path: '/kid/explore', icon: Compass },
    { label: 'Storybooks', path: '/kid/stories', icon: BookOpen },
    { label: 'Videos', path: '/kid/videos', icon: Video },
    { label: 'My World', path: '/kid/badges', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100/60 via-white to-amber-50/50 flex flex-col antialiased selection:bg-amber-200">
      {/* Cheerful Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-sky-200 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link to="/kid" className="flex items-center gap-2 shrink-0">
            <EduKadenceLogo className="h-7 sm:h-9" subtitle="Play & Learn" />
          </Link>

          {/* Sibling / Child Switcher Pill */}
          {childrenList.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-sky-50 rounded-2xl border border-sky-200 overflow-x-auto no-scrollbar max-w-[200px]">
              {childrenList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => switchChild(c)}
                  className={`
                    px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl text-xs font-black transition-all whitespace-nowrap
                    ${selectedChild?.id === c.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'}
                  `}
                >
                  {c.first_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary Child Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`
                  flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all
                  ${isActive
                    ? 'bg-white text-brand-700 shadow-xs ring-1 ring-slate-200/80 scale-102'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Star Wallet & Sound & Guardian Exit */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Total Stars Counter */}
          <Link
            to="/kid/badges"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-sm border border-amber-500 transition-transform active:scale-95 whitespace-nowrap"
            title="View My Stars & Badges"
          >
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-950 text-amber-950 animate-spin-slow" />
            <span>{childSummary?.total_stars || 12} Stars</span>
          </Link>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 sm:p-2 rounded-2xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors"
            title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <VolumeX className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-400" />}
          </button>

          {/* Safe Guardian Exit */}
          <button
            onClick={openExitModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200 shadow-xs"
            title="Parent / Educator Exit"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        <Outlet context={{ selectedChild, childSummary, refreshSummary: () => loadSummary(selectedChild?.id) }} />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        {navLinks.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`
                flex flex-col items-center gap-0.5 p-1 text-[11px] font-black
                ${isActive ? 'text-brand-600 scale-105' : 'text-slate-500 hover:text-slate-900'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Adult Math-Gate Exit Dialog */}
      <Modal
        isOpen={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        title="Grown-Up Verification 🔒"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleVerifyExit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <p className="font-bold">Leaving Kid Mode</p>
              <p className="text-amber-800 mt-0.5">
                {activeRole === 'PARENT'
                  ? 'Please solve this quick math challenge to return to your Parent Portal.'
                  : 'Please solve this math question to exit Kid Mode.'}
              </p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <span className="text-sm font-bold text-slate-500 uppercase">Solve:</span>
            <h3 className="text-2xl font-black text-slate-900">
              {mathChallenge.a} + {mathChallenge.b} = ?
            </h3>
          </div>

          <Input
            type="number"
            placeholder="Enter answer"
            value={mathAnswer}
            onChange={(e) => setMathAnswer(e.target.value)}
            className="text-center text-xl font-bold"
            autoFocus
          />

          {mathError && (
            <p className="text-xs font-bold text-rose-600 text-center">
              Incorrect answer. Please try again.
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setExitModalOpen(false)}
            >
              Stay in Kid Mode
            </Button>
            <Button type="submit" variant="primary">
              {activeRole === 'PARENT' ? 'Return to Parent Portal' : 'Exit to Dashboard'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
