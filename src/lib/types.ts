export type UserRole = 'student' | 'professor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  institution?: string;
}

export type QuestionType =
  | 'understanding'
  | 'methodology'
  | 'defense'
  | 'application'
  | 'critical_thinking'
  | 'citation'
  | 'deep_dive'
  | 'contradiction';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface VivaSettings {
  durationMinutes: number; // e.g. 5
  questionCount: number; // e.g. 8
  difficulty: DifficultyLevel;
  enabledQuestionTypes: QuestionType[];
  allowFollowUps: boolean;
  requireMic: boolean;
  showResultsImmediately: boolean;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string;
  instructions: string;
  rubric: string;
  vivaSettings: VivaSettings;
}

export interface KnowledgeNode {
  id: string;
  title: string;
  type: 'topic' | 'claim' | 'methodology' | 'result' | 'concept' | 'citation' | 'limitation';
  details?: string;
  children?: KnowledgeNode[];
  sourceReference?: string;
}

export interface SubmissionKnowledgeMap {
  topic: string;
  mainClaims: string[];
  methodology: {
    dataset?: string;
    approach: string;
    tools?: string[];
    steps: string[];
  };
  results: {
    metrics: Record<string, string>;
    keyFindings: string[];
  };
  concepts: string[];
  citations: { citation: string; context: string }[];
  limitations: string[];
  knowledgeTree: KnowledgeNode[];
}

export interface GroundedQuestion {
  id: string;
  question: string;
  concept: string;
  difficulty: DifficultyLevel;
  type: QuestionType;
  expectedConcepts: string[];
  sourceLocation: string; // e.g. "Page 4, Paragraph 2"
  paperSnippet?: string;
}

export interface StudentAnswer {
  id: string;
  questionId: string;
  questionText: string;
  concept: string;
  transcript: string;
  audioDurationSec?: number;
  score: number; // 0 to 100
  evaluation: 'excellent' | 'good' | 'partial' | 'inaccurate' | 'unanswered';
  aiFeedback: string;
  sourceReference: string;
  followUpAsked?: string;
}

export interface DefenseBreakdown {
  conceptualUnderstanding: number; // 30%
  methodologyUnderstanding: number; // 20%
  reasoning: number; // 15%
  criticalThinking: number; // 15%
  submissionFamiliarity: number; // 15%
  communication: number; // 5%
}

export interface AcademicIntegrityIndicators {
  understandingLevel: 'Strong' | 'Moderate' | 'Weak' | 'Inconsistent';
  methodologyFamiliarity: 'Strong' | 'Moderate' | 'Weak';
  citationUnderstanding: 'Strong' | 'Moderate' | 'Weak';
  potentialConcernsCount: number;
  concernFlags: {
    severity: 'warning' | 'info';
    message: string;
    sourceSection: string;
  }[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'txt';
  extractedText: string;
  knowledgeMap: SubmissionKnowledgeMap;
  status: 'pending' | 'viva_scheduled' | 'viva_completed';
  vivaSessionId?: string;
}

export interface VivaSession {
  id: string;
  submissionId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  courseName: string;
  startTime: string;
  endTime?: string;
  overallScore?: number; // 0-100
  breakdown?: DefenseBreakdown;
  integrityIndicators?: AcademicIntegrityIndicators;
  status: 'not_started' | 'in_progress' | 'completed';
  currentQuestionIndex: number;
  questions: GroundedQuestion[];
  answers: StudentAnswer[];
  professorAnnotations?: {
    overrideScore?: number;
    notes?: string;
    reviewedAt?: string;
    flaggedForReDefense?: boolean;
  };
}

export interface Course {
  id: string;
  code: string;
  name: string;
  professorId: string;
  professorName: string;
  studentCount: number;
  vivasCompleted: number;
  avgDefenseScore: number;
}
