'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, FileText, Image as ImageIcon, AlertTriangle, CheckCircle2, 
  Scan, Layers, Sparkles, ChevronRight, X, Eye, RefreshCw, BarChart2,
  FileCheck, ArrowRight, ShieldAlert, Cpu, ExternalLink, GitCompare,
  Brain, Shuffle, BookOpen
} from 'lucide-react';

interface OverlappingPassage {
  doc_a_start: number;
  doc_a_end: number;
  doc_b_start: number;
  doc_b_end: number;
  matched_text: string;
  length: number;
}

interface ParaphrasedPassage {
  doc_a_sentence: string;
  doc_b_sentence: string;
  semantic_score: number;
  lexical_similarity: number;
  paraphrase_type: string;
}

interface PairMetrics {
  sentence_overlap: number;
  phrase_containment: number;
  topical_cosine_similarity: number;
  paraphrase_count?: number;
  paraphrase_percentage?: number;
  doc_a_in_b_ratio?: number;
  doc_b_in_a_ratio?: number;
}

interface FlaggedPair {
  id: string;
  doc_a: string;
  doc_b: string;
  doc_a_text?: string;
  doc_b_text?: string;
  similarity_score: number;
  similarity_percentage: number;
  severity: 'CRITICAL' | 'MODERATE' | 'LOW';
  metrics?: PairMetrics;
  overlapping_passages: OverlappingPassage[];
  paraphrased_passages?: ParaphrasedPassage[];
  total_overlapping_snippets: number;
}

interface ExtractionSummary {
  filename: string;
  word_count: number;
  method: string;
  text_preview?: string;
}

interface PlagiarismReport {
  document_names: string[];
  similarity_matrix: number[][];
  flagged_pairs: FlaggedPair[];
  total_documents: number;
  critical_matches_count: number;
  moderate_matches_count: number;
  extraction_summary: ExtractionSummary[];
  paraphrase_detection_enabled?: boolean;
  warnings?: string[];
}

export const PlagiarismDetectorView: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState<PlagiarismReport | null>(null);
  const [selectedPair, setSelectedPair] = useState<FlaggedPair | null>(null);
  const [modalTab, setModalTab] = useState<'verbatim' | 'paraphrased'>('verbatim');
  const [activeTab, setActiveTab] = useState<'pairs' | 'matrix' | 'extraction'>('pairs');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'MODERATE'>('ALL');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'online') setBackendStatus('connected');
        else setBackendStatus('offline');
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const loadDemoData = async () => {
    setIsUploading(true);
    try {
      const res = await fetch('http://localhost:8000/api/demo-data');
      if (!res.ok) throw new Error('Backend failed');
      const data: PlagiarismReport = await res.json();
      setReport(data);
    } catch (err: any) {
      alert(`Could not fetch demo data: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeUpload = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 assignment files for peer-to-peer comparison.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await fetch('http://localhost:8000/api/check-plagiarism', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail?.message || err.detail || 'Analysis failed');
      }

      const data: PlagiarismReport = await res.json();
      setReport(data);
    } catch (err: any) {
      alert(`Analysis Error: ${err.message}. Make sure both files contain readable text or scans.`);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredPairs = report?.flagged_pairs.filter(pair => {
    if (filterSeverity === 'ALL') return true;
    return pair.severity === filterSeverity;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER HERO */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>Semantic Paraphrase Detection (MiniLM) + Apple Vision HTR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Peer-to-Peer Assignment Plagiarism Detector
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Detects both <strong className="text-amber-300">exact copy-pasting</strong> and <strong className="text-purple-300">AI / synonym paraphrasing</strong>. 
              Our neural models catch rewritten sentences even when students swap verbs or restructure clauses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 text-xs">
              <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300">
                FastAPI + ML: <strong className={backendStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}>{backendStatus}</strong>
              </span>
            </div>

            <button
              onClick={loadDemoData}
              disabled={isUploading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>Load Sample Cohort Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* BATCH UPLOAD DROPZONE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-indigo-600" />
          Upload Assignments to Compare
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Select multiple assignments. Supports digital PDFs, handwritten page photos (JPG/PNG), and Word docs (.docx).
        </p>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-xl p-8 text-center cursor-pointer transition-all group"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            multiple 
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt"
            onChange={handleFileChange}
            className="hidden" 
          />
          <div className="w-12 h-12 rounded-full bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center mx-auto text-indigo-600 mb-3 transition-colors">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Click to browse files or drag & drop assignments
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supports PDF (scanned &amp; digital), DOCX, PNG, JPG, TXT (Minimum 2 files)
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Selected Files ({files.length})</span>
              <button 
                onClick={() => setFiles([])} 
                className="text-rose-600 hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
              {files.map((file, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    {file.name.endsWith('.png') || file.name.endsWith('.jpg') ? (
                      <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                    <span className="truncate font-medium text-slate-700">{file.name}</span>
                  </div>
                  <button 
                    onClick={() => removeFile(idx)}
                    className="text-slate-400 hover:text-rose-600 ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleAnalyzeUpload}
                disabled={isUploading || files.length < 2}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running OCR &amp; Paraphrase Semantic Engine...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    <span>Run Plagiarism Detection ({files.length} Files)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ANALYSIS REPORT SECTION */}
      {report && (
        <div className="space-y-6">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Cohort Assignments</p>
                <p className="text-2xl font-bold text-slate-900">{report.total_documents}</p>
                <p className="text-[10px] text-slate-400">{report.similarity_matrix.length * (report.similarity_matrix.length - 1) / 2} Pair Comparisons</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Critical Matches (≥70%)</p>
                <p className="text-2xl font-bold text-rose-600">{report.critical_matches_count}</p>
                <p className="text-[10px] text-rose-400">Immediate Action Required</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Paraphrasing Engine</p>
                <p className="text-2xl font-bold text-purple-600">Active</p>
                <p className="text-[10px] text-purple-500">Dense Sentence Embeddings</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">OCR Extraction</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {report.extraction_summary.filter(e => e.method.toLowerCase().includes('ocr') || e.method.toLowerCase().includes('vision')).length} Scans
                </p>
                <p className="text-[10px] text-emerald-600">Apple Vision Live Text</p>
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex border-b border-slate-200 gap-4">
            <button
              onClick={() => setActiveTab('pairs')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'pairs'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Flagged Peer Pairs ({report.flagged_pairs.length})
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'matrix'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Similarity Heatmap Matrix (N×N)
            </button>

            <button
              onClick={() => setActiveTab('extraction')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'extraction'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              OCR &amp; Extraction Audit
            </button>
          </div>

          {/* TAB 1: FLAGGED PAIRS LIST */}
          {activeTab === 'pairs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Showing pairwise comparisons with verbatim &amp; semantic paraphrase metrics:
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Filter:</span>
                  {(['ALL', 'CRITICAL', 'MODERATE'] as const).map(sev => (
                    <button
                      key={sev}
                      onClick={() => setFilterSeverity(sev)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        filterSeverity === sev
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredPairs.map((pair, idx) => (
                  <div
                    key={idx}
                    className={`bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
                      pair.severity === 'CRITICAL'
                        ? 'border-rose-300 bg-rose-50/20'
                        : pair.severity === 'MODERATE'
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              pair.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : pair.severity === 'MODERATE'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {pair.similarity_percentage}% Plagiarism Risk ({pair.severity})
                          </span>

                          {pair.metrics && (
                            <>
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Verbatim Overlap: {pair.metrics.sentence_overlap}%
                              </span>
                              {pair.metrics.paraphrase_count !== undefined && pair.metrics.paraphrase_count > 0 && (
                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                                  <Brain className="w-3 h-3" />
                                  <span>{pair.metrics.paraphrase_count} Paraphrased Sentence{pair.metrics.paraphrase_count > 1 ? 's' : ''} Detected</span>
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <span className="text-indigo-600 truncate max-w-sm">{pair.doc_a}</span>
                          <span className="text-slate-400">&harr;</span>
                          <span className="text-indigo-600 truncate max-w-sm">{pair.doc_b}</span>
                        </div>

                        {/* Top Overlapping Snippet */}
                        {pair.overlapping_passages.length > 0 && (
                          <div className="mt-2 text-xs text-slate-600 bg-white/90 p-3 rounded-lg border border-slate-200 space-y-1">
                            <span className="font-semibold text-slate-700 block">Exact Copy Match:</span>
                            <p className="italic text-slate-800 line-clamp-2">
                              &ldquo;{pair.overlapping_passages[0].matched_text}&rdquo;
                            </p>
                          </div>
                        )}

                        {/* Top Paraphrased Snippet if any */}
                        {pair.paraphrased_passages && pair.paraphrased_passages.length > 0 && (
                          <div className="mt-2 text-xs text-purple-950 bg-purple-50/80 p-3 rounded-lg border border-purple-200 space-y-1">
                            <div className="flex items-center justify-between font-semibold text-purple-800">
                              <span className="flex items-center gap-1">
                                <Shuffle className="w-3.5 h-3.5" />
                                <span>Paraphrased Rewrite ({pair.paraphrased_passages[0].semantic_score}% Semantic Confidence)</span>
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px]">
                              <strong>A:</strong> &ldquo;{pair.paraphrased_passages[0].doc_a_sentence}&rdquo;
                            </p>
                            <p className="text-purple-900 text-[11px]">
                              <strong>B:</strong> &ldquo;{pair.paraphrased_passages[0].doc_b_sentence}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPair(pair);
                          setModalTab(pair.paraphrased_passages && pair.paraphrased_passages.length > 0 && pair.overlapping_passages.length === 0 ? 'paraphrased' : 'verbatim');
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Overlap</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE MATRIX HEATMAP */}
          {activeTab === 'matrix' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
              <h3 className="text-sm font-bold text-slate-800 mb-2">
                Pairwise Plagiarism Risk Matrix (Containment + Paraphrase Similarity %)
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Hover or click any cell to inspect the comparison between Student A and Student B.
              </p>

              <div className="inline-block min-w-full">
                <table className="border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 border border-slate-200 bg-slate-50 text-left font-semibold text-slate-600">
                        Assignments
                      </th>
                      {report.document_names.map((name, i) => (
                        <th 
                          key={i} 
                          className="p-2 border border-slate-200 bg-slate-50 font-semibold text-slate-600 max-w-[120px] truncate"
                          title={name}
                        >
                          #{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.similarity_matrix.map((row, i) => (
                      <tr key={i}>
                        <td className="p-2 border border-slate-200 bg-slate-50 font-semibold text-slate-700 max-w-[180px] truncate">
                          #{i + 1}. {report.document_names[i]}
                        </td>
                        {row.map((score, j) => {
                          const isSelf = i === j;
                          const isCritical = score >= 70 && !isSelf;
                          const isModerate = score >= 40 && score < 70 && !isSelf;

                          return (
                            <td
                              key={j}
                              className={`p-2.5 border border-slate-200 text-center font-bold transition-all ${
                                isSelf
                                  ? 'bg-slate-100 text-slate-400'
                                  : isCritical
                                  ? 'bg-rose-500/20 text-rose-700 border-rose-300 cursor-pointer hover:bg-rose-500/30'
                                  : isModerate
                                  ? 'bg-amber-500/20 text-amber-700 border-amber-300 cursor-pointer hover:bg-amber-500/30'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                              onClick={() => {
                                if (!isSelf) {
                                  const targetPair = report.flagged_pairs.find(
                                    p => (p.doc_a === report.document_names[i] && p.doc_b === report.document_names[j]) ||
                                         (p.doc_a === report.document_names[j] && p.doc_b === report.document_names[i])
                                  );
                                  if (targetPair) setSelectedPair(targetPair);
                                }
                              }}
                              title={!isSelf ? `Click to inspect: ${report.document_names[i]} vs ${report.document_names[j]}` : 'Self comparison'}
                            >
                              {score}%
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EXTRACTION & OCR AUDIT */}
          {activeTab === 'extraction' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  Document Parsing &amp; Optical Character Recognition (OCR) Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect the exact text extracted from handwritten photos, scanned documents, and digital PDFs.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5 text-xs">
                {report.extraction_summary.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{item.filename}</p>
                          <p className="text-[10px] text-slate-500">{item.word_count} words extracted</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        item.method.toLowerCase().includes('neural') || item.method.toLowerCase().includes('vision')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.method.toLowerCase().includes('ocr')
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {item.method}
                      </span>
                    </div>

                    {item.text_preview && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                        {item.text_preview}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON MODAL */}
      <AnimatePresence>
        {selectedPair && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
            >
              {/* MODAL HEADER */}
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedPair.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 border border-rose-300'
                        : 'bg-amber-100 text-amber-700 border border-amber-300'
                    }`}>
                      {selectedPair.similarity_percentage}% Plagiarism Risk ({selectedPair.severity})
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      Detailed Overlap &amp; Paraphrase Inspection
                    </h3>
                  </div>
                  {selectedPair.metrics && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 flex-wrap">
                      <span><strong>Verbatim Overlap:</strong> {selectedPair.metrics.sentence_overlap}%</span>
                      <span>&bull;</span>
                      <span><strong>Phrase Containment:</strong> {selectedPair.metrics.phrase_containment}%</span>
                      <span>&bull;</span>
                      <span><strong>Paraphrased Sentences:</strong> {selectedPair.metrics.paraphrase_count || 0}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPair(null)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* MODAL SUB-TABS */}
              <div className="flex border-b border-slate-200 bg-white px-6 pt-3 gap-6 text-xs font-bold">
                <button
                  onClick={() => setModalTab('verbatim')}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
                    modalTab === 'verbatim'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Verbatim Copy Matching ({selectedPair.overlapping_passages.length})</span>
                </button>

                <button
                  onClick={() => setModalTab('paraphrased')}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
                    modalTab === 'paraphrased'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Paraphrased &amp; AI Rephrased ({selectedPair.paraphrased_passages?.length || 0})</span>
                </button>
              </div>

              {/* MODAL CONTENT: TAB 1 VERBATIM DUAL COLUMN */}
              {modalTab === 'verbatim' && (
                <>
                  {selectedPair.overlapping_passages.length > 0 && (
                    <div className="bg-amber-50/60 border-b border-amber-200/60 p-3 px-6 text-xs">
                      <p className="font-bold text-amber-900 mb-1">
                        Exact Verbatim Passages ({selectedPair.overlapping_passages.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPair.overlapping_passages.map((snip, idx) => (
                          <span 
                            key={idx}
                            className="bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded border border-amber-300 truncate max-w-md font-mono"
                          >
                            &ldquo;{snip.matched_text.slice(0, 75)}...&rdquo;
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 flex-1 overflow-y-auto p-4 sm:p-6 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800 truncate">{selectedPair.doc_a}</p>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">Doc A</span>
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-200 h-80 overflow-y-auto whitespace-pre-wrap">
                        {selectedPair.doc_a_text || <span className="text-slate-400 italic">Extracted document content</span>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800 truncate">{selectedPair.doc_b}</p>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">Doc B</span>
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-200 h-80 overflow-y-auto whitespace-pre-wrap">
                        {selectedPair.doc_b_text || <span className="text-slate-400 italic">Extracted document content</span>}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* MODAL CONTENT: TAB 2 PARAPHRASED SENTENCES TABLE */}
              {modalTab === 'paraphrased' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs text-purple-900 leading-relaxed">
                    <strong>How Semantic Paraphrasing Works:</strong> These sentences share low literal word overlap, but our deep language model (Sentence-Transformers MiniLM) mapped them to the same semantic vector coordinates, indicating synonym replacement or AI restructuring.
                  </div>

                  {selectedPair.paraphrased_passages && selectedPair.paraphrased_passages.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPair.paraphrased_passages.map((para, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-purple-200 bg-white shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                              {para.semantic_score}% Semantic Equivalence
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Lexical String Match: {para.lexical_similarity}% (Rewritten)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <p className="font-bold text-slate-700 text-[10px] uppercase mb-1">Doc A Sentence:</p>
                              <p className="text-slate-800 leading-relaxed">&ldquo;{para.doc_a_sentence}&rdquo;</p>
                            </div>

                            <div className="bg-purple-50/60 p-3 rounded-lg border border-purple-200">
                              <p className="font-bold text-purple-800 text-[10px] uppercase mb-1">Doc B Rewrite:</p>
                              <p className="text-purple-950 leading-relaxed">&ldquo;{para.doc_b_sentence}&rdquo;</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                      <Brain className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-600">No Paraphrased Sentences Detected</p>
                      <p className="max-w-md mx-auto">
                        This pair appears to be predominantly exact verbatim copy-pasting rather than rephrased content.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Sentence-Transformers (MiniLM) + Broder Containment + SequenceMatcher
                </span>
                <button
                  onClick={() => setSelectedPair(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
