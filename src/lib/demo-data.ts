import { User, Course, Assignment, Submission, VivaSession, GroundedQuestion } from './types';

export const CURRENT_USER_STUDENT: User = {
  id: 'usr_student_1',
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  role: 'student',
  institution: 'Stanford University - Dept. of Computer Science',
};

export const CURRENT_USER_PROFESSOR: User = {
  id: 'usr_prof_1',
  name: 'Dr. Elena Rostova',
  email: 'e.rostova@university.edu',
  role: 'professor',
  institution: 'Stanford University - Dept. of Computer Science',
};

export const SAMPLE_COURSES: Course[] = [
  {
    id: 'course_101',
    code: 'CS 401',
    name: 'Advanced Machine Learning',
    professorId: 'usr_prof_1',
    professorName: 'Dr. Elena Rostova',
    studentCount: 87,
    vivasCompleted: 81,
    avgDefenseScore: 76,
  },
  {
    id: 'course_102',
    code: 'CS 324',
    name: 'Natural Language Processing & RAG Systems',
    professorId: 'usr_prof_1',
    professorName: 'Dr. Elena Rostova',
    studentCount: 54,
    vivasCompleted: 49,
    avgDefenseScore: 82,
  },
  {
    id: 'course_103',
    code: 'BIO 210',
    name: 'Computational Genomics & CRISPR Systems',
    professorId: 'usr_prof_1',
    professorName: 'Dr. Elena Rostova',
    studentCount: 42,
    vivasCompleted: 38,
    avgDefenseScore: 71,
  },
];

export const SAMPLE_ASSIGNMENT: Assignment = {
  id: 'asg_rf_fraud',
  courseId: 'course_101',
  courseName: 'CS 401: Advanced Machine Learning',
  title: 'Cap-Stone Submission: Ensemble Learning for High-Frequency Financial Fraud Detection',
  description: 'Submit your original research paper evaluating random forest classification, feature bagging strategies, and Gini impurity metrics on imbalanced transaction logs.',
  dueDate: '2026-08-30',
  instructions: 'Paper must include original empirical evaluation, methodology description, hyperparameter choices, cross-validation metrics, and citation references.',
  rubric: 'Methodology rigor (30%), Empirical Validation (30%), Theoretical Defense (20%), Citation Accuracy (20%).',
  vivaSettings: {
    durationMinutes: 5,
    questionCount: 6,
    difficulty: 'medium',
    enabledQuestionTypes: [
      'understanding',
      'methodology',
      'defense',
      'application',
      'critical_thinking',
      'citation',
      'deep_dive',
    ],
    allowFollowUps: true,
    requireMic: true,
    showResultsImmediately: true,
  },
};

export const SAMPLE_QUESTIONS_RF: GroundedQuestion[] = [
  {
    id: 'q1',
    question: 'Your paper states that random forests effectively reduce variance compared to individual decision trees. Can you explain the theoretical mechanism behind why combining multiple trees reduces variance?',
    concept: 'Random Forest Variance Reduction & Bagging',
    difficulty: 'medium',
    type: 'understanding',
    expectedConcepts: [
      'bootstrap aggregation',
      'averaging independent estimators',
      'uncorrelated decision trees',
      'variance reduction formula',
    ],
    sourceLocation: 'Page 3, Section 2.1 — Ensemble Theory',
    paperSnippet: 'By averaging predictions across 100 decorrelated decision trees generated via bootstrap sampling, the total prediction variance decreases by a factor proportional to tree independence.',
  },
  {
    id: 'q2',
    question: 'In Section 4, you reported a precision of 89.2% and recall of 93.1% on an imbalanced dataset of 500,000 transactions. Why did you choose SMOTE over Random Oversampling for handling class imbalance?',
    concept: 'Data Imbalance & Resampling Methodology',
    difficulty: 'medium',
    type: 'methodology',
    expectedConcepts: [
      'synthetic minority generation',
      'avoiding exact copy overfitting',
      'k-nearest neighbors interpolation',
      'precision-recall trade-off',
    ],
    sourceLocation: 'Page 4, Section 3.2 — Data Preprocessing',
    paperSnippet: 'Synthetic Minority Over-sampling Technique (SMOTE) was selected over simple oversampling to mitigate model overfitting by creating synthetic instances along feature space line segments.',
  },
  {
    id: 'q3',
    question: 'You mentioned Gini Impurity several times as your splitting criterion. Explain how Gini Impurity is calculated and how it differs from Information Gain / Entropy.',
    concept: 'Gini Impurity vs Entropy Splitting Criterion',
    difficulty: 'hard',
    type: 'deep_dive',
    expectedConcepts: [
      '1 - sum of squared probabilities',
      'computational speed',
      'logarithmic entropy cost',
      'class purity measurement',
    ],
    sourceLocation: 'Page 5, Section 3.4 — Model Configuration',
    paperSnippet: 'Gini impurity criterion $1 - \\sum p_i^2$ was preferred over logarithmic entropy due to lower computational complexity during high-frequency node splitting.',
  },
  {
    id: 'q4',
    question: 'You cited Breiman (2001) to support your choice of max_features = sqrt(p). How would your model performance change if all trees shared highly correlated feature subsets?',
    concept: 'Feature Subspacing & Correlation Impact',
    difficulty: 'hard',
    type: 'critical_thinking',
    expectedConcepts: [
      'loss of ensemble diversity',
      'higher correlation increases overall variance',
      'dominant features mask secondary signals',
      'reduction in decorrelation benefit',
    ],
    sourceLocation: 'Page 6, Section 4.2 — Hyperparameter Tuning',
    paperSnippet: 'Subsampling $\\sqrt{p}$ features per split ensures decorrelation among decision trees; without subspacing, correlated dominant features dominate every root split.',
  },
  {
    id: 'q5',
    question: 'You cited Smith et al. (2022) regarding fraud transaction latency constraints. How does Smith et al.\'s benchmark apply to your specific 15ms inference budget?',
    concept: 'Citation Grounding & Inference Latency',
    difficulty: 'medium',
    type: 'citation',
    expectedConcepts: [
      'real-time streaming transaction latency',
      'tree depth restrictions',
      'sub-20ms threshold',
    ],
    sourceLocation: 'Page 7, Section 5.1 — Latency Constraints',
    paperSnippet: 'As demonstrated by Smith et al. (2022), online payment processors demand inference response within 20ms to prevent checkout degradation.',
  },
  {
    id: 'q6',
    question: 'What is the single biggest limitation of your Random Forest model when deployed against completely unseen zero-day fraud patterns?',
    concept: 'Model Limitations & Zero-Day Fraud',
    difficulty: 'hard',
    type: 'defense',
    expectedConcepts: [
      'inability to extrapolate beyond training feature bounds',
      'supervised learning boundary limitation',
      'need for unsupervised anomaly detection',
    ],
    sourceLocation: 'Page 9, Section 6 — Limitations & Future Work',
    paperSnippet: 'Random forests cannot extrapolate beyond historical feature boundaries, making zero-day fraud vectors susceptible to evasion without unsupervised fallback models.',
  },
];

export const SAMPLE_SUBMISSION: Submission = {
  id: 'sub_alex_101',
  assignmentId: 'asg_rf_fraud',
  assignmentTitle: 'Ensemble Learning for High-Frequency Financial Fraud Detection',
  courseName: 'CS 401: Advanced Machine Learning',
  studentId: 'usr_student_1',
  studentName: 'Alex Chen',
  studentEmail: 'alex.chen@university.edu',
  submittedAt: '2026-08-24 14:32 PST',
  fileName: 'Chen_Alex_RandomForest_FraudDetection.pdf',
  fileType: 'pdf',
  extractedText: `
  Cap-Stone Submission: Ensemble Learning for High-Frequency Financial Fraud Detection
  By Alex Chen (Department of Computer Science)

  ABSTRACT
  Financial fraud in high-frequency payment networks poses a critical threat to digital economies. In this paper, we evaluate Random Forest ensemble classification on an imbalanced dataset of 500,000 transaction records. We demonstrate that bootstrap aggregation (bagging) combined with feature subspacing effectively reduces estimator variance while maintaining an overall accuracy of 91.4%, precision of 89.2%, and recall of 93.1%.

  1. INTRODUCTION
  Financial institutions process millions of transactions per minute. Machine learning models must satisfy two criteria: ultra-low inference latency (<20ms) and high sensitivity to rare fraud events. Single decision trees suffer from high variance and severe overfitting on noisy financial data. Ensemble methods, specifically Random Forests introduced by Breiman (2001), mitigate these issues by constructing multiple decision trees and averaging their probabilistic outputs.

  2. METHODOLOGY & DATASET
  Our dataset contains 500,000 credit card transaction events, of which only 0.4% are labeled fraudulent.
  To handle extreme class imbalance, we applied Synthetic Minority Over-sampling Technique (SMOTE) rather than simple random oversampling, preventing exact-duplicate overfitting.
  We evaluated 100 decorrelated decision trees using the Gini impurity splitting criterion:
  Gini = 1 - sum(p_i^2)
  Max feature subspacing was set to sqrt(p) to ensure tree decorrelation across random candidate feature subsets.

  3. RESULTS & PERFORMANCE METRICS
  The Random Forest classifier achieved:
  - Accuracy: 91.4%
  - Precision: 89.2%
  - Recall: 93.1%
  - F1-Score: 91.1%
  Average decision latency was measured at 14.2ms per transaction batch on an 8-core CPU server, well within the sub-20ms requirement highlighted by Smith et al. (2022).

  4. LIMITATIONS & FUTURE WORK
  While effective on known fraud feature distribution vectors, Random Forests cannot extrapolate to unseen zero-day fraud tactics outside historical training boundaries. Future work should investigate hybrid architectures pairing Random Forests with unsupervised autoencoders for anomaly detection.
  `,
  knowledgeMap: {
    topic: 'Random Forest Ensemble Classification for Financial Fraud Detection',
    mainClaims: [
      'Random Forests reduce decision variance through decorrelated tree averaging (bagging).',
      'SMOTE oversampling provides superior generalization over random oversampling on imbalanced datasets.',
      'Model achieves 91.4% accuracy with 14.2ms inference latency, satisfying real-time SLAs.',
    ],
    methodology: {
      dataset: '500,000 transaction records (0.4% fraud balance)',
      approach: 'Random Forest ensemble with 100 decision trees and SMOTE data augmentation',
      tools: ['Scikit-learn', 'SMOTE (imbalanced-learn)', 'Python 3.11'],
      steps: [
        'Data cleaning & normalization',
        'Synthetic Minority Over-sampling (SMOTE)',
        'Gini impurity split node evaluation',
        'Feature subspacing sqrt(p)',
        'Cross-validation testing & latency measurement',
      ],
    },
    results: {
      metrics: {
        Accuracy: '91.4%',
        Precision: '89.2%',
        Recall: '93.1%',
        'F1-Score': '91.1%',
        'Avg Latency': '14.2ms',
      },
      keyFindings: [
        'Decorrelation of features prevented dominant feature bias',
        'Inference budget satisfied sub-20ms SLA requirement',
      ],
    },
    concepts: [
      'Bootstrap Aggregation (Bagging)',
      'Gini Impurity Criterion',
      'Feature Subspacing sqrt(p)',
      'SMOTE Synthetic Sampling',
      'Variance Reduction Theory',
      'Zero-Day Fraud Boundaries',
    ],
    citations: [
      {
        citation: 'Breiman, L. (2001). Random Forests. Machine Learning, 45(1), 5-32.',
        context: 'Foundation of ensemble tree subspacing and variance reduction.',
      },
      {
        citation: 'Smith et al. (2022). Real-Time Fraud SLA in Digital Banking.',
        context: 'Establishes 20ms real-time latency threshold constraint.',
      },
    ],
    limitations: [
      'Inability to extrapolate beyond training feature bounds for zero-day fraud',
      'Requires periodic retraining on updated transaction drift',
    ],
    knowledgeTree: [
      {
        id: 'n1',
        title: 'Random Forest Fraud Classification',
        type: 'topic',
        details: 'High-frequency transaction fraud detection using ensemble tree algorithms.',
        children: [
          {
            id: 'n2',
            title: 'Main Claim: Variance Reduction',
            type: 'claim',
            details: 'Combining decorrelated decision trees reduces overall estimator variance.',
            sourceReference: 'Page 3, Section 2.1',
          },
          {
            id: 'n3',
            title: 'Methodology: SMOTE & Tree Setup',
            type: 'methodology',
            details: '100 trees, sqrt(p) feature split, SMOTE synthetic oversampling.',
            sourceReference: 'Page 4, Section 3.2',
            children: [
              {
                id: 'n3_1',
                title: 'Concept: Gini Impurity',
                type: 'concept',
                details: 'Splitting metric: Gini = 1 - sum(p_i^2)',
                sourceReference: 'Page 5, Section 3.4',
              },
              {
                id: 'n3_2',
                title: 'Citation: Breiman (2001)',
                type: 'citation',
                details: 'Random Forests theoretical formulation',
                sourceReference: 'Ref [1]',
              },
            ],
          },
          {
            id: 'n4',
            title: 'Results: 91.4% Accuracy & 14.2ms Latency',
            type: 'result',
            details: 'Precision 89.2%, Recall 93.1%, sub-20ms SLA met.',
            sourceReference: 'Page 6, Section 4.1',
          },
          {
            id: 'n5',
            title: 'Limitation: Zero-Day Fraud Extrapolation',
            type: 'limitation',
            details: 'Cannot extrapolate beyond historical feature boundaries without unsupervised assistance.',
            sourceReference: 'Page 9, Section 6',
          },
        ],
      },
    ],
  },
  status: 'viva_completed',
  vivaSessionId: 'viva_session_alex_1',
};

export const SAMPLE_COMPLETED_VIVA: VivaSession = {
  id: 'viva_session_alex_1',
  submissionId: 'sub_alex_101',
  assignmentTitle: 'Ensemble Learning for High-Frequency Financial Fraud Detection',
  studentId: 'usr_student_1',
  studentName: 'Alex Chen',
  courseName: 'CS 401: Advanced Machine Learning',
  startTime: '2026-08-25 10:15 PST',
  endTime: '2026-08-25 10:20 PST',
  overallScore: 84,
  breakdown: {
    conceptualUnderstanding: 91,
    methodologyUnderstanding: 86,
    reasoning: 80,
    criticalThinking: 75,
    submissionFamiliarity: 88,
    communication: 90,
  },
  integrityIndicators: {
    understandingLevel: 'Strong',
    methodologyFamiliarity: 'Strong',
    citationUnderstanding: 'Moderate',
    potentialConcernsCount: 1,
    concernFlags: [
      {
        severity: 'info',
        message: 'Student gave a simplified answer regarding Gini Impurity calculations before correcting themselves during follow-up.',
        sourceSection: 'Page 5, Section 3.4 — Model Configuration',
      },
    ],
  },
  status: 'completed',
  currentQuestionIndex: 6,
  questions: SAMPLE_QUESTIONS_RF,
  answers: [
    {
      id: 'ans_1',
      questionId: 'q1',
      questionText: 'Your paper states that random forests effectively reduce variance compared to individual decision trees. Can you explain the theoretical mechanism behind why combining multiple trees reduces variance?',
      concept: 'Random Forest Variance Reduction & Bagging',
      transcript: 'Because when you train multiple independent trees on different bootstrap samples of the data, each tree makes slightly different errors. When you average their predictions, the random individual errors cancel out, reducing the overall variance of the model.',
      audioDurationSec: 22,
      score: 95,
      evaluation: 'excellent',
      aiFeedback: 'The student clearly articulated bootstrap aggregation and error cancellation through averaging.',
      sourceReference: 'Page 3, Section 2.1 — Ensemble Theory',
      followUpAsked: 'Good. What would happen if all of your trees were highly correlated?',
    },
    {
      id: 'ans_2',
      questionId: 'q2',
      questionText: 'In Section 4, you reported a precision of 89.2% and recall of 93.1% on an imbalanced dataset of 500,000 transactions. Why did you choose SMOTE over Random Oversampling for handling class imbalance?',
      concept: 'Data Imbalance & Resampling Methodology',
      transcript: 'Random oversampling just creates exact duplicates of the minority fraud cases, which causes decision trees to memorize specific data points and overfit. SMOTE creates synthetic data points along the vectors between neighboring fraud samples, giving the model better feature boundaries.',
      audioDurationSec: 26,
      score: 92,
      evaluation: 'excellent',
      aiFeedback: 'Demonstrated deep understanding of SMOTE synthetic interpolation vs exact duplicate overfitting.',
      sourceReference: 'Page 4, Section 3.2 — Data Preprocessing',
    },
    {
      id: 'ans_3',
      questionId: 'q3',
      questionText: 'You mentioned Gini Impurity several times as your splitting criterion. Explain how Gini Impurity is calculated and how it differs from Information Gain / Entropy.',
      concept: 'Gini Impurity vs Entropy Splitting Criterion',
      transcript: 'Gini impurity measures how often a randomly chosen element would be incorrectly labeled. It is calculated as 1 minus the sum of squared probabilities for each class. Information gain uses entropy which involves log operations, so Gini is faster to compute.',
      audioDurationSec: 28,
      score: 85,
      evaluation: 'good',
      aiFeedback: 'Accurately stated the formula 1 - sum(p_i^2) and computational efficiency rationale over entropy.',
      sourceReference: 'Page 5, Section 3.4 — Model Configuration',
    },
    {
      id: 'ans_4',
      questionId: 'q4',
      questionText: 'You cited Breiman (2001) to support your choice of max_features = sqrt(p). How would your model performance change if all trees shared highly correlated feature subsets?',
      concept: 'Feature Subspacing & Correlation Impact',
      transcript: 'If the feature subsets are correlated, the trees will make identical root splits on dominant features. That reduces tree diversity, which means averaging them won\'t lower the variance nearly as much.',
      audioDurationSec: 24,
      score: 88,
      evaluation: 'good',
      aiFeedback: 'Correctly linked feature correlation to loss of ensemble diversity and reduced variance suppression.',
      sourceReference: 'Page 6, Section 4.2 — Hyperparameter Tuning',
    },
    {
      id: 'ans_5',
      questionId: 'q5',
      questionText: 'You cited Smith et al. (2022) regarding fraud transaction latency constraints. How does Smith et al.\'s benchmark apply to your specific 15ms inference budget?',
      concept: 'Citation Grounding & Inference Latency',
      transcript: 'Smith et al. showed that in real-time banking pipelines, any model taking longer than 20 milliseconds causes payment gateway timeouts. My model runs at 14.2 milliseconds, so it stays within that safety buffer.',
      audioDurationSec: 21,
      score: 80,
      evaluation: 'good',
      aiFeedback: 'Demonstrated clear awareness of cited literature SLA constraints and model implementation.',
      sourceReference: 'Page 7, Section 5.1 — Latency Constraints',
    },
    {
      id: 'ans_6',
      questionId: 'q6',
      questionText: 'What is the single biggest limitation of your Random Forest model when deployed against completely unseen zero-day fraud patterns?',
      concept: 'Model Limitations & Zero-Day Fraud',
      transcript: 'Random forests are supervised algorithms bound by historical training distributions. If a zero-day fraud pattern presents completely novel feature relationships, the tree splits won\'t catch it. We\'d need unsupervised anomaly models as a backup layer.',
      audioDurationSec: 27,
      score: 75,
      evaluation: 'good',
      aiFeedback: 'Accurately identified supervised feature space boundary limitation and proposed unsupervised fallback.',
      sourceReference: 'Page 9, Section 6 — Limitations & Future Work',
    },
  ],
  professorAnnotations: {
    overrideScore: 86,
    notes: 'Alex demonstrated impressive mastery over ensemble theory and data preprocessing choices. Viva confirms genuine understanding.',
    reviewedAt: '2026-08-25 11:00 PST',
  },
};

export const OTHER_STUDENT_SUBMISSIONS = [
  {
    studentName: 'Rahul Sharma',
    score: 42,
    status: 'Needs Review',
    courseName: 'CS 401',
    assignmentTitle: 'Random Forest Classification',
    submittedAt: 'Aug 24',
    issue: 'Struggled to explain basic feature subspacing choices and gave answers inconsistent with submitted methodology.',
  },
  {
    studentName: 'Sarah Johnson',
    score: 51,
    status: 'Needs Review',
    courseName: 'CS 401',
    assignmentTitle: 'Random Forest Classification',
    submittedAt: 'Aug 24',
    issue: 'Unable to explain Gini impurity formula cited on Page 4 or defend SMOTE parameter choices.',
  },
  {
    studentName: 'David Thomas',
    score: 58,
    status: 'Needs Review',
    courseName: 'CS 401',
    assignmentTitle: 'Random Forest Classification',
    submittedAt: 'Aug 23',
    issue: 'Frequent silence on critical thinking questions regarding zero-day fraud limits.',
  },
  {
    studentName: 'Maya Patel',
    score: 92,
    status: 'Verified',
    courseName: 'CS 401',
    assignmentTitle: 'Random Forest Classification',
    submittedAt: 'Aug 24',
    issue: 'Exceptional defense across all theoretical & empirical questions.',
  },
  {
    studentName: 'Jordan Vance',
    score: 88,
    status: 'Verified',
    courseName: 'CS 401',
    assignmentTitle: 'Random Forest Classification',
    submittedAt: 'Aug 24',
    issue: 'Strong defense of hyperparameters and dataset split ratio.',
  },
];
