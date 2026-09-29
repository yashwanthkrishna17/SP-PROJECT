'use client';

import React from 'react';
import { UserRole } from '@/lib/types';
import {
  ShieldCheck,
  Mic,
  Brain,
  FileText,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Lock,
  BarChart3,
  Award,
  Layers,
} from 'lucide-react';

interface LandingPageProps {
  onStartViva: () => void;
  onOpenProfessorDashboard: () => void;
  onRoleChange: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartViva,
  onOpenProfessorDashboard,
  onRoleChange,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 space-y-24">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="pt-16 lg:pt-24 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wider uppercase">
              Academic Integrity / AI Assessment
            </div>

            <h1 className="font-extrabold text-4xl sm:text-6xl lg:text-6xl tracking-tight leading-[1.15] text-slate-900">
              Don't just detect AI. <br />
              <span className="text-indigo-600 font-extrabold">Test genuine understanding.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
              VivaGuard conducts adaptive oral defenses grounded directly in the student's actual academic submission to evaluate authentic comprehension.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  onRoleChange('student');
                  onStartViva();
                }}
                className="px-6 py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
              >
                <span>Start a Viva Defense</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  onRoleChange('professor');
                  onOpenProfessorDashboard();
                }}
                className="px-6 py-3.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200 shadow-sm transition-colors"
              >
                For Universities & Faculty
              </button>
            </div>
          </div>

          {/* Hero Right Column: Refined Live Examination Preview Card */}
          <div className="lg:col-span-5">
            <div className="editorial-card p-6 border border-slate-200 shadow-subtle relative bg-white rounded-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Live Defense Simulation
                </span>
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  04:32 remaining
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">
                  AI Examiner (Dr. VivaGuard)
                </p>
                <p className="text-sm font-medium text-slate-800 italic">
                  "Your paper states that random forests reduce variance. Can you explain why averaging multiple trees accomplishes this?"
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Student Spoken Response</span>
                    <p className="text-xs font-medium text-slate-700">
                      "Because individual tree errors cancel out when averaged..."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="editorial-card p-8 lg:p-12 bg-white border border-slate-200 rounded-xl">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-2 font-mono">
              Built for Academic Integrity
            </span>
            <h2 className="font-extrabold text-3xl text-slate-900 mb-3">
              Evidence over assumptions.
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              VivaGuard does not decide whether a student cheated. It helps faculty gather empirical evidence about whether students understand the work they submitted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">Grounded in Submission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Questions come directly from the student's submitted equations, citations, and methodology.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">Adaptive Follow-ups</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Questions dynamically adjust based on the student's spoken responses to probe depth of knowledge.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">Evidence-Based Reports</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Faculty receive grounded transcript explanations and source page references rather than arbitrary scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FIVE-STEP EDITORIAL PRODUCT TIMELINE */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="mb-10 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Process Architecture
          </span>
          <h2 className="font-bold text-2xl text-slate-900 mt-1">Five-Step Viva Protocol</h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            {
              step: '01',
              title: 'Upload',
              color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
              desc: 'Student uploads paper PDF, DOCX, or TXT submission.',
            },
            {
              step: '02',
              title: 'Understand',
              color: 'text-blue-600 bg-blue-50 border-blue-200',
              desc: 'AI extracts claims, methodology, and citations into a Knowledge Map.',
            },
            {
              step: '03',
              title: 'Defend',
              color: 'text-purple-600 bg-purple-50 border-purple-200',
              desc: '3–10 minute grounded oral viva with real-time speech transcription.',
            },
            {
              step: '04',
              title: 'Evaluate',
              color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
              desc: 'Multi-dimensional scoring across 6 key understanding parameters.',
            },
            {
              step: '05',
              title: 'Review',
              color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              desc: 'Faculty inspects grounded evidence transcripts and sets overrides.',
            },
          ].map((item, idx) => (
            <div key={idx} className="editorial-card p-5 bg-white border border-slate-200 rounded-xl space-y-3">
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${item.color}`}>
                {item.step}
              </span>
              <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FACULTY GOVERNANCE SECTION */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-8 lg:p-12 text-left">
          <div className="max-w-3xl">
            <h2 className="font-bold text-2xl text-slate-900 mb-3">Designed for Major Universities</h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              VivaGuard meets institutional compliance guidelines. Submissions remain encrypted, FERPA-compliant, and are never shared for public model training without institutional permission.
            </p>
            <div className="flex flex-wrap gap-6 text-xs text-slate-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-600" /> Institutional Encryption
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Human-in-the-Loop Override
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Non-Accusatory Framework
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
