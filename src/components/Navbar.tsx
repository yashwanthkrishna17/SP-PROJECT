'use client';

import React from 'react';
import { UserRole } from '@/lib/types';
import { CURRENT_USER_STUDENT, CURRENT_USER_PROFESSOR } from '@/lib/demo-data';
import { Shield, Scan, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeView: 'landing' | 'dashboard' | 'viva_room' | 'results' | 'report' | 'plagiarism';
  setActiveView: (view: 'landing' | 'dashboard' | 'viva_room' | 'results' | 'report' | 'plagiarism') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeView,
  setActiveView,
}) => {
  const activeUser = currentRole === 'student' ? CURRENT_USER_STUDENT : CURRENT_USER_PROFESSOR;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveView('plagiarism')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-indigo-700 transition-colors">
            <Shield className="w-4 h-4 fill-current text-indigo-100" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">
              VivaGuard
            </span>
            <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
              Plagiarism AI
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveView('plagiarism')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeView === 'plagiarism'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Plagiarism Detector</span>
          </button>

          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeView === 'dashboard' || activeView === 'results' || activeView === 'report'
                ? 'bg-slate-100 text-indigo-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {currentRole === 'student' ? 'Student Defenses' : 'Faculty Dashboard'}
          </button>

          <button
            onClick={() => setActiveView('landing')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeView === 'landing'
                ? 'bg-slate-100 text-indigo-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Overview
          </button>
        </nav>

        {/* Role Toggle & Profile */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center">
            <button
              onClick={() => {
                onRoleChange('student');
                setActiveView('dashboard');
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                currentRole === 'student'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => {
                onRoleChange('professor');
                setActiveView('dashboard');
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                currentRole === 'professor'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faculty
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600 font-bold text-xs">
              {activeUser.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-semibold text-slate-800">{activeUser.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{activeUser.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
