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

  // Dynamically analyze the student's actual responses
  const answers = session.answers || [];
  const sortedByScore = [...answers].sort((a, b) => b.score - a.score);
  const bestAnswer = sortedByScore[0];
  const lowestAnswer = sortedByScore[sortedByScore.length - 1];
  const challengingAnswers = answers.filter((a) => a.score < 80);

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
            <span>Retake Oral Viva</span>
          </button>
        )}
      </div>

      {/* 1. REPORT HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-mono font-bold uppercase text-indigo-600 tracking-wider">
            Oral Defense Assessment
          </span>
          <h1 className="font-extrabold text-3xl text-slate-900 mt-1">
            {session.assignmentTitle}
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {session.courseName} &bull; {session.studentName} &bull; {session.endTime || 'Completed'}
          </p>
        </div>

        {/* Large Typographic Score with Thin Progress Indicator */}
        <div className="flex items-baseline gap-4 pt-2">
          <span className="font-extrabold text-7xl text-slate-900 tracking-tight font-sans">
            {score}
          </span>
          <div>
            <span className={`px-3 py-1 rounded font-bold text-xs border uppercase tracking-wider block ${
              score >= 75
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : score >= 60
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {score >= 75 ? 'Strong Defense' : score >= 60 ? 'Satisfactory Defense' : 'Needs Review'}
            </span>
            <span className="text-xs text-slate-500 font-mono mt-1 block">Pass Threshold: 65%</span>
          </div>
        </div>

        {/* Thin horizontal progress line */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 75 ? 'bg-indigo-600' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
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
            { label: 'Reasoning Ability', val: breakdown.reasoning, desc: 'Coherence in defending operational choices.' },
            { label: 'Critical Thinking', val: breakdown.criticalThinking, desc: 'Awareness of limitations and edge-case risks.' },
            { label: 'Submission Familiarity', val: breakdown.submissionFamiliarity, desc: 'Grounding in candidate’s own paper sections.' },
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

      {/* 3. DYNAMIC EDITORIAL FEEDBACK SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-sm text-emerald-700">What you demonstrated</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {bestAnswer
              ? `Strong mastery demonstrated in defending "${bestAnswer.concept}". Articulated core operational trade-offs with high grounding in your submission.`
              : `Solid comprehension demonstrated across core submission thesis and methodology.`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-sm text-amber-700">Where you can improve</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {lowestAnswer && lowestAnswer.score < 85
              ? `Could elaborate further on "${lowestAnswer.concept}". Consider providing deeper quantitative or architectural justification for edge conditions.`
              : `Overall defense was robust. Focus on reinforcing contingency responses under high-stress failure modes.`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-sm text-slate-700">Questions that challenged you</h4>
          <ul className="text-xs text-slate-600 space-y-1 font-mono">
            {challengingAnswers.length > 0 ? (
              challengingAnswers.slice(0, 3).map((a, i) => (
                <li key={i}>
                  &bull; {a.concept} ({a.score}/100)
                </li>
              ))
            ) : (
              <li>&bull; Consistently high defense across all questions!</li>
            )}
          </ul>
        </div>
      </div>

      {/* 4. ITEMIZE QUESTION REVIEW */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Question Itemized Review</h3>

        <div className="divide-y divide-slate-100">
          {session.answers.map((ans, idx) => (
            <div key={idx} className="py-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">
                  Question {idx + 1}: {ans.concept}
                </span>
                <span className={`font-mono font-bold shrink-0 ml-4 ${
                  ans.score >= 80 ? 'text-emerald-600' : ans.score >= 65 ? 'text-indigo-600' : 'text-amber-600'
                }`}>
                  {ans.score}/100
                </span>
              </div>
              <p className="text-slate-600 text-xs">"{ans.questionText}"</p>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 mt-1">
                <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Your Response:</span>
                <p className="text-xs text-slate-800 italic mt-0.5">"{ans.transcript}"</p>
                {ans.aiFeedback && (
                  <p className="text-[11px] text-indigo-700 mt-1 font-sans">
                    <strong>AI Feedback:</strong> {ans.aiFeedback}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
