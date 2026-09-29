'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GroundedQuestion, StudentAnswer, VivaSession, Submission } from '@/lib/types';
import { evaluateStudentResponse, calculateDefenseScore, speakText } from '@/lib/viva-engine';
import { SAMPLE_QUESTIONS_RF } from '@/lib/demo-data';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  Send,
  ShieldCheck,
  ChevronRight,
  User,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveVivaRoomProps {
  submission: Submission;
  onVivaComplete: (completedSession: VivaSession) => void;
  onCancel: () => void;
}

export const LiveVivaRoom: React.FC<LiveVivaRoomProps> = ({
  submission,
  onVivaComplete,
  onCancel,
}) => {
  const questionsToAsk = SAMPLE_QUESTIONS_RF;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  const [currentSpeechText, setCurrentSpeechText] = useState('');
  const [manualText, setManualText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const recognitionRef = useRef<any>(null);
  const currentQ = questionsToAsk[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishVivaSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentQ) return;
    const promptText = activeFollowUp || currentQ.question;
    setIsSpeakingAI(true);
    if (soundEnabled) {
      speakText(promptText, () => setIsSpeakingAI(false));
    } else {
      setIsSpeakingAI(false);
    }
  }, [currentIndex, activeFollowUp, soundEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setCurrentSpeechText(transcript);
        };

        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not active in this browser. Please use text response input below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setCurrentSpeechText('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSimulatedAnswer = (presetType: 'strong' | 'vague' | 'dont_know') => {
    if (presetType === 'strong') {
      setCurrentSpeechText(
        `Based on Section 3 of my paper, combining decorrelated decision trees reduces prediction variance because individual tree errors cancel out when averaged. We set max features to sqrt(p) to enforce decorrelation.`
      );
    } else if (presetType === 'vague') {
      setCurrentSpeechText(`Because we used 100 trees and averaged them together to make predictions more stable.`);
    } else {
      setCurrentSpeechText(`I am not entirely sure about the exact mathematical formula for this hyperparameter.`);
    }
  };

  const handleSubmitAnswer = () => {
    const textToSubmit = currentSpeechText.trim() || manualText.trim();
    if (!textToSubmit) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsEvaluating(true);

    setTimeout(() => {
      const evalResult = evaluateStudentResponse(currentQ, textToSubmit);

      const newAns: StudentAnswer = {
        id: `ans_${Date.now()}`,
        questionId: currentQ.id,
        questionText: currentQ.question,
        concept: currentQ.concept,
        transcript: textToSubmit,
        audioDurationSec: Math.floor(12 + Math.random() * 15),
        score: evalResult.score,
        evaluation: evalResult.evaluation,
        aiFeedback: evalResult.aiFeedback,
        sourceReference: currentQ.sourceLocation,
        followUpAsked: evalResult.followUpAsked,
      };

      const updatedAnswers = [...answers, newAns];
      setAnswers(updatedAnswers);

      setCurrentSpeechText('');
      setManualText('');
      setIsEvaluating(false);

      if (currentIndex + 1 < questionsToAsk.length) {
        setActiveFollowUp(evalResult.followUpAsked || null);
        setCurrentIndex((prev) => prev + 1);
      } else {
        finishVivaSession(updatedAnswers);
      }
    }, 1000);
  };

  const finishVivaSession = (finalAnswers = answers) => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    const { overallScore, breakdown, indicators } = calculateDefenseScore(finalAnswers);

    const completedSession: VivaSession = {
      id: `viva_${Date.now()}`,
      submissionId: submission.id,
      assignmentTitle: submission.assignmentTitle,
      studentId: submission.studentId,
      studentName: submission.studentName,
      courseName: submission.courseName,
      startTime: new Date().toLocaleString(),
      endTime: new Date().toLocaleString(),
      overallScore,
      breakdown,
      integrityIndicators: indicators,
      status: 'completed',
      currentQuestionIndex: questionsToAsk.length,
      questions: questionsToAsk,
      answers: finalAnswers,
    };

    onVivaComplete(completedSession);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-slate-50 min-h-screen text-slate-900 space-y-6">
      {/* VIVA ROOM HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">VivaGuard Examination Room</h2>
            <p className="text-xs text-slate-500 font-mono">{submission.assignmentTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
            title="Toggle Examiner Voice"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{formatTime(timeLeft)} remaining</span>
          </div>

          <button
            onClick={onCancel}
            className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            End Viva
          </button>
        </div>
      </div>

      {/* SPLIT ENVIRONMENT CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 p-6 gap-6">
          {/* LEFT: EXAMINER PROFILE */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              AI Examiner Profile
            </span>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-lg">
                VG
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Dr. VivaGuard</h3>
                <p className="text-xs text-slate-500">Senior Academic Examiner</p>
              </div>
            </div>

            {/* Status State Indicator */}
            <div className="pt-2">
              {isListening ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                  <span>Listening to student voice...</span>
                  <div className="subtle-wave ml-auto">
                    <div className="subtle-wave-bar" />
                    <div className="subtle-wave-bar" />
                    <div className="subtle-wave-bar" />
                    <div className="subtle-wave-bar" />
                  </div>
                </div>
              ) : isEvaluating ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-ping" />
                  <span>Evaluating answer against paper context...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Ready for answer</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DEFENSE PROGRESS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Defense Progress
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                Question {currentIndex + 1} of {questionsToAsk.length}
              </span>
            </div>

            {/* Step Dots */}
            <div className="flex items-center gap-2 pt-1">
              {questionsToAsk.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx < currentIndex
                      ? 'bg-emerald-600'
                      : idx === currentIndex
                      ? 'bg-indigo-600 ring-2 ring-indigo-200'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <div className="pt-2 text-xs text-slate-600 font-mono space-y-1">
              <p>Current concept: <strong className="text-slate-900">{currentQ?.concept}</strong></p>
              <p>Difficulty: <strong className="text-slate-900 capitalize">{currentQ?.difficulty}</strong></p>
            </div>
          </div>
        </div>

        {/* BOTTOM: QUESTION & ANSWER PANEL */}
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase text-indigo-600">
                QUESTION {currentIndex + 1} &bull; {currentQ?.type.replace('_', ' ')}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Grounding: {currentQ?.sourceLocation}
              </span>
            </div>

            <h3 className="font-bold text-xl text-slate-900 leading-snug">
              "{currentQ?.question}"
            </h3>

            {activeFollowUp && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
                <strong>Follow-up Context:</strong> "{activeFollowUp}"
              </div>
            )}
          </div>

          {/* Student Response Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Your Answer
              </label>

              {/* Test Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-mono">Presets:</span>
                <button
                  onClick={() => handleSimulatedAnswer('strong')}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-indigo-700 font-semibold"
                >
                  Strong
                </button>
                <button
                  onClick={() => handleSimulatedAnswer('vague')}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Vague
                </button>
                <button
                  onClick={() => handleSimulatedAnswer('dont_know')}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Uncertain
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={currentSpeechText || manualText}
              onChange={(e) => {
                setCurrentSpeechText('');
                setManualText(e.target.value);
              }}
              placeholder={isListening ? 'Speak now... Your answer will be transcribed automatically.' : 'Click microphone or type your answer here...'}
              className="w-full p-3.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 font-sans"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              onClick={toggleListening}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors ${
                isListening
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-600" />}
              <span>{isListening ? 'Stop Recording' : 'Record Answer with Mic'}</span>
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={isEvaluating || (!currentSpeechText.trim() && !manualText.trim())}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              <span>{isEvaluating ? 'Evaluating Answer...' : 'Finish & Submit Answer'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
