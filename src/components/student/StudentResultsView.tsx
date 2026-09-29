'use client';

import React from 'react';
import { VivaSession } from '@/lib/types';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  Check,
} from 'lucide-react';

interface StudentResultsViewProps {
  session: VivaSession;
  onBackToDashboard: () => void;
  onRetakeViva?: () => void;
}

export const StudentResultsView: React.FC<StudentResultsViewProps> = ({
  session,
  onBackToDashboard,
  onRetakeViva,
}) => {
  const score = session.overallScore || 82;
  const breakdown = session.breakdown || {
    conceptualUnderstanding: 91,
    methodologyUnderstanding: 84,
    reasoning: 79,
    criticalThinking: 73,
    submissionFamiliarity: 88,
    communication: 90,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-slate-50 min-h-screen text-slate-900">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {onRetakeViva && (
          <button
            onClick={onRetakeViva}
            className="px-3.5 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Viva Practice</span>
          </button>
        )}
      </div>

      {/* 1. REPORT HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-mono font-bold uppercase text-indigo-600 tracking-wider">
            Defense Assessment
          </span>
          <h1 className="font-extrabold text-3xl text-slate-900 mt-1">
            {session.assignmentTitle}
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {session.courseName} &bull; {session.studentName} &bull; {session.endTime}
          </p>
        </div>

        {/* Large Typographic Score with Thin Progress Indicator */}
        <div className="flex items-baseline gap-4 pt-2">
          <span className="font-extrabold text-7xl text-slate-900 tracking-tight font-sans">
            {score}
          </span>
          <div>
            <span className="px-3 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 uppercase tracking-wider block">
              Strong Defense
            </span>
            <span className="text-xs text-slate-500 font-mono mt-1 block">Pass Threshold: 65%</span>
          </div>
        </div>

        {/* Thin horizontal progress line */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* 2. SIX UNDERSTANDING DIMENSIONS */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Understanding Dimensions</h3>

        <div className="space-y-3">
          {[
            { label: 'Conceptual Understanding', val: breakdown.conceptualUnderstanding, desc: 'Mastery of underlying domain theories.' },
            { label: 'Methodology Understanding', val: breakdown.methodologyUnderstanding, desc: 'Familiarity with experimental setup & models.' },
            { label: 'Reasoning Ability', val: breakdown.reasoning, desc: 'Coherence in defending hyperparameter choices.' },
            { label: 'Critical Thinking', val: breakdown.criticalThinking, desc: 'Awareness of limitations and zero-day risks.' },
            { label: 'Submission Familiarity', val: breakdown.submissionFamiliarity, desc: 'Grounding in student’s own paper sections.' },
            { label: 'Communication Clarity', val: breakdown.communication, desc: 'Conciseness and clarity during oral examination.' },
          ].map((dim, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">{dim.label}</span>
                <span className="font-mono font-bold text-indigo-600">{dim.val}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${dim.val}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">{dim.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. EDITORIAL FEEDBACK SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-sm text-emerald-700">What you demonstrated</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Strong understanding of model selection and dataset preparation. Articulated error cancellation through decision tree averaging.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-sm text-amber-700">Where you can improve</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your explanation of variance reduction was correct but lacked detailed discussion of feature subspacing decorrelation.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-sm text-slate-700">Questions that challenged you</h4>
          <ul className="text-xs text-slate-600 space-y-1 font-mono">
            <li>• Q3 &bull; Gini Impurity calculation</li>
            <li>• Q6 &bull; Zero-Day Fraud limitations</li>
          </ul>
        </div>
      </div>

      {/* 4. ITEMIZE QUESTION REVIEW */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Question Itemized Review</h3>

        <div className="divide-y divide-slate-100">
          {session.answers.map((ans, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-900">Question {idx + 1}: {ans.concept}</span>
                <p className="text-slate-500 font-mono text-[11px]">"{ans.questionText.slice(0, 70)}..."</p>
              </div>
              <span className="font-mono font-bold text-slate-900 shrink-0 ml-4">{ans.score}/100</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
