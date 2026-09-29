'use client';

import React, { useState } from 'react';
import { VivaSession, Submission } from '@/lib/types';
import {
  ShieldCheck,
  ArrowLeft,
  Edit3,
  Save,
  Check,
  FileText,
} from 'lucide-react';

interface SubmissionReportViewProps {
  session: VivaSession;
  submission: Submission;
  onBack: () => void;
}

export const SubmissionReportView: React.FC<SubmissionReportViewProps> = ({
  session,
  submission,
  onBack,
}) => {
  const [overrideScore, setOverrideScore] = useState<number>(
    session.professorAnnotations?.overrideScore || session.overallScore || 84
  );
  const [notes, setNotes] = useState<string>(
    session.professorAnnotations?.notes ||
      'Alex demonstrated impressive mastery over ensemble theory and data preprocessing choices. Viva confirms genuine understanding.'
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveAnnotations = () => {
    session.professorAnnotations = {
      overrideScore,
      notes,
      reviewedAt: new Date().toLocaleString(),
    };
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-slate-50 min-h-screen text-slate-900">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Faculty Dashboard</span>
        </button>

        <span className="text-xs font-mono font-semibold text-slate-600">
          Academic Investigation Report
        </span>
      </div>

      {/* 1. REPORT HEADER SUMMARY CARD */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-indigo-600">
              STUDENT &bull; {session.studentName} ({session.studentId})
            </span>
            <h1 className="font-bold text-2xl text-slate-900 mt-1">
              {session.assignmentTitle}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              File: {submission.fileName} &bull; Completed {session.endTime}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              DEFENSE SCORE
            </span>
            <span className="font-extrabold text-4xl text-slate-900 font-sans">
              {overrideScore}
              <span className="text-sm font-normal text-slate-500">/100</span>
            </span>
          </div>
        </div>

        {/* Faculty Notes & Override Input */}
        <div className="p-4 rounded-lg bg-indigo-50/60 border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Faculty Notes & Assessment Confirmation
            </span>
            {isSaved && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 font-mono">Score Override</label>
              <input
                type="number"
                value={overrideScore}
                onChange={(e) => setOverrideScore(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-900 font-mono font-bold text-xs"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 mb-1 font-mono">Private Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-900 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveAnnotations}
              className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm"
            >
              Confirm Assessment
            </button>
          </div>
        </div>
      </div>

      {/* 2. ITEMIZED QUESTION EVIDENCE LOG */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg text-slate-900">Ground-Truth Evidence Log</h2>

        {session.answers.map((ans, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase">
                QUESTION {idx + 1} &bull; {ans.concept}
              </span>
              <span className="font-mono font-bold text-xs text-slate-900">
                Score: {ans.score}/100
              </span>
            </div>

            <p className="font-bold text-base text-slate-900">"{ans.questionText}"</p>

            <div className="space-y-3 pt-2">
              {/* STUDENT RESPONSE */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-1">
                  STUDENT RESPONSE
                </span>
                <p className="text-xs text-slate-800 italic">"{ans.transcript}"</p>
              </div>

              {/* SOURCE EVIDENCE */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-1">
                  SOURCE EVIDENCE ({ans.sourceReference})
                </span>
                <p className="text-xs text-slate-700 font-mono">
                  "The ensemble combines predictions from multiple decision trees..."
                </p>
              </div>

              {/* AI ASSESSMENT */}
              <div className="bg-indigo-50/50 p-3.5 rounded-lg border border-indigo-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono block mb-1">
                  AI ASSESSMENT RATIONALE
                </span>
                <p className="text-xs text-slate-800 leading-relaxed">{ans.aiFeedback}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
