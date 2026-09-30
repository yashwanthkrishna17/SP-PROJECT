'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GroundedQuestion, StudentAnswer, VivaSession, Submission } from '@/lib/types';
import { evaluateStudentResponse, calculateDefenseScore, speakText } from '@/lib/viva-engine';
import { generateGroundedQuestionsFromMap } from '@/lib/knowledge-map-extractor';
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
  // Dynamically generate grounded viva questions from the submission's knowledge map!
  const questionsToAsk = useMemo(() => {
    if (submission?.knowledgeMap) {
      const generated = generateGroundedQuestionsFromMap(submission.knowledgeMap);
      if (generated && generated.length > 0) {
        return generated;
      }
    }
    return SAMPLE_QUESTIONS_RF;
  }, [submission]);

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
  const currentQ = questionsToAsk[currentIndex] || questionsToAsk[0];

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
  }, [currentIndex, activeFollowUp, soundEnabled, currentQ]);

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
    const concept = currentQ?.concept || 'this domain concept';
    const snippet = currentQ?.paperSnippet || 'our submission methodology';
    if (presetType === 'strong') {
      setCurrentSpeechText(
        `Based on Section 2 of our submission, we addressed ${concept} through ${snippet}. This balances operational efficiency with theoretical bounds, ensuring consistent reliability during peak stress loads.`
      );
    } else if (presetType === 'vague') {
      setCurrentSpeechText(
        `We implemented a standard operational approach for ${concept} to ensure the overall system remains reliable and meets baseline requirements.`
      );
    } else {
      setCurrentSpeechText(
        `I understand the general concept of ${concept}, but I would need to review our exact mathematical parameters for the precise equation.`
      );
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
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                  <span>Listening to your oral defense...</span>
                </div>
              ) : isSpeakingAI ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Examiner speaking question aloud...</span>
                </div>
              ) : isEvaluating ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-spin" />
                  <span>Evaluating answer against grounded source evidence...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Awaiting your answer. Use voice recording or manual text.</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: STUDENT PROFILE */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Candidate Information
            </span>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{submission.studentName}</h3>
                <p className="text-xs text-slate-500 font-mono">{submission.courseName}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Document Grounding
              </span>
              <p className="text-xs text-slate-700 font-medium">
                📄 {submission.fileName} ({submission.fileType.toUpperCase()})
              </p>
            </div>
          </div>
        </div>

        {/* ACTIVE QUESTION PANEL */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-indigo-600 tracking-wider">
              Question {currentIndex + 1} of {questionsToAsk.length} &bull; {currentQ?.concept}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-semibold uppercase">
                Difficulty: {currentQ?.difficulty}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-mono font-semibold uppercase">
                {currentQ?.type}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-1">
              Document Reference: {currentQ?.sourceLocation}
            </span>
            <h3 className="font-bold text-lg text-slate-900 leading-snug">
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
                <span className="text-[10px] text-slate-400 font-mono">Simulate:</span>
                <button
                  type="button"
                  onClick={() => handleSimulatedAnswer('strong')}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-indigo-700 font-semibold"
                >
                  Strong
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatedAnswer('vague')}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Vague
                </button>
                <button
                  type="button"
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
