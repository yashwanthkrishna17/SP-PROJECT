'use client';

import React, { useState } from 'react';
import { Assignment, VivaSettings, QuestionType, DifficultyLevel } from '@/lib/types';
import { SAMPLE_ASSIGNMENT } from '@/lib/demo-data';
import { X, Sparkles, Sliders, CheckCircle2, Clock, HelpCircle } from 'lucide-react';

interface AssignmentCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentCreated: (asg: Assignment) => void;
}

export const AssignmentCreatorModal: React.FC<AssignmentCreatorModalProps> = ({
  isOpen,
  onClose,
  onAssignmentCreated,
}) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [duration, setDuration] = useState<number>(5);
  const [questionCount, setQuestionCount] = useState<number>(8);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [allowFollowUps, setAllowFollowUps] = useState(true);
  const [requireMic, setRequireMic] = useState(true);
  const [showResultsImmediately, setShowResultsImmediately] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'understanding',
    'methodology',
    'defense',
    'application',
    'critical_thinking',
    'citation',
    'deep_dive',
  ]);

  if (!isOpen) return null;

  const toggleQuestionType = (type: QuestionType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSaveAssignment = () => {
    const newAsg: Assignment = {
      id: `asg_${Date.now()}`,
      courseId: 'course_101',
      courseName: 'CS 401: Advanced Machine Learning',
      title: title || 'New Research Defense Assignment',
      description: 'Custom viva oral defense configured by course professor.',
      dueDate: '2026-09-05',
      instructions: instructions || 'Submit your paper PDF/DOCX for AI oral defense.',
      rubric: 'Methodology rigor 30%, Defense 40%, Familiarity 30%',
      vivaSettings: {
        durationMinutes: duration,
        questionCount: questionCount,
        difficulty: difficulty,
        enabledQuestionTypes: selectedTypes,
        allowFollowUps,
        requireMic,
        showResultsImmediately,
      },
    };

    onAssignmentCreated(newAsg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-700/80 p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-white">Configure AI Oral Defense</h3>
            <p className="text-xs text-slate-400">CS 401: Advanced Machine Learning</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Assignment Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Learning Transformer Defense"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Viva Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:outline-none"
              >
                <option value={3}>3 Minutes (Short)</option>
                <option value={5}>5 Minutes (Standard)</option>
                <option value={8}>8 Minutes (Extended)</option>
                <option value={10}>10 Minutes (Comprehensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Question Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:outline-none"
              >
                <option value={5}>5 Questions</option>
                <option value={8}>8 Questions</option>
                <option value={12}>12 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Difficulty Target
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium (Adaptive)</option>
                <option value="hard">Hard (Strict)</option>
              </select>
            </div>
          </div>

          {/* Enabled Question Types */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Select Question Types to Include
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'understanding', label: 'Understanding' },
                { type: 'methodology', label: 'Methodology' },
                { type: 'defense', label: 'Defense' },
                { type: 'application', label: 'Application' },
                { type: 'critical_thinking', label: 'Critical Thinking' },
                { type: 'citation', label: 'Citation Grounding' },
                { type: 'deep_dive', label: 'Deep Dive' },
                { type: 'contradiction', label: 'Contradiction' },
              ].map((q) => {
                const isSel = selectedTypes.includes(q.type as QuestionType);
                return (
                  <button
                    key={q.type}
                    type="button"
                    onClick={() => toggleQuestionType(q.type as QuestionType)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                      isSel
                        ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {isSel ? '✓ ' : '+ '} {q.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 p-3 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={allowFollowUps}
                onChange={(e) => setAllowFollowUps(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-500"
              />
              <span>Adaptive Follow-ups</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 p-3 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={requireMic}
                onChange={(e) => setRequireMic(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-500"
              />
              <span>Require Microphone</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 p-3 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={showResultsImmediately}
                onChange={(e) => setShowResultsImmediately(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-500"
              />
              <span>Show Results Immediately</span>
            </label>
          </div>

          <button
            onClick={handleSaveAssignment}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all mt-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create & Publish Viva Defense</span>
          </button>
        </div>
      </div>
    </div>
  );
};
