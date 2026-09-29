'use client';

import React, { useState } from 'react';
import { Course, Assignment, VivaSession } from '@/lib/types';
import {
  SAMPLE_COURSES,
  SAMPLE_ASSIGNMENT,
  SAMPLE_COMPLETED_VIVA,
  SAMPLE_SUBMISSION,
  OTHER_STUDENT_SUBMISSIONS,
} from '@/lib/demo-data';
import { AssignmentCreatorModal } from './AssignmentCreatorModal';
import { SubmissionReportView } from './SubmissionReportView';
import {
  BookOpen,
  Users,
  Award,
  AlertTriangle,
  Plus,
  Eye,
  FileText,
} from 'lucide-react';

export const ProfessorDashboard: React.FC = () => {
  const [courses] = useState<Course[]>(SAMPLE_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course>(SAMPLE_COURSES[0]);
  const [assignments, setAssignments] = useState<Assignment[]>([SAMPLE_ASSIGNMENT]);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [selectedSessionForReport, setSelectedSessionForReport] = useState<VivaSession | null>(null);

  const handleAssignmentCreated = (newAsg: Assignment) => {
    setAssignments([newAsg, ...assignments]);
  };

  if (selectedSessionForReport) {
    return (
      <SubmissionReportView
        session={selectedSessionForReport}
        submission={SAMPLE_SUBMISSION}
        onBack={() => setSelectedSessionForReport(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 bg-slate-50 min-h-screen text-slate-900">
      {/* 1. PROFESSOR DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-extrabold text-3xl text-slate-900 tracking-tight">Good morning, Dr. Rostova.</h1>
          <p className="text-sm text-slate-600 mt-1">Your courses at a glance.</p>
        </div>

        <button
          onClick={() => setIsCreatorOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">Students</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">87</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">Assignments</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">12</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">Completed Vivas</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">81</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-mono font-bold text-indigo-600 uppercase">Average Defense</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">76%</p>
        </div>
      </div>

      {/* 3. ATTENTION REQUIRED (RESTRAINED AMBER HIGHLIGHT) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-amber-700 tracking-wider">
              ATTENTION REQUIRED
            </span>
            <h2 className="font-bold text-base text-slate-900 mt-0.5">
              Students whose defenses may benefit from faculty review
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
            3 Flagged Submissions
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {[
            { name: 'Alex Morgan', score: '54%', issue: 'Struggled to explain feature subspacing math on Page 4.' },
            { name: 'Sarah Lee', score: '58%', issue: 'Answer on Gini impurity contradicted submitted formula.' },
            { name: 'Daniel Chen', score: '59%', issue: 'Uncertainty when probed on zero-day fraud limitations.' },
          ].map((st, i) => (
            <div key={i} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-900">{st.name}</span>
                <p className="text-slate-500">{st.issue}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {st.score}
                </span>
                <button
                  onClick={() => setSelectedSessionForReport(SAMPLE_COMPLETED_VIVA)}
                  className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Review</span> &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. RECENT STUDENT VIVA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-lg text-slate-900">Recent Student Examinations</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-mono tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Assignment</th>
                <th className="py-3 px-4">Defense Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-slate-900">Alex Chen</td>
                <td className="py-3 px-4 font-mono text-slate-600">Random Forest Classification</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">84 / 100</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[11px]">
                    Verified Strong
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setSelectedSessionForReport(SAMPLE_COMPLETED_VIVA)}
                    className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    View Report
                  </button>
                </td>
              </tr>

              {OTHER_STUDENT_SUBMISSIONS.map((st, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{st.studentName}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{st.assignmentTitle}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{st.score} / 100</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200 text-[11px]">
                      {st.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedSessionForReport(SAMPLE_COMPLETED_VIVA)}
                      className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssignmentCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onAssignmentCreated={handleAssignmentCreated}
      />
    </div>
  );
};
