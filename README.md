# 🛡️ VivaGuard: Adaptive AI Oral Defense & Authentic Comprehension Platform

> **An end-to-end assignment plagiarism detection, authentic authorship verification, and automated AI viva voce examination platform.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-yellow?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-Academic-green)]()

---

## 📌 Problem Statement: The Assignment Plagiarism Crisis

With the advent of Large Language Models (LLMs) like GPT-4, Claude, and Gemini, traditional assignment evaluation has collapsed:
1. **Statistical AI Detectors Fail:** Commercial AI checkers (evaluating perplexity/burstiness) have false-positive rates exceeding **61% on non-native English writing** (Liang et al., 2023) and are easily evaded with paraphrasing tools like QuillBot.
2. **Contract Cheating & Ghostwriting:** Conventional text-matching tools (Turnitin) cannot detect newly generated or purchased assignments.
3. **Faculty Scaling Bottleneck:** Manual oral examinations (*viva voce*) are the gold standard for verifying authentic understanding, but scheduling individual 20-minute interviews for hundreds of students is unfeasible for professors.

---

## 💡 The VivaGuard Solution

**VivaGuard** transforms assignment evaluation by shifting the focus from static text scanning to **interactive, document-grounded oral defense**:
- **Plagiarism & Similarity Detection:** High-speed document parsing, text similarity analysis, and native OCR for handwritten/scanned PDF submissions.
- **Dynamic AI Viva Voce:** The system ingests the student's submission, extracts key claims, formulas, and code snippets, and initiates an adaptive oral examination.
- **Multimodal Web & Mobile App:** Students complete the oral defense via a browser or camera-enabled mobile wrapper app, ensuring real-time identity and engagement verification.
- **Tiered Cognitive Probing:** Follows Bloom’s Taxonomy (*Recall ➔ Justification ➔ Adversarial "What-If" Stress Testing*).
- **Professor Evaluation Dashboard:** Automatically generates comprehensive audit reports with transcripts, claim-verification coverage, plagiarism metrics, and recommended grades.

---

## 🏗️ System Architecture

```
                  ┌─────────────────────────────────────┐
                  │      Student Assignment Submission  │
                  │        (PDF / DOCX / Code / OCR)    │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │    Ingestion & Similarity Pipeline  │
                  │  • Python OCR Engine (Vision Swift) │
                  │  • Text Extraction & Plagiarism Map │
                  │  • Knowledge Graph Extraction       │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │   Document-Grounded RAG Engine      │
                  │  • Strict context anchoring         │
                  │  • Anti-hallucination guardrails    │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────────┐
        │  Web Platform & Mobile App (Camera + Mic Access)       │
        │  • Live facial presence & gaze proctoring              │
        │  • Real-time speech-to-text audio streaming            │
        │  • Adaptive 3-Stage Socratic Viva Voce                 │
        │    - Stage 1: Basic Concept Recall                    │
        │    - Stage 2: Methodological Justification            │
        │    - Stage 3: Adversarial "What-If" / Edge Cases       │
        └────────────────────────────┬───────────────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │     Professor Audit & Grade Report  │
                  │  • Plagiarism & similarity score    │
                  │  • Claim verification coverage %    │
                  │  • Timestamped transcript & flags   │
                  └─────────────────────────────────────┘
```

---

## 🚀 Key Features

* **🔍 Plagiarism & Code Similarity Detector:** In-depth similarity comparison between student submissions and reference corpora, highlighting paraphrased sections and code structure duplication.
* **📱 Web & Mobile Camera-Enabled App:** Responsive interface with native camera and microphone integration, designed for both desktop web and mobile wrappers (iOS/Android WebView).
* **🧠 Adaptive Socratic Questioning:** Generates dynamic, contextual follow-up questions tailored directly to what the student writes and says—preventing rehearsed or scripted answers.
* **⚡ Native OCR Pipeline:** Integrated macOS Apple Vision OCR engine (`mac_vision_ocr.swift`) for high-accuracy text extraction from handwritten notes, diagrams, and scanned assignments.
* **📊 Comprehensive Faculty Dashboard:** Instructors can review assignments, inspect flagged plagiarism similarities, listen to student viva audio, read transcripts, and verify authenticity scores.

---

## 📂 Project Structure

```bash
SP-PROJECT/
├── backend/                             # Python Backend & OCR Services
│   ├── main.py                          # FastAPI server endpoints
│   ├── ocr_pipeline.py                  # Document & image OCR processing
│   ├── similarity_engine.py             # Plagiarism & semantic similarity calculation
│   └── mac_vision_ocr.swift             # Native Apple Vision OCR helper
├── src/                                 # Next.js Frontend Application
│   ├── app/
│   │   ├── layout.tsx                   # Main HTML layout & providers
│   │   ├── page.tsx                     # Primary dashboard router
│   │   ├── globals.css                  # Tailwind styles
│   │   └── api/extract-document/        # Document extraction API route
│   ├── components/
│   │   ├── LandingPage.tsx              # Platform landing page
│   │   ├── Navbar.tsx                   # Top navigation bar
│   │   ├── plagiarism/
│   │   │   └── PlagiarismDetectorView.tsx # Assignment plagiarism detection view
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx     # Student portal
│   │   │   ├── LiveVivaRoom.tsx         # Live viva room with camera/mic access
│   │   │   ├── StudentResultsView.tsx   # Detailed student viva results
│   │   │   └── FileUploadModal.tsx      # Submission upload modal
│   │   └── professor/
│   │       ├── ProfessorDashboard.tsx   # Faculty portal
│   │       ├── SubmissionReportView.tsx # Comprehensive student audit report
│   │       └── AssignmentCreatorModal.tsx# Create assignments modal
│   └── lib/
│       ├── types.ts                     # TypeScript definitions
│       ├── viva-engine.ts               # Socratic question engine & scoring
│       ├── knowledge-map-extractor.ts   # Document concept map generator
│       └── demo-data.ts                 # Demo assignments, students & evaluations
├── generate_icfai_midterm_report.py     # Academic midterm report generator script
├── package.json                         # Node dependencies & scripts
├── tailwind.config.js                   # Tailwind CSS configuration
└── tsconfig.json                        # TypeScript configuration
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: 3.10 or higher
- **Package Manager**: `npm` or `yarn`

### 1. Frontend Setup (Next.js)
```bash
# Clone the repository
git clone https://github.com/yashwanthkrishna17/SP-PROJECT.git
cd SP-PROJECT

# Install Node dependencies
npm install

# Start the Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Backend Setup (FastAPI & OCR)
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install required Python packages
pip install fastapi uvicorn pydantic scikit-learn PyMuPDF

# Launch the backend server
python3 main.py
```
The backend API will run on [http://localhost:8000](http://localhost:8000).

---

## 📖 Evaluation Flow

1. **Upload Assignment:** The student submits an essay, research paper, or programming assignment (PDF/Docx/Code).
2. **Analysis & Indexing:** The system scans for plagiarism/similarity and extracts key concepts, method justifications, and technical claims.
3. **Camera-Enabled Live Viva:** The student enters the Live Viva Room on the web or mobile app. The camera verifies presence while the AI conducts an adaptive 5-minute oral defense.
4. **Faculty Review:** The professor accesses the submission report, reviewing the similarity index, viva transcript, and authenticity score to finalize grades with one click.

---

## 👥 Authors & Academic Affiliation

* **Nagulavaram Yashwanth Krishna** (Enrolment No: `24STUCHH010864`)
* **Department of Computer Science & Engineering**
* **Faculty of Science & Technology (FST)**
* **The ICFAI Foundation for Higher Education (IFHE), Hyderabad**

---

## 📄 License
This project is developed for academic evaluation and research purposes under the Special Project curriculum at ICFAI Tech.
