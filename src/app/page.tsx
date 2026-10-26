'use client';

import React, { useState } from 'react';
import { UserRole } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { LandingPage } from '@/components/LandingPage';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { ProfessorDashboard } from '@/components/professor/ProfessorDashboard';
import { PlagiarismDetectorView } from '@/components/plagiarism/PlagiarismDetectorView';
import { ShieldCheck } from 'lucide-react';

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>('professor');
  const [activeView, setActiveView] = useState<'landing' | 'dashboard' | 'viva_room' | 'results' | 'report' | 'plagiarism'>('plagiarism');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <main className="flex-1">
        {activeView === 'plagiarism' && (
          <PlagiarismDetectorView />
        )}

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

        {activeView !== 'landing' && activeView !== 'plagiarism' && (
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
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">VivaGuard &amp; Plagiarism AI</span>
            <span>&bull; Peer-to-Peer Document Similarity Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span className="hover:text-slate-900 cursor-pointer">Optical Character Recognition</span>
            <span>&bull;</span>
            <span className="hover:text-slate-900 cursor-pointer">TF-IDF Vector Space</span>
            <span>&bull;</span>
            <span className="hover:text-slate-900 cursor-pointer">FastAPI + Next.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
