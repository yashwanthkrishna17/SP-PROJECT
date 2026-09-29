import { GroundedQuestion, StudentAnswer, DefenseBreakdown, AcademicIntegrityIndicators } from './types';

export interface VivaState {
  currentQuestionIndex: number;
  questions: GroundedQuestion[];
  answers: StudentAnswer[];
  isListening: boolean;
  isSpeaking: boolean;
  isEvaluating: boolean;
  timeLeftSeconds: number;
  currentTranscript: string;
  adaptiveFollowUp?: string;
  isCompleted: boolean;
}

// Web Speech API interface declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function evaluateStudentResponse(
  question: GroundedQuestion,
  userAnswerText: string
): {
  score: number;
  evaluation: 'excellent' | 'good' | 'partial' | 'inaccurate' | 'unanswered';
  aiFeedback: string;
  followUpAsked?: string;
} {
  const text = userAnswerText.trim().toLowerCase();

  if (!text || text.length < 5 || text.includes("i don't know") || text.includes("im not sure") || text.includes("no idea")) {
    return {
      score: 30,
      evaluation: 'unanswered',
      aiFeedback: 'Student indicated uncertainty or gave a minimal non-substantive answer.',
      followUpAsked: 'That is alright. Let us move to the next area of your submission.',
    };
  }

  // Count matching expected concepts
  let matchedConcepts = 0;
  question.expectedConcepts.forEach((concept) => {
    const words = concept.toLowerCase().split(' ');
    const match = words.some((w) => w.length > 3 && text.includes(w));
    if (match) matchedConcepts++;
  });

  const matchRatio = matchedConcepts / Math.max(1, question.expectedConcepts.length);

  if (matchRatio >= 0.7 || text.length > 120) {
    return {
      score: Math.min(100, Math.floor(88 + Math.random() * 10)),
      evaluation: 'excellent',
      aiFeedback: `Excellent defense. Student clearly explained ${question.concept} and covered key expected concepts.`,
      followUpAsked: `Good answer. Let us go one step deeper into your methodology.`,
    };
  } else if (matchRatio >= 0.4 || text.length > 60) {
    return {
      score: Math.floor(75 + Math.random() * 10),
      evaluation: 'good',
      aiFeedback: `Solid understanding demonstrated for ${question.concept}, though could elaborate further on specific assumptions.`,
      followUpAsked: `Can you be more specific about how this relates to the results in your paper?`,
    };
  } else {
    return {
      score: Math.floor(55 + Math.random() * 15),
      evaluation: 'partial',
      aiFeedback: `Partial understanding. Student mentioned general terms but omitted key mechanisms referenced in Section 3 of their submission.`,
      followUpAsked: `You mentioned general concepts, but why specifically did you choose this in your paper?`,
    };
  }
}

export function calculateDefenseScore(answers: StudentAnswer[]): {
  overallScore: number;
  breakdown: DefenseBreakdown;
  indicators: AcademicIntegrityIndicators;
} {
  if (answers.length === 0) {
    return {
      overallScore: 0,
      breakdown: {
        conceptualUnderstanding: 0,
        methodologyUnderstanding: 0,
        reasoning: 0,
        criticalThinking: 0,
        submissionFamiliarity: 0,
        communication: 0,
      },
      indicators: {
        understandingLevel: 'Inconsistent',
        methodologyFamiliarity: 'Weak',
        citationUnderstanding: 'Weak',
        potentialConcernsCount: 0,
        concernFlags: [],
      },
    };
  }

  const avgScore = answers.reduce((acc, a) => acc + a.score, 0) / answers.length;
  const roundedOverall = Math.round(avgScore);

  const breakdown: DefenseBreakdown = {
    conceptualUnderstanding: Math.min(100, Math.round(avgScore * 1.05)),
    methodologyUnderstanding: Math.min(100, Math.round(avgScore * 0.98)),
    reasoning: Math.min(100, Math.round(avgScore * 0.95)),
    criticalThinking: Math.min(100, Math.round(avgScore * 0.91)),
    submissionFamiliarity: Math.min(100, Math.round(avgScore * 1.02)),
    communication: Math.min(100, Math.round(avgScore * 1.08)),
  };

  const partialOrUnanswered = answers.filter((a) => a.evaluation === 'partial' || a.evaluation === 'unanswered');

  const concernFlags = partialOrUnanswered.map((a) => ({
    severity: 'warning' as const,
    message: `Student struggled to explain ${a.concept} in detail during oral questioning.`,
    sourceSection: a.sourceReference || 'Submission Document',
  }));

  const indicators: AcademicIntegrityIndicators = {
    understandingLevel: roundedOverall >= 80 ? 'Strong' : roundedOverall >= 65 ? 'Moderate' : 'Inconsistent',
    methodologyFamiliarity: breakdown.methodologyUnderstanding >= 75 ? 'Strong' : 'Moderate',
    citationUnderstanding: breakdown.conceptualUnderstanding >= 75 ? 'Strong' : 'Moderate',
    potentialConcernsCount: concernFlags.length,
    concernFlags,
  };

  return {
    overallScore: roundedOverall,
    breakdown,
    indicators,
  };
}

// Browser Text-to-Speech Helper
export function speakText(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel(); // Stop any active speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';

  // Try to pick a clear natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'));
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}
