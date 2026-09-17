import React from 'react';
import { Outlet } from 'react-router-dom';
import { EduKadenceLogo } from '../components/EduKadenceLogo';
import { CheckCircle2, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased">
      {/* Left Brand Showcase Column */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-brand-950 to-brand-900 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10">
          <EduKadenceLogo className="h-9" variant="light" />
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-skybrand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-skybrand-400" />
            <span>Built for 2–10 Year Old Early Education</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            The Joyful SaaS Platform for Small Schools & Growing Minds.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Eliminate traditional ERP complexity. Deliver seamless school administration, mobile parent connection, and playful child learning.
          </p>

          <div className="pt-4 grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-skybrand-400 shrink-0" />
              <span>Multi-School Architecture with strict tenant isolation</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Role-Based Access Control: School Admin, Teacher, Parent & Kid</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <HeartHandshake className="w-4 h-4 text-skybrand-400 shrink-0" />
              <span>Mobile-first parent engagement & safe Kid Mode sandbox</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © {new Date().getFullYear()} EduKadence Inc. All rights reserved.
        </div>
      </div>

      {/* Right Authentication Form Column */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-8">
            <EduKadenceLogo className="h-8" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
