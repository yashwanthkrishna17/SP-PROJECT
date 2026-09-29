import { SubmissionKnowledgeMap, GroundedQuestion, DifficultyLevel, QuestionType } from './types';

export function generateKnowledgeMapFromText(title: string, text: string): SubmissionKnowledgeMap {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const wordCount = text.split(/\s+/).length;

  // Extract key phrases and claims heuristically or via structure
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  const extractedClaims: string[] = [];
  const extractedConcepts: string[] = [];
  const extractedCitations: { citation: string; context: string }[] = [];
  const extractedLimitations: string[] = [];

  // Parse lines for key sections
  sentences.forEach((s) => {
    const clean = s.trim();
    if (clean.match(/claim|demonstrate|show that|find that|propose|argue|reduce|improve|achieve/i) && extractedClaims.length < 4) {
      extractedClaims.push(clean);
    }
    if (clean.match(/limit|constrain|future work|drawback|weakness|vulnerability|bound/i) && extractedLimitations.length < 3) {
      extractedLimitations.push(clean);
    }
    if (clean.match(/\([12][09]\d\d\)|et al\.|cited|ref|journal|conference/i) && extractedCitations.length < 3) {
      extractedCitations.push({
        citation: clean.substring(0, 80) + '...',
        context: 'Cited as foundational evidence for claims in submission.',
      });
    }
  });

  // Default fallbacks if text is short
  if (extractedClaims.length === 0) {
    extractedClaims.push(`Main argument: ${title} provides effective solution framework.`);
    extractedClaims.push(`Methodological validation shows consistent quantitative performance.`);
  }
  if (extractedLimitations.length === 0) {
    extractedLimitations.push(`Boundaries limited to training sample parameter ranges.`);
    extractedLimitations.push(`Extrapolation to out-of-distribution conditions requires further study.`);
  }

  // Generate concepts based on keywords
  const lowerText = text.toLowerCase();
  const conceptPool = [
    { key: 'variance', name: 'Variance Reduction Theory' },
    { key: 'methodology', name: 'Methodological Framework' },
    { key: 'accuracy', name: 'Performance Metrics Evaluation' },
    { key: 'algorithm', name: 'Algorithmic Complexity' },
    { key: 'dataset', name: 'Sampling & Data Preprocessing' },
    { key: 'limitation', name: 'Constraint & Boundary Analysis' },
    { key: 'citation', name: 'Literature Grounding & Citations' },
    { key: 'hyperparameter', name: 'Parameter Tuning & Optimization' },
  ];

  conceptPool.forEach(c => {
    if (lowerText.includes(c.key)) {
      extractedConcepts.push(c.name);
    }
  });

  if (extractedConcepts.length === 0) {
    extractedConcepts.push('Primary Conceptual Framework', 'Methodological Foundations', 'Analytical Evaluation');
  }

  return {
    topic: title || 'Academic Research Submission',
    mainClaims: extractedClaims,
    methodology: {
      dataset: text.includes('dataset') ? 'Analyzed experimental corpus / records' : 'Primary dataset',
      approach: 'Empirical analysis and theoretical evaluation',
      tools: ['Domain Analysis Pipeline', 'Statistical Metrics'],
      steps: [
        'Problem formulation & hypothesis setup',
        'Data extraction & preprocessing',
        'Model training / analytical formulation',
        'Validation against benchmark metrics',
      ],
    },
    results: {
      metrics: {
        'Text Analysis Depth': `${wordCount} words`,
        'Extracted Claims': `${extractedClaims.length}`,
        'Core Concepts Identified': `${extractedConcepts.length}`,
      },
      keyFindings: [
        'Submission contains structured methodology and supporting arguments.',
        'Core claims are referenced against empirical results.',
      ],
    },
    concepts: extractedConcepts,
    citations: extractedCitations.length > 0 ? extractedCitations : [
      { citation: 'Standard Literature References', context: 'Used to benchmark methodology.' }
    ],
    limitations: extractedLimitations,
    knowledgeTree: [
      {
        id: 'kn_root',
        title: title || 'Submission Root Topic',
        type: 'topic',
        details: `Analyzed document spanning ~${wordCount} words.`,
        children: [
          {
            id: 'kn_claims',
            title: 'Core Claims & Hypotheses',
            type: 'claim',
            details: extractedClaims[0] || 'Primary research thesis.',
            sourceReference: 'Section 1 — Introduction',
          },
          {
            id: 'kn_meth',
            title: 'Methodology & Analytical Pipeline',
            type: 'methodology',
            details: 'Quantitative and qualitative framework.',
            sourceReference: 'Section 2 — Methodology',
            children: extractedConcepts.map((c, i) => ({
              id: `kn_c_${i}`,
              title: c,
              type: 'concept',
              details: `Core technical terminology detected in document.`,
              sourceReference: `Page ${i + 1}`,
            })),
          },
          {
            id: 'kn_res',
            title: 'Results & Findings',
            type: 'result',
            details: 'Evaluated quantitative performance metrics.',
            sourceReference: 'Section 3 — Empirical Results',
          },
          {
            id: 'kn_lim',
            title: 'Limitations & Scope',
            type: 'limitation',
            details: extractedLimitations[0] || 'Boundary constraints.',
            sourceReference: 'Section 4 — Discussion',
          },
        ],
      },
    ],
  };
}

export function generateGroundedQuestionsFromMap(
  map: SubmissionKnowledgeMap,
  targetCount: number = 6
): GroundedQuestion[] {
  const questions: GroundedQuestion[] = [];

  // Q1: Understanding / Main Claim
  if (map.mainClaims.length > 0) {
    questions.push({
      id: `gen_q_1`,
      question: `Your submission presents the claim: "${map.mainClaims[0]}". Can you explain the core theoretical foundation behind this claim?`,
      concept: 'Main Submission Thesis',
      difficulty: 'easy',
      type: 'understanding',
      expectedConcepts: ['core argument', 'theoretical basis', 'supporting evidence'],
      sourceLocation: 'Page 2, Section 1 — Abstract & Introduction',
      paperSnippet: map.mainClaims[0],
    });
  }

  // Q2: Methodology
  questions.push({
    id: `gen_q_2`,
    question: `In your methodology section, you describe using an approach focused on ${map.methodology.approach}. Why did you select this specific methodology over alternative frameworks?`,
    concept: 'Methodological Rationale',
    difficulty: 'medium',
    type: 'methodology',
    expectedConcepts: ['approach selection', 'trade-offs', 'suitability for problem'],
    sourceLocation: 'Page 3, Section 2 — Methodology',
    paperSnippet: `Methodology: ${map.methodology.approach}`,
  });

  // Q3: Concept Deep Dive
  const concept1 = map.concepts[0] || 'Key Terminology';
  questions.push({
    id: `gen_q_3`,
    question: `You reference "${concept1}" as a key element of your submission. Explain how this concept functions within your analysis.`,
    concept: concept1,
    difficulty: 'medium',
    type: 'deep_dive',
    expectedConcepts: ['definition', 'application in paper', 'mathematical or operational mechanism'],
    sourceLocation: 'Page 4, Section 3 — Theoretical Concepts',
    paperSnippet: `Concept: ${concept1}`,
  });

  // Q4: Defense / Results
  questions.push({
    id: `gen_q_4`,
    question: `Looking at your results, why should an examiner trust that your findings are robust and not an artifact of overfitting or sample bias?`,
    concept: 'Results Validation & Robustness',
    difficulty: 'hard',
    type: 'defense',
    expectedConcepts: ['cross validation', 'sample representative quality', 'error bounds'],
    sourceLocation: 'Page 5, Section 4 — Results & Discussion',
    paperSnippet: map.results.keyFindings[0] || 'Empirical findings presented in submission',
  });

  // Q5: Critical Thinking / Limitations
  const lim = map.limitations[0] || 'Scope boundary';
  questions.push({
    id: `gen_q_5`,
    question: `You note the following limitation: "${lim}". What is the biggest operational risk this limitation poses if your work were deployed in production?`,
    concept: 'Limitations & Critical Assessment',
    difficulty: 'hard',
    type: 'critical_thinking',
    expectedConcepts: ['real world risk', 'boundary conditions', 'proposed mitigation'],
    sourceLocation: 'Page 6, Section 5 — Limitations',
    paperSnippet: lim,
  });

  // Q6: Application / Hypothetical
  questions.push({
    id: `gen_q_6`,
    question: `How would your architectural design or methodology change if your dataset or problem scale increased by 10x?`,
    concept: 'Scalability & Architectural Adaptation',
    difficulty: 'medium',
    type: 'application',
    expectedConcepts: ['computational complexity', 'scalability bottlenecks', 'architectural changes'],
    sourceLocation: 'General Submission Scope',
    paperSnippet: 'Overall submission scope and methodology execution',
  });

  return questions.slice(0, targetCount);
}
