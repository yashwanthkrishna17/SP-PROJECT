'use client';

import React, { useState } from 'react';
import { Submission, SubmissionKnowledgeMap } from '@/lib/types';
import { generateKnowledgeMapFromText } from '@/lib/knowledge-map-extractor';
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmissionCreated: (newSub: Submission) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmissionCreated,
}) => {
  const [paperTitle, setPaperTitle] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'docx' | 'pptx' | 'txt'>('pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedMap, setExtractedMap] = useState<SubmissionKnowledgeMap | null>(null);

  if (!isOpen) return null;

  const handlePresetSelect = (presetName: string) => {
    if (presetName === 'airlines') {
      setPaperTitle('Intelligent Flight Scheduling and Revenue Management in Commercial Airlines');
      setFileName('Airlines_Management_System_Study.pdf');
      setFileType('pdf');
      setFileContent(
`Commercial airline operations require continuous real-time synchronization between fleet scheduling, crew duty assignments, dynamic ticket pricing, and airport turnaround SLA management. In this research, we evaluate a multi-commodity network flow optimization framework applied across 45 hub airports and 320 daily flight legs.

Main claim: Joint route optimization and dynamic seat pricing minimizes cascading hub delays by 34% while increasing passenger load factor to 88.6%.
Methodology: Integer Linear Programming (ILP) with rolling-horizon heuristic decomposition, integrated with stochastic passenger cancellation probability models and airport gate constraints.
Core Concepts: Flight Scheduling & Network Flow, Dynamic Pricing & Revenue Management, Fleet Maintenance Turnaround, Crew Rostering, Air Traffic Delay Propagation.
Key Findings: Turnaround SLA compliance improved by 28% across connecting hubs, and fuel burn decreased through optimized cruise altitudes.
Limitations: Extreme weather disruptions and volatile jet fuel price fluctuations require manual dispatch overrides outside simulated boundary conditions.`
      );
    } else if (presetName === 'rag') {
      setPaperTitle('Mitigating LLM Hallucinations via Retrieval-Augmented Generation (RAG)');
      setFileName('Chen_RAG_Hallucination_Mitigation.pdf');
      setFileType('pdf');
      setFileContent(
`Retrieval-Augmented Generation (RAG) effectively anchors Large Language Model (LLM) responses in verified vector databases, mitigating hallucinations by 84%.
We evaluated dense vector indexing using HNSW and cosine similarity on 200,000 biomedical papers.
Main claim: Grounded retrieval constrains LLM output entropy and eliminates hallucinated citations.
Methodology: Chunking documents into 512-token windows with 54-token overlap, using OpenAI text-embedding-3-small and Qdrant vector store.
Limitations: Vector retrieval latency adds ~180ms overhead to context generation.`
      );
    } else if (presetName === 'crispr') {
      setPaperTitle('CRISPR-Cas9 Off-Target Binding Prediction using Deep Convolutional Neural Networks');
      setFileName('Alex_CRISPR_DeepLearning.docx');
      setFileType('docx');
      setFileContent(
`Off-target cleavage by CRISPR-Cas9 poses significant challenges in genomic editing.
We present CasPredict, a deep CNN architecture trained on 50,000 gRNA-DNA cleavage sequences.
Main claim: Multi-layer spatial convolution captures non-linear mismatch energetic penalties with 94.2% ROC-AUC accuracy.
Methodology: One-hot encoding of 23bp protospacer adjacent motif (PAM) sequences combined with PAM position weighting.
Limitations: High computational requirements during genome-wide scan sweeps.`
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'docx') setFileType('docx');
    else if (ext === 'pptx') setFileType('pptx');
    else if (ext === 'txt') setFileType('txt');
    else setFileType('pdf');

    setIsExtracting(true);

    try {
      // Send file to server-side parser route
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/extract-document', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text && data.text.length > 20) {
          setFileContent(data.text);
          if (!paperTitle || paperTitle === 'Custom Assignment Defense') {
            setPaperTitle(data.title || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
          }
          setIsExtracting(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Server document extraction fallback to client FileReader:', err);
    }

    // Client-side fallback if server route unavailable
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text || 'Extracted paper content placeholder.');
      if (!paperTitle) {
        setPaperTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
      setIsExtracting(false);
    };
    reader.onerror = () => setIsExtracting(false);
    reader.readAsText(file);
  };

  const handleAnalyzeDocument = () => {
    if (!fileContent && !paperTitle) return;
    setIsProcessing(true);

    setTimeout(() => {
      const titleToUse = paperTitle || fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const kMap = generateKnowledgeMapFromText(titleToUse, fileContent || paperTitle);
      setExtractedMap(kMap);
      setIsProcessing(false);
    }, 600);
  };

  const handleConfirmSubmission = () => {
    if (!extractedMap) return;

    // Detect course name context
    const topicLower = extractedMap.topic.toLowerCase();
    let courseName = 'CS 401: Systems & Operations';
    if (/airlin|flight|aviation|fleet|transport/i.test(topicLower)) {
      courseName = 'AVN 410: Airline Operations & Fleet Logistics';
    } else if (/crispr|genom|dna|bio/i.test(topicLower)) {
      courseName = 'BIO 480: Computational Genomics';
    } else if (/rag|llm|retrieval|language model/i.test(topicLower)) {
      courseName = 'CS 582: Natural Language Processing';
    } else if (/fraud|forest|machine learning/i.test(topicLower)) {
      courseName = 'CS 401: Advanced Machine Learning';
    }

    const newSub: Submission = {
      id: `sub_custom_${Date.now()}`,
      assignmentId: `asg_${Date.now()}`,
      assignmentTitle: paperTitle || extractedMap.topic || 'Custom Assignment Defense',
      courseName,
      studentId: 'usr_student_1',
      studentName: 'Alex Chen',
      studentEmail: 'alex.chen@university.edu',
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      fileName: fileName || 'Submitted_Paper.pdf',
      fileType: fileType,
      extractedText: fileContent || 'Extracted text content from student upload.',
      knowledgeMap: extractedMap,
      status: 'viva_scheduled',
    };

    onSubmissionCreated(newSub);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl border border-slate-200 p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-lg space-y-6">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-md text-slate-400 hover:text-slate-600 bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-900">Upload Submission Paper</h3>
            <p className="text-xs text-slate-500">PDF, DOCX, PPTX, or TXT format supported with auto-extraction</p>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block font-mono">
            Quick Sample Paper Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handlePresetSelect('airlines')}
              className="px-3 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 border border-indigo-200 flex items-center gap-1.5 transition-colors"
            >
              <span>✈️ Load: Airlines Management</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('rag')}
              className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
            >
              📄 Load: RAG Hallucination Study
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('crispr')}
              className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
            >
              📄 Load: CRISPR Genomics Study
            </button>
          </div>
        </div>

        {!extractedMap ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                Paper Title
              </label>
              <input
                type="text"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                placeholder="e.g. Intelligent Flight Scheduling and Revenue Management in Commercial Airlines"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                Upload File (PDF, DOCX, TXT)
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-6 text-center bg-slate-50 relative cursor-pointer transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx,.pptx,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  {fileName ? fileName : 'Click or Drag Document Here (PDF, DOCX, TXT)'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isExtracting ? 'Parsing and extracting text from document...' : 'Full text extracted automatically for viva question synthesis'}
                </p>
                {isExtracting && (
                  <div className="mt-2 flex items-center justify-center gap-2 text-xs text-indigo-600 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting document text...</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                Extracted Document Text (Editable)
              </label>
              <textarea
                rows={5}
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Paper text will appear here automatically when file is uploaded, or you can paste your report text directly..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-600 leading-relaxed"
              />
            </div>

            <button
              onClick={handleAnalyzeDocument}
              disabled={isProcessing || isExtracting || (!fileContent && !paperTitle)}
              className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Document-Grounded Knowledge Map...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Document & Build Knowledge Map</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Knowledge Map generated successfully for "{extractedMap.topic}"!</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <div className="border-b border-slate-200 pb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600">Extracted Domain Topic</span>
                <h4 className="font-bold text-slate-900 text-sm">{extractedMap.topic}</h4>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Core Thesis / Main Claim</span>
                <p className="text-xs text-slate-700 mt-0.5">{extractedMap.mainClaims[0]}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Methodology Framework</span>
                <p className="text-xs text-slate-700 mt-0.5">{extractedMap.methodology.approach}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Grounded Concepts ({extractedMap.concepts.length})</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {extractedMap.concepts.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-800">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setExtractedMap(null)}
                className="w-1/3 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmission}
                className="w-2/3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>Schedule & Start Viva</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
