'use client';

import React, { useState } from 'react';
import { Submission, VivaSession } from '@/lib/types';
import { SAMPLE_SUBMISSION, SAMPLE_ASSIGNMENT, SAMPLE_COMPLETED_VIVA, SAMPLE_COURSES } from '@/lib/demo-data';
import { FileUploadModal } from './FileUploadModal';
import { LiveVivaRoom } from './LiveVivaRoom';
import { StudentResultsView } from './StudentResultsView';
import {
  Upload,
  Mic,
  FileText,
  Clock,
  CheckCircle2,
  Award,
  BookOpen,
  ArrowRight,
  Plus,
  Play,
  Share2,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([SAMPLE_SUBMISSION]);
  const [activeSession, setActiveSession] = useState<VivaSession | null>(SAMPLE_COMPLETED_VIVA);
  const [currentView, setCurrentView] = useState<'overview' | 'viva_room' | 'results'>('overview');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedSubForViva, setSelectedSubForViva] = useState<Submission>(SAMPLE_SUBMISSION);

  const handleStartVivaForSub = (sub: Submission) => {
    setSelectedSubForViva(sub);
    setCurrentView('viva_room');
  };

  const handleVivaComplete = (completedSession: VivaSession) => {
    setActiveSession(completedSession);
    setCurrentView('results');
  };

  const handleSubmissionCreated = (newSub: Submission) => {
    setSubmissions([newSub, ...submissions]);
    setSelectedSubForViva(newSub);
    setCurrentView('viva_room');
  };

  if (currentView === 'viva_room') {
    return (
      <LiveVivaRoom
        submission={selectedSubForViva}
        onVivaComplete={handleVivaComplete}
        onCancel={() => setCurrentView('overview')}
      />
    );
  }

  if (currentView === 'results' && activeSession) {
    return (
      <StudentResultsView
        session={activeSession}
        onBackToDashboard={() => setCurrentView('overview')}
        onRetakeViva={() => handleStartVivaForSub(selectedSubForViva)}
      />
    );
  }

  const kMap = SAMPLE_SUBMISSION.knowledgeMap;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 bg-slate-50 min-h-screen text-slate-900">
      {/* 1. GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-extrabold text-3xl text-slate-900 tracking-tight">Good morning, Alex.</h1>
          <p className="text-sm text-slate-600 mt-1">Here’s what's happening with your academic defenses.</p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Submission</span>
        </button>
      </div>

      {/* 2. NEXT DEFENSE CARD (EDITORIAL LEFT-BORDER HIGHLIGHT) */}
      <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-indigo-600 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider font-mono">
              <span>Machine Learning &bull; CS 401</span>
              <span>&bull; Oral Defense scheduled</span>
            </div>

            <h3 className="font-bold text-xl text-slate-900">
              Ensemble Learning for High-Frequency Financial Fraud Detection
            </h3>

            <p className="text-xs text-slate-600">
              Paper processed into Knowledge Map &bull; 6 Grounded Questions &bull; 5 Minutes Duration
            </p>
          </div>

          <button
            onClick={() => handleStartVivaForSub(SAMPLE_SUBMISSION)}
            className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Prepare & Start Viva</span>
          </button>
        </div>
      </div>

      {/* 3. COURSE CARDS GRID */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg text-slate-900">Enrolled Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_COURSES.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors space-y-3">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-indigo-600">{c.code}</span>
                <span className="text-slate-500">Defense avg: {c.avgDefenseScore}%</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
              <p className="text-xs text-slate-500">{c.professorName}</p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-indigo-600 font-semibold">
                <span>3 assignments &bull; 1 viva</span>
                <span className="flex items-center gap-1 hover:underline cursor-pointer">
                  View course &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. ACADEMIC KNOWLEDGE MAP TREE */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Submission Knowledge Graph</h3>
            <p className="text-xs text-slate-500">Document Grounding Structure &bull; {kMap.topic}</p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-600">
            6 Extracted Concepts
          </span>
        </div>

        {/* Clean Concept Canvas with connector lines */}
        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-700">
          <div className="text-indigo-700 font-bold text-sm mb-4">
            [ROOT] {kMap.topic}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-indigo-600">Claims & Thesis</span>
              <p className="text-xs text-slate-800 font-sans">{kMap.mainClaims[0]}</p>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-blue-600">Methodology</span>
              <p className="text-xs text-slate-800 font-sans">{kMap.methodology.approach}</p>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-600">Results SLA</span>
              <p className="text-xs text-slate-800 font-sans">91.4% Accuracy &bull; 14.2ms Latency</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SUBMISSION HISTORY TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-6">
        <h2 className="font-bold text-lg text-slate-900">Submission Defense History</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-mono tracking-wider">
                <th className="py-3 px-4">Submission</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{sub.assignmentTitle}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{sub.courseName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{sub.submittedAt}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {activeSession ? `${activeSession.overallScore} / 100` : 'Pending'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[11px]">
                      Strong Defense
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {sub.status === 'viva_completed' && activeSession ? (
                      <button
                        onClick={() => setCurrentView('results')}
                        className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                      >
                        View Report
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartVivaForSub(sub)}
                        className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                      >
                        Start Viva
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmissionCreated={handleSubmissionCreated}
      />
    </div>
  );
};
