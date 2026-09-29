'use client';

import React, { useState } from 'react';
import { UserRole } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { LandingPage } from '@/components/LandingPage';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { ProfessorDashboard } from '@/components/professor/ProfessorDashboard';
import { ShieldCheck } from 'lucide-react';

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [activeView, setActiveView] = useState<'landing' | 'dashboard' | 'viva_room' | 'results' | 'report'>('landing');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <main className="flex-1">
        {activeView === 'landing' && (
          <LandingPage
            onStartViva={() => {
              setCurrentRole('student');
              setActiveView('dashboard');
            }}
            onOpenProfessorDashboard={() => {
              setCurrentRole('professor');
              setActiveView('dashboard');
            }}
            onRoleChange={(role) => setCurrentRole(role)}
          />
        )}

        {activeView !== 'landing' && (
          <>
            {currentRole === 'student' ? (
              <StudentDashboard />
            ) : (
              <ProfessorDashboard />
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">VivaGuard Platform</span>
            <span>&bull; Academic Integrity & Oral Defense</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span className="hover:text-slate-900 cursor-pointer">FERPA Compliant</span>
            <span>&bull;</span>
            <span className="hover:text-slate-900 cursor-pointer">Institutional Encryption</span>
            <span>&bull;</span>
            <span className="hover:text-slate-900 cursor-pointer">Faculty Review</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
