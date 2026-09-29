import sys
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image as RLImage
)
from reportlab.pdfgen import canvas
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

LOGO_PATH = "/Users/yashwanthkrishna/SP project/icfaitech_logo.png"

# ==============================================================================
# COMMON CONSTANTS & DATA
# ==============================================================================

DFD_ASCII = (
    "+-------------------+        Submits Manuscript (PDF/DOCX)        +--------------------------------+\n"
    "|      STUDENT      | =========================================> |                                |\n"
    "|                   | <----------------------------------------- |  VivaGuard Platform            |\n"
    "|                   |        Adaptive Voice Prompts (TTS)        |  (Document Parsing &           |\n"
    "|                   | =========================================> |   Knowledge Map Extractor)     |\n"
    "|                   |        Student Voice Audio Stream (STT)    |                                |\n"
    "+-------------------+                                            +--------------------------------+\n"
    "                                                                                 ||\n"
    "                                                                      Synthesizes Structured Pool\n"
    "                                                                      (8 Grounded Question Categories)\n"
    "                                                                                 \\/\n"
    "+-------------------+        Evidence Dossier & Transcripts      +--------------------------------+\n"
    "|     PROFESSOR     | <========================================= |  Adaptive Viva Engine &        |\n"
    "|                   | -----------------------------------------> |  Multi-Dimensional Evaluator   |\n"
    "|                   |        Manual Score Overrides & Approval   |  (6 Cognitive Dimensions)      |\n"
    "+-------------------+                                            +--------------------------------+"
)

SEQ_ASCII = (
    " Student (Client)           Viva Engine (Server)        Knowledge Base         Evaluator\n"
    "     |                              |                          |                   |\n"
    "     |--- 1. Connects & Starts ---->|                          |                   |\n"
    "     |                              |--- 2. Fetch Q1 Pool ---->|                   |\n"
    "     |                              |<-- 3. Grounded Q1 -------|                   |\n"
    "     |<-- 4. Audio Prompt (TTS) ----|                          |                   |\n"
    "     |                              |                          |                   |\n"
    "     |=== 5. Speaks Response ======>|                          |                   |\n"
    "     |    (Audio Stream)            |--- 6. Transcribe (STT) --+                   |\n"
    "     |                              |--- 7. Evaluate Answer ---------------------->|\n"
    "     |                              |<-- 8. Cognitive Scores & Follow-up Trigger --|\n"
    "     |<-- 9. Dynamic Follow-up -----|                          |                   |\n"
    "     |                              |                          |                   |"
)

REFERENCES_LIST = [
    "Anderson, L. W., & Krathwohl, D. R. (2001). <i>A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom's Taxonomy of Educational Objectives</i>. New York: Longman.",
    "Bloom, B. S., Engelhart, M. D., Furst, E. J., Hill, W. H., & Krathwohl, D. R. (1956). <i>Taxonomy of Educational Objectives: The Classification of Educational Goals. Handbook I: Cognitive Domain</i>. New York: David McKay Company.",
    "Brown, S., & Knight, P. (1994). <i>Assessing Learners in Higher Education</i>. London: Kogan Page.",
    "Dawson, P., & Sutherland-Smith, W. (2018). Can markers detect contract cheating? Results from a software following empirical study. <i>Assessment & Evaluation in Higher Education</i>, 43(6), 920-930.",
    "Gao, Y., Xiong, Y., Wang, X., Wang, K., Jiang, Z., et al. (2023). Retrieval-augmented generation for large language models: A survey. <i>arXiv preprint arXiv:2312.10997</i>.",
    "Joughin, G. (1998). Dimensions of oral assessment. <i>Assessment & Evaluation in Higher Education</i>, 23(4), 367-378.",
    "Joughin, G. (2010). The sound of learning: Why listening to students in oral assessment improves learning and pedagogy. <i>Assessment & Evaluation in Higher Education</i>, 35(5), 587-598.",
    "Krishna, K., Song, Y., Karpinska, M., Wieting, J., & Iyyer, M. (2023). Paraphrasing evades detector watermarks in language models. <i>arXiv preprint arXiv:2303.13408</i>.",
    "Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., et al. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. <i>Advances in Neural Information Processing Systems (NeurIPS)</i>, 33, 9459-9474.",
    "Liang, W., Yuksekgonul, M., Mao, Y., Wu, E., & Zou, J. (2023). GPT detectors are biased against non-native English writers. <i>Patterns (Cell Press)</i>, 4(7), 100779.",
    "Sadasivan, V. S., Kumar, A., Balasubramanian, S., Wang, W., & Feizi, S. (2023). Can AI-generated text be reliably detected? <i>arXiv preprint arXiv:2303.11156</i>.",
    "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I. (2017). Attention is all you need. <i>Advances in Neural Information Processing Systems (NeurIPS)</i>, 30, 5998-6008."
]

MATRIX_ROWS = [
    ("Evaluation Dimension", "Statistical Text Detectors", "Traditional Oral Viva", "VivaGuard Platform (Proposed)"),
    ("Core Mechanism", "Statistical n-gram & perplexity scanning", "Manual face-to-face dialogue", "Document-grounded adaptive voice AI"),
    ("Primary Deliverable", "Accusatory probability score (%)", "Subjective pass/fail consensus", "Evidence Dossier + 6D Cognitive Scores"),
    ("Evidence Grounding", "None (Static token predictions)", "Faculty memory & manuscript notes", "Exact Page & Paragraph Citations"),
    ("Scalability (100+ Cohorts)", "High (Batch instant scan)", "Severely Low (40+ faculty hours)", "High (Automated concurrent vivas)"),
    ("Non-Native Demographic Bias", "Severe (>61% false positives)", "Low to Moderate", "Low (Evaluates conceptual logic)"),
    ("Resistance to Ghostwriting", "Zero (Scans submitted text only)", "Absolute (Exposes proxy authors)", "High (Spontaneous live oral defense)")
]

RUBRIC_ROWS = [
    ("Cognitive Dimension", "Weight", "Target Assessment Criteria"),
    ("Conceptual Understanding", "30%", "Comprehension of fundamental theory, definitions, and problem space."),
    ("Methodology Defense", "20%", "Ability to justify algorithmic, architectural, and data choices over alternatives."),
    ("Analytical Reasoning", "15%", "Logical clarity in explaining causal relationships and experimental trade-offs."),
    ("Critical Thinking", "15%", "Awareness of submission limitations, edge cases, and future research vectors."),
    ("Submission Familiarity", "15%", "Detailed recall and knowledge of exact sections, citations, and formulas in the paper."),
    ("Oral Communication", "5%", "Clarity, conciseness, and precision of verbal technical terminology.")
]

# ==============================================================================
# REPORTLAB PDF GENERATION
# ==============================================================================

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress headers/footers on title cover page

        self.saveState()
        self.setFont("Times-Roman", 9)
        self.setFillColor(colors.HexColor("#4A5568"))

        # Header on pages 3+
        if self._pageNumber >= 3:
            self.drawString(54, 842 - 36, "Special Project Mid-term Report: VivaGuard Oral Defense Platform")
            self.drawRightString(595 - 54, 842 - 36, "ICFAI Faculty of Science & Technology")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 842 - 42, 595 - 54, 842 - 42)

        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(595 - 54, 36, page_str)
        self.drawString(54, 36, "Department of Computer Science & Engineering • IcfaiTech, IFHE Hyderabad")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 46, 595 - 54, 46)

        self.restoreState()


def build_pdf(output_pdf_path):
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    cover_title_a = ParagraphStyle(
        'CoverTitleA',
        fontName='Times-Bold',
        fontSize=15,
        leading=18,
        alignment=1,
        textColor=colors.black,
        spaceAfter=10
    )

    cover_project_title = ParagraphStyle(
        'CoverProjectTitle',
        fontName='Times-Bold',
        fontSize=18,
        leading=22,
        alignment=1,
        textColor=colors.HexColor('#002D62'),
        spaceAfter=12
    )

    cover_meta_bold = ParagraphStyle(
        'CoverMetaBold',
        fontName='Times-Bold',
        fontSize=12,
        leading=16,
        alignment=1,
        textColor=colors.black
    )

    cover_meta_reg = ParagraphStyle(
        'CoverMetaReg',
        fontName='Times-Roman',
        fontSize=12,
        leading=16,
        alignment=1,
        textColor=colors.black
    )

    toc_title = ParagraphStyle(
        'TOCTitle',
        fontName='Times-Bold',
        fontSize=14,
        leading=18,
        alignment=1,
        spaceAfter=14
    )

    toc_cell = ParagraphStyle(
        'TOCCell',
        fontName='Times-Roman',
        fontSize=11,
        leading=15,
        textColor=colors.black
    )

    toc_page_num = ParagraphStyle(
        'TOCPageNum',
        fontName='Times-Roman',
        fontSize=11,
        leading=15,
        alignment=1,
        textColor=colors.black
    )

    h1_style = ParagraphStyle(
        'H1',
        fontName='Times-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.black,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        fontName='Times-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'H3',
        fontName='Times-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#334155'),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        fontName='Times-Roman',
        fontSize=12,
        leading=16,
        textColor=colors.black,
        spaceAfter=8,
        alignment=4
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        fontName='Times-Roman',
        fontSize=11.5,
        leading=15.5,
        textColor=colors.black,
        leftIndent=18,
        firstLineIndent=-10,
        spaceAfter=4,
        alignment=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Times-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.white,
        alignment=1
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Times-Roman',
        fontSize=9.5,
        leading=12.5,
        textColor=colors.black
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        fontName='Times-Bold',
        fontSize=9.5,
        leading=12.5,
        textColor=colors.black
    )

    guideline_note_style = ParagraphStyle(
        'GuidelineNote',
        fontName='Times-Roman',
        fontSize=11,
        leading=15,
        textColor=colors.black
    )

    elements = []

    # =========================================================================
    # PAGE 1: COVER PAGE
    # =========================================================================
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("A", cover_title_a))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("Special Project Mid-term Report", cover_title_a))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("on", cover_meta_bold))
    elements.append(Spacer(1, 16))

    elements.append(Paragraph(
        "VivaGuard: Adaptive AI Oral Defense and Authentic Comprehension Platform",
        cover_project_title
    ))
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("by", cover_meta_reg))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph("<b>NAGULAVARAM YASHWANTH KRISHNA (24STUCHH010864)</b>", cover_meta_bold))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph("Team Member 2 (Full Enrolment Number 2)", cover_meta_reg))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph("Team Member 3 (Full Enrolment Number 3)", cover_meta_reg))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph("Team Member 4 (Full Enrolment Number 4)", cover_meta_reg))
    elements.append(Spacer(1, 26))

    elements.append(Paragraph("Under the guidance of", cover_meta_reg))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("<b>Supervisor(s) Name(s)</b>", cover_meta_bold))
    elements.append(Spacer(1, 2))
    elements.append(Paragraph("with their Designation(s)", cover_meta_reg))
    elements.append(Spacer(1, 36))

    if os.path.exists(LOGO_PATH):
        logo_img = RLImage(LOGO_PATH, width=140, height=57)
        logo_img.hAlign = 'CENTER'
        elements.append(logo_img)
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("<b>Faculty of Science & Technology,</b>", cover_meta_bold))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph("<b>The ICFAI Foundation for Higher Education, Hyderabad</b>", cover_meta_bold))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("<b>September, 2026</b>", cover_meta_bold))

    elements.append(PageBreak())

    # =========================================================================
    # PAGE 2: CONTENTS TABLE
    # =========================================================================
    elements.append(Paragraph("CONTENTS", toc_title))
    elements.append(Spacer(1, 6))

    toc_data = [
        [
            Paragraph("<b>Project Title Page</b>", toc_cell),
            Paragraph("1", toc_page_num)
        ],
        [
            Paragraph(
                "<b>1. Introduction</b><br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;1.1. Problem Definition<br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;1.2. Objective(s) of the Project<br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;1.3. Limitations of the Project",
                toc_cell
            ),
            Paragraph("3", toc_page_num)
        ],
        [
            Paragraph(
                "<b>2. Literature Survey</b><br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;2.1. Existing System<br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;2.2. Limitations of Existing System",
                toc_cell
            ),
            Paragraph("5", toc_page_num)
        ],
        [
            Paragraph(
                "<b>3. Proposed System - Methodology (Tools and Technologies)</b><br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;3.1 System Architecture / Data flow diagrams<br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;3.2 System Requirements &amp; Specification<br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a. Software requirements<br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b. Hardware requirements<br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;c. Data requirements (Inputs and Expected Outputs)<br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d. Description of Modules<br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;e. UML Diagrams",
                toc_cell
            ),
            Paragraph("7", toc_page_num)
        ],
        [
            Paragraph("<b>4. Initial Implementation (Optional)</b>", toc_cell),
            Paragraph("11", toc_page_num)
        ],
        [
            Paragraph("<b>5. References</b>", toc_cell),
            Paragraph("12", toc_page_num)
        ],
    ]

    toc_table = Table(toc_data, colWidths=[427, 60])
    toc_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(toc_table)
    elements.append(Spacer(1, 24))

    elements.append(Paragraph("<b>Note: Please prepare the report as per the following guidelines for the text content.</b>", guideline_note_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("<b>Font: Times New Roman</b>", guideline_note_style))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph("<b>All Headings: Font size 14 pts</b>", guideline_note_style))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph("<b>All Text: Font size 12 pts</b>", guideline_note_style))

    elements.append(PageBreak())

    # =========================================================================
    # PAGE 3: SECTION 1 - INTRODUCTION
    # =========================================================================
    elements.append(Paragraph("1. Introduction", h1_style))
    elements.append(Paragraph(
        "The accelerating capability and widespread adoption of generative artificial intelligence (GenAI) and Large Language "
        "Models (LLMs) such as GPT-4, Claude, and Gemini have fundamentally disrupted traditional paradigms of higher education assessment. "
        "Undergraduate and postgraduate students can now synthesize highly articulate essays, literature surveys, source code implementations, "
        "and empirical research manuscripts within seconds. While these tools hold tremendous potential as intellectual accelerators, "
        "they have concurrently eroded the evidentiary value of written submissions as definitive proof of authentic student learning.",
        body_style
    ))
    elements.append(Paragraph(
        "Historically, educational institutions deployed text-scanning mechanisms and statistical classification algorithms to uphold "
        "academic integrity. However, contemporary research confirms that statistical AI detectors suffer from severe false-positive biases "
        "and can be bypassed through simple paraphrasing, leaving academic evaluators caught between unreliable accusations and unmonitored "
        "plagiarism. To restore credibility and diagnostic rigor to academic evaluations, this Special Project introduces <b>VivaGuard</b>: "
        "an evidence-based, document-grounded oral defense platform that automates the orchestration of authentic oral examinations (<i>viva voce</i>) "
        "while maintaining rigorous human-in-the-loop faculty governance.",
        body_style
    ))

    # 1.1 Problem Definition
    elements.append(Paragraph("1.1. Problem Definition", h2_style))
    elements.append(Paragraph(
        "Contemporary academic evaluation faces a systemic crisis defined by three interconnected challenges:",
        body_style
    ))
    elements.append(Paragraph(
        "• <b>Fragility and Inequity of Statistical AI Detection:</b> Commercial AI detectors compute statistical token perplexity "
        "and burstiness to assign an accusatory percentage (e.g., '87% AI-generated'). Empirical studies (Liang et al., 2023) "
        "demonstrate that these classifiers misclassify authentic human essays by non-native English writers at rates exceeding 61%, "
        "creating profound demographic penalties and damaging student-faculty trust without pedagogical justification.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Adversarial Vulnerability and Contract Cheating:</b> As proven by Sadasivan et al. (2023) and Krishna et al. (2023), "
        "statistical boundaries deteriorate rapidly when text undergoes light paraphrasing or prompt transformation. Furthermore, "
        "written artifacts can be outsourced through contract cheating services, rendering passive text analysis incapable of verifying "
        "whether the enrolled student personally understands or authored the delivered material.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>The Scalability Barrier of Oral Defenses:</b> Oral examinations (<i>viva voce</i>) represent the pedagogical gold standard "
        "for authentic comprehension assessment because spontaneous oral defense cannot be proxied or outsourced. However, conducting "
        "individual 15-to-30 minute oral vivas across cohorts of 100+ students requires hundreds of faculty hours, rendering comprehensive "
        "oral assessment logistically impossible for mid-term coursework and term projects.",
        bullet_style
    ))

    # 1.2 Objectives
    elements.append(Paragraph("1.2. Objective(s) of the Project", h2_style))
    elements.append(Paragraph(
        "The overarching objective of the VivaGuard project is to build an automated, document-grounded oral defense platform "
        "that empowers educational institutions to evaluate authentic student understanding with speed, rigor, and equity. The specific "
        "technical and pedagogical objectives are:",
        body_style
    ))
    elements.append(Paragraph(
        "1. <b>Automated Submission Knowledge Graph Construction:</b> To design and implement an extraction pipeline capable of parsing "
        "unstructured academic manuscripts (PDF, DOCX, TXT) and decomposing them into a structured Submission Knowledge Map encompassing "
        "core claims, empirical methodologies, datasets, algorithmic logic, cited authorities, and key findings.",
        bullet_style
    ))
    elements.append(Paragraph(
        "2. <b>Document-Grounded Question Synthesis:</b> To generate an 8-category question pool (encompassing Conceptual Understanding, "
        "Methodology Defense, Practical Application, Reasoning, Critical Thinking, Citation Verification, Deep Dives, and Contradiction Testing) "
        "where every candidate question is deterministically anchored to exact page and paragraph citations from the student's submission.",
        bullet_style
    ))
    elements.append(Paragraph(
        "3. <b>Real-Time Adaptive Voice Examination Engine:</b> To construct a conversational voice agent utilizing low-latency "
        "Speech-to-Text (STT) and natural Text-to-Speech (TTS) pipelines to conduct a 3-to-10 minute oral defense that dynamically adjusts question "
        "depth and triggers contextual follow-ups based on the student's verbal explanations.",
        bullet_style
    ))
    elements.append(Paragraph(
        "4. <b>Multi-Dimensional Cognitive Evaluation:</b> To implement a multi-faceted evaluation model assessing candidate responses across "
        "six weighted dimensions: Conceptual Understanding (30%), Methodology (20%), Reasoning (15%), Critical Thinking (15%), "
        "Submission Familiarity (15%), and Oral Communication Clarity (5%).",
        bullet_style
    ))
    elements.append(Paragraph(
        "5. <b>Human-in-the-Loop Faculty Governance:</b> To provide professors with an interactive evidence verification dashboard featuring "
        "timestamped audio replay, verbatim transcripts, side-by-side manuscript excerpts, automated anomaly flags, and manual grade override controls.",
        bullet_style
    ))

    # 1.3 Limitations
    elements.append(Paragraph("1.3. Limitations of the Project", h2_style))
    elements.append(Paragraph(
        "While VivaGuard offers an innovative paradigm for academic assessment, several operational limitations are recognized:",
        body_style
    ))
    elements.append(Paragraph(
        "• <b>Acoustic and Hardware Variability:</b> Ambient acoustic noise, poor-quality microphone hardware, or packet loss over "
        "unstable internet connections can introduce speech-to-text transcription artifacts during live oral examinations.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Parsing Complex Multimodal Submissions:</b> Hand-drawn diagrams, non-OCR scanned documents, and specialized mathematical "
        "notations (LaTeX equations) require specialized multi-modal vision models and may not achieve full structural decomposition in initial releases.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Real-Time Conversational Latency:</b> Orchestrating chained STT processing, LLM context generation, and audio stream synthesis "
        "requires stringent edge caching and optimized API responses to maintain natural conversational turn-taking under 1.5 seconds.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Advisory Nature of Autonomous Scoring:</b> VivaGuard is engineered strictly as an evidence-gathering and decision-support "
        "system for human faculty. It does not autonomously issue disciplinary sanctions or final course grades without professor review.",
        bullet_style
    ))

    elements.append(PageBreak())

    # =========================================================================
    # PAGE 5: SECTION 2 - LITERATURE SURVEY
    # =========================================================================
    elements.append(Paragraph("2. Literature Survey", h1_style))
    elements.append(Paragraph(
        "The literature survey reviews existing theoretical, empirical, and architectural paradigms across three foundational domains: "
        "statistical text-scanning detection systems, the pedagogical efficacy of oral viva voce examinations, and retrieval-augmented generation (RAG) "
        "for hallucination-free educational evaluation.",
        body_style
    ))

    # 2.1 Existing System
    elements.append(Paragraph("2.1. Existing System", h2_style))
    elements.append(Paragraph(
        "Contemporary academic integrity verification relies almost entirely on automated text-scanning platforms. Commercial systems "
        "such as Turnitin, CopyLeaks, GPTZero, and original OpenAI classifiers operate by processing static written submissions through "
        "statistical language models. These tools evaluate two primary metrics:",
        body_style
    ))
    elements.append(Paragraph(
        "1. <b>Perplexity:</b> A mathematical measure of how likely a sequence of tokens is under a pre-trained language model distribution. "
        "Text exhibiting low perplexity (highly predictable word transitions) is categorized as machine-generated.",
        bullet_style
    ))
    elements.append(Paragraph(
        "2. <b>Burstiness:</b> The degree of variation in sentence length and syntactic complexity across a document. Human writers naturally "
        "exhibit irregular, highly variable syntactic structures, whereas LLMs tend toward uniform sentence lengths.",
        bullet_style
    ))
    elements.append(Paragraph(
        "In parallel, traditional oral defense examinations (<i>viva voce</i>) have persisted as the pinnacle of qualitative academic defense. "
        "Rooted in ancient Socratic dialogic examination and formalized in European university statutes since the 12th century, the viva voce "
        "requires candidates to articulate, justify, and defend their research in direct conversation with subject matter experts.",
        body_style
    ))

    # 2.2 Limitations of Existing System
    elements.append(Paragraph("2.2. Limitations of Existing System", h2_style))
    elements.append(Paragraph(
        "Despite their widespread institutional adoption, existing text-scanning systems exhibit critical methodological defects:",
        body_style
    ))
    elements.append(Paragraph(
        "• <b>Severe False-Positive Bias on Non-Native English Speakers:</b> Liang et al. (2023) conducted an empirical benchmark of seven "
        "leading commercial AI detectors using human-authored essays from the international TOEFL dataset. The study revealed that over "
        "61% of authentic human essays written by non-native students were falsely flagged as AI-generated. Non-native speakers typically write "
        "with more restricted vocabulary and simpler grammatical structures, which statistical detectors mistake for low-perplexity machine text.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Adversarial Vulnerability and Paraphrasing Evasion:</b> Sadasivan et al. (2023) established theoretically that as generative "
        "models approach human writing competence, statistical discriminators inevitably decay toward random chance. Krishna et al. (2023) "
        "corroborated this empirically, demonstrating that paraphrasing tools (e.g., QuillBot) and recursive prompting render commercial AI detectors "
        "virtually ineffective.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Pedagogical Failure of Probability Scores:</b> Dawson & Sutherland-Smith (2018) highlighted that an arbitrary probability score "
        "(e.g., '78% AI Probability') provides zero diagnostic evidence regarding what the student actually learned or understands. "
        "When challenged, professors cannot point to specific factual inconsistencies, leading to protracted disputes and damaged instructional relationships.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>The Scalability Bottleneck of Manual Viva Voce:</b> While traditional oral examinations eliminate contract cheating and verify "
        "authentic comprehension (Joughin, 1998, 2010), their faculty-intensive nature restricts them to doctoral dissertations and master's theses. "
        "Conducting 20-minute viva examinations for a cohort of 120 undergraduate students requires 40 uninterrupted hours of faculty time, "
        "making it impractical for mid-term coursework.",
        bullet_style
    ))
    elements.append(Spacer(1, 6))

    # Comparative System Matrix Table
    elements.append(Paragraph("<b>Table 2.1: Comparative Synthesis Matrix of Academic Integrity Approaches</b>", h3_style))
    matrix_pdf_data = []
    for r_idx, row_vals in enumerate(MATRIX_ROWS):
        row_cells = []
        for c_idx, val in enumerate(row_vals):
            if r_idx == 0:
                row_cells.append(Paragraph(f"<b>{val}</b>", table_header_style))
            elif c_idx == 0 or c_idx == 3:
                row_cells.append(Paragraph(f"<b>{val}</b>", table_cell_bold))
            else:
                row_cells.append(Paragraph(val, table_cell_style))
        matrix_pdf_data.append(row_cells)

    t_matrix = Table(matrix_pdf_data, colWidths=[105, 122, 125, 135])
    t_matrix.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#002D62')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#94A3B8')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    elements.append(t_matrix)

    elements.append(PageBreak())

    # =========================================================================
    # PAGE 7: SECTION 3 - PROPOSED SYSTEM & METHODOLOGY
    # =========================================================================
    elements.append(Paragraph("3. Proposed System - Methodology (Tools and Technologies)", h1_style))
    elements.append(Paragraph(
        "VivaGuard shifts the paradigm from punitive text detection to affirmative oral defense. The methodology integrates "
        "modern web standards, speech synthesis, document grounding via retrieval-augmented pipelines, and an adaptive state engine "
        "to deliver a trustworthy, scalable academic assessment ecosystem.",
        body_style
    ))

    # 3.1 System Architecture & Data Flow Diagrams
    elements.append(Paragraph("3.1 System Architecture / Data flow diagrams", h2_style))
    elements.append(Paragraph(
        "VivaGuard follows a modern modular cloud architecture organized into four primary functional layers:",
        body_style
    ))
    elements.append(Paragraph(
        "• <b>Client Presentation Layer:</b> Implemented in Next.js 14, React 18, and Tailwind CSS. Provides separate, secure interfaces "
        "for students (assignment submission portal, interactive viva voice examination chamber, feedback dashboard) and faculty "
        "(assignment orchestrator, class-wide authenticity monitor, and individual evidence dossier audit view).",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Audio & Speech Processing Pipeline:</b> Leverages the Web Audio API for continuous microphone capture, visual audio waveform "
        "rendering, and silence detection. Client audio is transcribed via OpenAI Whisper STT / Web Speech recognition, while examiner prompts "
        "are vocalized using neural text-to-speech engines.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Intelligence & Orchestration Layer:</b> Houses the Knowledge Map Extractor, the Grounded Question Generator, the Adaptive Viva "
        "State Engine, and the Cognitive Rubric Evaluator. These services interact to parse manuscripts, structure question trees, guide live "
        "dialogue, and evaluate candidate comprehension.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Persistence & Verification Layer:</b> Manages relational schemas for users, assignments, submissions, knowledge map graphs, "
        "audio transcripts, and final cognitive evaluation scores.",
        bullet_style
    ))
    elements.append(Spacer(1, 4))

    elements.append(Paragraph("<b>Figure 3.1: Data Flow Diagram (DFD Level 0 & Level 1)</b>", h3_style))
    dfd_table = Table([[Paragraph(f"<pre>{DFD_ASCII}</pre>", ParagraphStyle('DFDStyle', fontName='Courier', fontSize=7.5, leading=10, textColor=colors.HexColor('#0F172A')))]], colWidths=[487])
    dfd_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#94A3B8')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(dfd_table)
    elements.append(Spacer(1, 6))

    # 3.2 System Requirements & Specification
    elements.append(Paragraph("3.2 System Requirements & Specification", h2_style))

    # a. Software requirements
    elements.append(Paragraph("<b>a. Software requirements</b>", h3_style))
    elements.append(Paragraph("• <b>Operating System:</b> Cross-platform compatible (macOS Sonoma+, Windows 11, Ubuntu 22.04 LTS).", bullet_style))
    elements.append(Paragraph("• <b>Web Development Framework:</b> Next.js 14.2.24 (App Router), React 18.3.1, TypeScript 5.x.", bullet_style))
    elements.append(Paragraph("• <b>Styling & Animation:</b> Tailwind CSS 3.4.17, Framer Motion 11.18.2, Lucide React Icons.", bullet_style))
    elements.append(Paragraph("• <b>Speech Processing:</b> Web Audio API, Web Speech Recognition API, OpenAI Whisper STT, Neural Edge TTS.", bullet_style))
    elements.append(Paragraph("• <b>Report & Document Engine:</b> Python 3.12, ReportLab 4.x, python-docx 1.2.0, PyPDF 5.x.", bullet_style))
    elements.append(Paragraph("• <b>Execution Environment:</b> Node.js v18.17+ and Python 3.10+ virtual environments.", bullet_style))

    # b. Hardware requirements
    elements.append(Paragraph("<b>b. Hardware requirements</b>", h3_style))
    elements.append(Paragraph("• <b>Client Workstation:</b> Any desktop, laptop, or tablet device equipped with standard audio I/O.", bullet_style))
    elements.append(Paragraph("• <b>Processor:</b> Dual-Core 2.0 GHz CPU or higher (Apple Silicon M-Series or Intel Core i5/i7/AMD Ryzen).", bullet_style))
    elements.append(Paragraph("• <b>Memory (RAM):</b> Minimum 4 GB RAM (8 GB RAM recommended for local model execution).", bullet_style))
    elements.append(Paragraph("• <b>Audio Peripherals:</b> Integrated or USB omnidirectional microphone and stereo speakers/headphones.", bullet_style))
    elements.append(Paragraph("• <b>Network Connectivity:</b> Stable broadband connection with minimum 5 Mbps upload/download throughput.", bullet_style))

    # c. Data requirements
    elements.append(Paragraph("<b>c. Data requirements (Inputs and Expected Outputs)</b>", h3_style))
    elements.append(Paragraph(
        "• <b>Input Data:</b> Student manuscript files in Portable Document Format (.pdf), Microsoft Word (.docx), or Plain Text (.txt); "
        "assignment parameters (course identifier, viva duration limit, rubric weights, difficulty threshold); live candidate audio streams.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Output Data:</b> Structured Submission Knowledge Map (claims, methodology nodes, citation graph); synthesized examiner voice prompts; "
        "time-indexed verbal transcripts; six-dimensional cognitive scores (0-100 scale); comprehensive evidence dossier with page/paragraph citations.",
        bullet_style
    ))

    elements.append(PageBreak())

    # d. Description of Modules
    elements.append(Paragraph("<b>d. Description of Modules</b>", h3_style))
    elements.append(Paragraph(
        "VivaGuard is composed of six interconnected functional modules:",
        body_style
    ))
    elements.append(Paragraph(
        "1. <b>Document Parsing & Knowledge Map Extractor:</b> Ingests student submissions and extracts clean structural representations. "
        "It segments text into sections, extracts empirical claims, identifies core methodology tools, catalogs cited references, "
        "and links each entity to its exact page number and paragraph offset.",
        bullet_style
    ))
    elements.append(Paragraph(
        "2. <b>Document-Grounded Question Generation Engine:</b> Synthesizes candidate questions across 8 defined typologies: "
        "<i>Understanding</i> (core thesis), <i>Methodology</i> (technical choices), <i>Defense</i> (trade-offs and limitations), "
        "<i>Application</i> (real-world scenarios), <i>Critical Thinking</i> (novel implications), <i>Citation Check</i> (verifying cited literature), "
        "<i>Deep Dive</i> (probing algorithmic specifics), and <i>Contradiction</i> (addressing incongruous statements).",
        bullet_style
    ))
    elements.append(Paragraph(
        "3. <b>Adaptive Examination State Engine:</b> Regulates the live conversational flow. It maintains an examination state machine "
        "(Idle → Active Examination → Question Delivery → Student Response Capture → Dynamic Difficulty Adjustment → Follow-up Probing → "
        "Session Conclusion). It dynamically scales question difficulty from Level 1 (Recall) to Level 5 (Evaluation) based on response quality.",
        bullet_style
    ))
    elements.append(Paragraph(
        "4. <b>Audio Streaming & Transcription Engine:</b> Provides full-duplex conversational audio. It captures microphone input, "
        "detects conversational pauses using energy thresholds, routes speech data through STT models, and streams synthetic examiner voice "
        "audio back to the candidate with sub-second latency.",
        bullet_style
    ))
    elements.append(Paragraph(
        "5. <b>Multi-Dimensional Cognitive Scoring Engine:</b> Analyzes student transcripts against document knowledge anchors. "
        "It evaluates performance across six pedagogical dimensions: Conceptual Understanding (30%), Methodology (20%), "
        "Reasoning (15%), Critical Thinking (15%), Submission Familiarity (15%), and Oral Communication (5%).",
        bullet_style
    ))
    elements.append(Paragraph(
        "6. <b>Professor Governance & Evidence Audit Console:</b> Enables educators to review cohort authenticity trends, inspect flagged "
        "discrepancies, listen to timestamped audio clips, cross-reference student claims with original submission pages, and approve or adjust grades.",
        bullet_style
    ))
    elements.append(Spacer(1, 4))

    # e. UML Diagrams
    elements.append(Paragraph("<b>e. UML Diagrams</b>", h3_style))
    elements.append(Paragraph(
        "The system's structural and behavioral characteristics are formally modeled using standard Unified Modeling Language (UML) specifications:",
        body_style
    ))

    elements.append(Paragraph("<b>1. Use Case Model:</b> Primary actors include <i>Student</i> (uploads paper, participates in adaptive oral viva, "
                              "reviews cognitive score report), <i>Professor</i> (configures assignments, monitors cohort vivas, conducts evidence audits, "
                              "applies score overrides), and <i>AI Examiner</i> (generates grounded questions, delivers speech prompts, evaluates responses).", body_style))

    elements.append(Paragraph("<b>2. Domain Class Structure:</b> Core classes include:", body_style))
    elements.append(Paragraph("• <code>User</code> (id, name, email, role: 'student' | 'professor')", bullet_style))
    elements.append(Paragraph("• <code>Assignment</code> (id, title, courseCode, vivaDurationMinutes, rubricWeights)", bullet_style))
    elements.append(Paragraph("• <code>Submission</code> (id, studentId, documentUrl, knowledgeMapId, status)", bullet_style))
    elements.append(Paragraph("• <code>KnowledgeMap</code> (id, submissionId, claims[], methodologies[], citations[], nodes[])", bullet_style))
    elements.append(Paragraph("• <code>Question</code> (id, category, difficultyLevel: 1-5, questionText, pageAnchor, paragraphAnchor)", bullet_style))
    elements.append(Paragraph("• <code>VivaSession</code> (id, submissionId, status, durationSeconds, turns[], overallScore)", bullet_style))
    elements.append(Paragraph("• <code>VivaTurn</code> (turnNumber, questionId, studentAudioUrl, transcriptText, responseDuration, scoreEvaluation)", bullet_style))
    elements.append(Paragraph("• <code>ScoreEvaluation</code> (conceptualScore, methodologyScore, reasoningScore, criticalScore, familiarityScore, communicationScore, evidenceNotes)", bullet_style))

    elements.append(Spacer(1, 4))
    elements.append(Paragraph("<b>3. Sequence Diagram (Oral Defense Turn-Taking Workflow):</b>", body_style))
    seq_table = Table([[Paragraph(f"<pre>{SEQ_ASCII}</pre>", ParagraphStyle('SeqStyle', fontName='Courier', fontSize=7.5, leading=10, textColor=colors.HexColor('#0F172A')))]], colWidths=[487])
    seq_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#94A3B8')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(seq_table)

    elements.append(PageBreak())

    # =========================================================================
    # PAGE 11: SECTION 4 - INITIAL IMPLEMENTATION
    # =========================================================================
    elements.append(Paragraph("4. Initial Implementation (Optional)", h1_style))
    elements.append(Paragraph(
        "A fully functional interactive prototype of the VivaGuard platform has been developed and verified. The software architecture "
        "is implemented using TypeScript, Next.js 14 App Router, and Tailwind CSS, featuring robust state management and real-time audio orchestration.",
        body_style
    ))

    elements.append(Paragraph("4.1 Implemented Components and Modules", h2_style))
    elements.append(Paragraph(
        "The current codebase implements the core functional requirements outlined in Section 3:",
        body_style
    ))
    elements.append(Paragraph(
        "• <b>Live Interactive Viva Chamber (<code>LiveVivaRoom.tsx</code>):</b> A production-grade student examination interface featuring "
        "real-time microphone audio capture, dynamic audio waveform visualizers, active speaker detection indicators, real-time question display, "
        "and live transcription feeds.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Knowledge Map Extraction Pipeline (<code>knowledge-map-extractor.ts</code>):</b> Core parsing algorithms that extract key claims, "
        "methodological tools, and citations from submitted documents, attaching exact page and paragraph references to each extracted entity.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Adaptive Examination State Machine (<code>viva-engine.ts</code>):</b> Manages examination progression across question categories, "
        "handles dynamic follow-up triggers when a candidate provides partial answers, and computes final multi-dimensional rubric scores.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Faculty Governance Dashboard (<code>ProfessorDashboard.tsx</code> & <code>SubmissionReportView.tsx</code>):</b> Enables professors "
        "to review cohort-wide viva completion, inspect candidate authenticity confidence indicators, listen to student audio recordings, "
        "and inspect side-by-side submission citations.",
        bullet_style
    ))
    elements.append(Paragraph(
        "• <b>Comprehensive Candidate Feedback View (<code>StudentResultsView.tsx</code>):</b> Provides students with transparent score "
        "breakdowns across the six cognitive evaluation dimensions, highlighting strengths and specific areas for conceptual improvement.",
        bullet_style
    ))

    elements.append(Paragraph("4.2 Evaluation Rubric Configuration", h2_style))
    elements.append(Paragraph(
        "The implemented scoring engine evaluates candidate performance using the normalized rubric parameters specified in Table 4.1:",
        body_style
    ))

    rubric_pdf_data = []
    for r_idx, row_vals in enumerate(RUBRIC_ROWS):
        row_cells = []
        for c_idx, val in enumerate(row_vals):
            if r_idx == 0:
                row_cells.append(Paragraph(f"<b>{val}</b>", table_header_style))
            elif c_idx == 0 or c_idx == 1:
                row_cells.append(Paragraph(f"<b>{val}</b>", table_cell_bold))
            else:
                row_cells.append(Paragraph(val, table_cell_style))
        rubric_pdf_data.append(row_cells)

    t_rubric = Table(rubric_pdf_data, colWidths=[140, 55, 292])
    t_rubric.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#002D62')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#94A3B8')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    elements.append(t_rubric)

    elements.append(PageBreak())

    # =========================================================================
    # PAGE 12: SECTION 5 - REFERENCES
    # =========================================================================
    elements.append(Paragraph("5. References", h1_style))
    elements.append(Spacer(1, 4))

    for ref in REFERENCES_LIST:
        elements.append(Paragraph(
            f"• {ref}",
            ParagraphStyle(
                'ReferenceItem',
                fontName='Times-Roman',
                fontSize=11,
                leading=15,
                textColor=colors.black,
                leftIndent=24,
                firstLineIndent=-14,
                spaceAfter=6,
                alignment=4
            )
        ))

    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"[+] PDF Report successfully generated: {output_pdf_path}")


# ==============================================================================
# DOCX GENERATION (MICROSOFT WORD EDITABLE FORMAT)
# ==============================================================================

def set_cell_border(cell, **kwargs):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = tcPr.first_child_found_in("w:tcBorders")
    if tcBorders is None:
        tcBorders = OxmlElement('w:tcBorders')
        tcPr.append(tcBorders)
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            tag = 'w:{}'.format(edge)
            element = tcBorders.find(qn(tag))
            if element is None:
                element = OxmlElement(tag)
                tcBorders.append(element)
            for key in ["sz", "val", "color", "space", "shadow"]:
                if key in edge_data:
                    element.set(qn('w:{}'.format(key)), str(edge_data[key]))

def build_docx(output_docx_path):
    doc = docx.Document()

    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)

    def add_p(text, font_size=12, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.LEFT, color_rgb=(0,0,0), space_before=0, space_after=6):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(font_size)
        run.font.bold = bold
        run.font.italic = italic
        run.font.color.rgb = RGBColor(*color_rgb)
        return p

    def add_bullet(bold_prefix, text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = 'Times New Roman'
            run_b.font.size = Pt(12)
            run_b.font.bold = True
        run_t = p.add_run(text)
        run_t.font.name = 'Times New Roman'
        run_t.font.size = Pt(12)

    # -------------------------------------------------------------------------
    # COVER PAGE
    # -------------------------------------------------------------------------
    add_p("A", font_size=16, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=6)
    add_p("Special Project Mid-term Report", font_size=16, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=6)
    add_p("on", font_size=14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=14)

    add_p(
        "VivaGuard: Adaptive AI Oral Defense and Authentic Comprehension Platform",
        font_size=18, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color_rgb=(0, 45, 98), space_after=20
    )

    add_p("by", font_size=14, bold=False, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=10)

    add_p("NAGULAVARAM YASHWANTH KRISHNA (24STUCHH010864)", font_size=13, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4)
    add_p("Team Member 2 (Full Enrolment Number 2)", font_size=12, bold=False, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4)
    add_p("Team Member 3 (Full Enrolment Number 3)", font_size=12, bold=False, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4)
    add_p("Team Member 4 (Full Enrolment Number 4)", font_size=12, bold=False, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=24)

    add_p("Under the guidance of", font_size=13, bold=False, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4)
    add_p("Supervisor(s) Name(s)", font_size=13, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4)
    add_p("with their Designation(s)", font_size=12, bold=False, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=30)

    if os.path.exists(LOGO_PATH):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_after = Pt(14)
        run_logo = p_logo.add_run()
        run_logo.add_picture(LOGO_PATH, width=Inches(1.8))

    add_p("Faculty of Science & Technology,", font_size=13, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4)
    add_p("The ICFAI Foundation for Higher Education, Hyderabad", font_size=13, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4)
    add_p("September, 2026", font_size=12, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0)

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # CONTENTS TABLE
    # -------------------------------------------------------------------------
    add_p("CONTENTS", font_size=14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=14)

    table = doc.add_table(rows=6, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    col_widths = [Inches(5.5), Inches(0.9)]
    for row in table.rows:
        for i, w in enumerate(col_widths):
            row.cells[i].width = w

    toc_rows = [
        ("Project Title Page", "1"),
        ("1. Introduction\n    1.1. Problem Definition\n    1.2. Objective(s) of the Project\n    1.3. Limitations of the Project", "3"),
        ("2. Literature Survey\n    2.1. Existing System\n    2.2. Limitations of Existing System", "5"),
        ("3. Proposed System - Methodology (Tools and Technologies)\n    3.1 System Architecture / Data flow diagrams\n    3.2 System Requirements & Specification\n        a. Software requirements\n        b. Hardware requirements\n        c. Data requirements (Inputs and Expected Outputs)\n        d. Description of Modules\n        e. UML Diagrams", "7"),
        ("4. Initial Implementation (Optional)", "11"),
        ("5. References", "12")
    ]

    border_kw = {
        "top": {"sz": 4, "val": "single", "color": "000000"},
        "bottom": {"sz": 4, "val": "single", "color": "000000"},
        "left": {"sz": 4, "val": "single", "color": "000000"},
        "right": {"sz": 4, "val": "single", "color": "000000"}
    }

    for idx, (title, page) in enumerate(toc_rows):
        cell_0 = table.cell(idx, 0)
        cell_1 = table.cell(idx, 1)

        set_cell_border(cell_0, **border_kw)
        set_cell_border(cell_1, **border_kw)

        cell_0.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        cell_1.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

        p0 = cell_0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(4)
        p0.paragraph_format.space_after = Pt(4)
        p0.paragraph_format.line_spacing = 1.15
        r0 = p0.add_run(title)
        r0.font.name = 'Times New Roman'
        r0.font.size = Pt(11)
        if idx in [0, 4, 5] or '\n' not in title:
            r0.font.bold = True

        p1 = cell_1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p1.paragraph_format.space_before = Pt(4)
        p1.paragraph_format.space_after = Pt(4)
        r1 = p1.add_run(page)
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(11)

    add_p("", space_before=16, space_after=6)
    add_p("Note: Please prepare the report as per the following guidelines for the text content.", font_size=11, bold=True, space_after=3)
    add_p("Font: Times New Roman", font_size=11, bold=True, space_after=3)
    add_p("All Headings: Font size 14 pts", font_size=11, bold=True, space_after=3)
    add_p("All Text: Font size 12 pts", font_size=11, bold=True, space_after=0)

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # SECTION 1: INTRODUCTION
    # -------------------------------------------------------------------------
    add_p("1. Introduction", font_size=14, bold=True, space_before=12, space_after=8)
    add_p(
        "The accelerating capability and widespread adoption of generative artificial intelligence (GenAI) and Large Language "
        "Models (LLMs) such as GPT-4, Claude, and Gemini have fundamentally disrupted traditional paradigms of higher education assessment. "
        "Undergraduate and postgraduate students can now synthesize highly articulate essays, literature surveys, source code implementations, "
        "and empirical research manuscripts within seconds. While these tools hold tremendous potential as intellectual accelerators, "
        "they have concurrently eroded the evidentiary value of written submissions as definitive proof of authentic student learning."
    )
    add_p(
        "Historically, educational institutions deployed text-scanning mechanisms and statistical classification algorithms to uphold "
        "academic integrity. However, contemporary research confirms that statistical AI detectors suffer from severe false-positive biases "
        "and can be bypassed through simple paraphrasing, leaving academic evaluators caught between unreliable accusations and unmonitored "
        "plagiarism. To restore credibility and diagnostic rigor to academic evaluations, this Special Project introduces VivaGuard: "
        "an evidence-based, document-grounded oral defense platform that automates the orchestration of authentic oral examinations (viva voce) "
        "while maintaining rigorous human-in-the-loop faculty governance."
    )

    add_p("1.1. Problem Definition", font_size=14, bold=True, space_before=10, space_after=6)
    add_p("Contemporary academic evaluation faces a systemic crisis defined by three interconnected challenges:")
    add_bullet("Fragility and Inequity of Statistical AI Detection: ", "Commercial AI detectors compute statistical token perplexity and burstiness to assign an accusatory percentage (e.g., '87% AI-generated'). Empirical studies (Liang et al., 2023) demonstrate that these classifiers misclassify authentic human essays by non-native English writers at rates exceeding 61%, creating profound demographic penalties and damaging student-faculty trust without pedagogical justification.")
    add_bullet("Adversarial Vulnerability and Contract Cheating: ", "As proven by Sadasivan et al. (2023) and Krishna et al. (2023), statistical boundaries deteriorate rapidly when text undergoes light paraphrasing or prompt transformation. Furthermore, written artifacts can be outsourced through contract cheating services, rendering passive text analysis incapable of verifying whether the enrolled student personally understands or authored the delivered material.")
    add_bullet("The Scalability Barrier of Oral Defenses: ", "Oral examinations (viva voce) represent the pedagogical gold standard for authentic comprehension assessment because spontaneous oral defense cannot be proxied or outsourced. However, conducting individual 15-to-30 minute oral vivas across cohorts of 100+ students requires hundreds of faculty hours, rendering comprehensive oral assessment logistically impossible for mid-term coursework and term projects.")

    add_p("1.2. Objective(s) of the Project", font_size=14, bold=True, space_before=10, space_after=6)
    add_p("The overarching objective of the VivaGuard project is to build an automated, document-grounded oral defense platform that empowers educational institutions to evaluate authentic student understanding with speed, rigor, and equity. The specific technical and pedagogical objectives are:")
    add_bullet("1. Automated Submission Knowledge Graph Construction: ", "To design and implement an extraction pipeline capable of parsing unstructured academic manuscripts (PDF, DOCX, TXT) and decomposing them into a structured Submission Knowledge Map encompassing core claims, empirical methodologies, datasets, algorithmic logic, cited authorities, and key findings.")
    add_bullet("2. Document-Grounded Question Synthesis: ", "To generate an 8-category question pool (encompassing Conceptual Understanding, Methodology Defense, Practical Application, Reasoning, Critical Thinking, Citation Verification, Deep Dives, and Contradiction Testing) where every candidate question is deterministically anchored to exact page and paragraph citations from the student's submission.")
    add_bullet("3. Real-Time Adaptive Voice Examination Engine: ", "To construct a conversational voice agent utilizing low-latency Speech-to-Text (STT) and natural Text-to-Speech (TTS) pipelines to conduct a 3-to-10 minute oral defense that dynamically adjusts question depth and triggers contextual follow-ups based on the student's verbal explanations.")
    add_bullet("4. Multi-Dimensional Cognitive Evaluation: ", "To implement a multi-faceted evaluation model assessing candidate responses across six weighted dimensions: Conceptual Understanding (30%), Methodology (20%), Reasoning (15%), Critical Thinking (15%), Submission Familiarity (15%), and Oral Communication Clarity (5%).")
    add_bullet("5. Human-in-the-Loop Faculty Governance: ", "To provide professors with an interactive evidence verification dashboard featuring timestamped audio replay, verbatim transcripts, side-by-side manuscript excerpts, automated anomaly flags, and manual grade override controls.")

    add_p("1.3. Limitations of the Project", font_size=14, bold=True, space_before=10, space_after=6)
    add_p("While VivaGuard offers an innovative paradigm for academic assessment, several operational limitations are recognized:")
    add_bullet("Acoustic and Hardware Variability: ", "Ambient acoustic noise, poor-quality microphone hardware, or packet loss over unstable internet connections can introduce speech-to-text transcription artifacts during live oral examinations.")
    add_bullet("Parsing Complex Multimodal Submissions: ", "Hand-drawn diagrams, non-OCR scanned documents, and specialized mathematical notations (LaTeX equations) require specialized multi-modal vision models and may not achieve full structural decomposition in initial releases.")
    add_bullet("Real-Time Conversational Latency: ", "Orchestrating chained STT processing, LLM context generation, and audio stream synthesis requires stringent edge caching and optimized API responses to maintain natural conversational turn-taking under 1.5 seconds.")
    add_bullet("Advisory Nature of Autonomous Scoring: ", "VivaGuard is engineered strictly as an evidence-gathering and decision-support system for human faculty. It does not autonomously issue disciplinary sanctions or final course grades without professor review.")

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # SECTION 2: LITERATURE SURVEY
    # -------------------------------------------------------------------------
    add_p("2. Literature Survey", font_size=14, bold=True, space_before=12, space_after=8)
    add_p(
        "The literature survey reviews existing theoretical, empirical, and architectural paradigms across three foundational domains: "
        "statistical text-scanning detection systems, the pedagogical efficacy of oral viva voce examinations, and retrieval-augmented generation (RAG) "
        "for hallucination-free educational evaluation."
    )

    add_p("2.1. Existing System", font_size=14, bold=True, space_before=10, space_after=6)
    add_p(
        "Contemporary academic integrity verification relies almost entirely on automated text-scanning platforms. Commercial systems "
        "such as Turnitin, CopyLeaks, GPTZero, and original OpenAI classifiers operate by processing static written submissions through "
        "statistical language models. These tools evaluate two primary metrics:"
    )
    add_bullet("Perplexity: ", "A mathematical measure of how likely a sequence of tokens is under a pre-trained language model distribution. Text exhibiting low perplexity (highly predictable word transitions) is categorized as machine-generated.")
    add_bullet("Burstiness: ", "The degree of variation in sentence length and syntactic complexity across a document. Human writers naturally exhibit irregular, highly variable syntactic structures, whereas LLMs tend toward uniform sentence lengths.")
    add_p(
        "In parallel, traditional oral defense examinations (viva voce) have persisted as the pinnacle of qualitative academic defense. "
        "Rooted in ancient Socratic dialogic examination and formalized in European university statutes since the 12th century, the viva voce "
        "requires candidates to articulate, justify, and defend their research in direct conversation with subject matter experts."
    )

    add_p("2.2. Limitations of Existing System", font_size=14, bold=True, space_before=10, space_after=6)
    add_p("Despite their widespread institutional adoption, existing text-scanning systems exhibit critical methodological defects:")
    add_bullet("Severe False-Positive Bias on Non-Native English Speakers: ", "Liang et al. (2023) conducted an empirical benchmark of seven leading commercial AI detectors using human-authored essays from the international TOEFL dataset. The study revealed that over 61% of authentic human essays written by non-native students were falsely flagged as AI-generated. Non-native speakers typically write with more restricted vocabulary and simpler grammatical structures, which statistical detectors mistake for low-perplexity machine text.")
    add_bullet("Adversarial Vulnerability and Paraphrasing Evasion: ", "Sadasivan et al. (2023) established theoretically that as generative models approach human writing competence, statistical discriminators inevitably decay toward random chance. Krishna et al. (2023) corroborated this empirically, demonstrating that paraphrasing tools (e.g., QuillBot) and recursive prompting render commercial AI detectors virtually ineffective.")
    add_bullet("Pedagogical Failure of Probability Scores: ", "Dawson & Sutherland-Smith (2018) highlighted that an arbitrary probability score (e.g., '78% AI Probability') provides zero diagnostic evidence regarding what the student actually learned or understands. When challenged, professors cannot point to specific factual inconsistencies, leading to protracted disputes and damaged instructional relationships.")
    add_bullet("The Scalability Bottleneck of Manual Viva Voce: ", "While traditional oral examinations eliminate contract cheating and verify authentic comprehension (Joughin, 1998, 2010), their faculty-intensive nature restricts them to doctoral dissertations and master's theses. Conducting 20-minute viva examinations for a cohort of 120 undergraduate students requires 40 uninterrupted hours of faculty time, making it impractical for mid-term coursework.")

    add_p("Table 2.1: Comparative Synthesis Matrix of Academic Integrity Approaches", font_size=12, bold=True, space_before=12, space_after=6)

    m_table = doc.add_table(rows=7, cols=4)
    m_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    m_widths = [Inches(1.5), Inches(1.6), Inches(1.6), Inches(1.8)]
    for row in m_table.rows:
        for i, w in enumerate(m_widths):
            row.cells[i].width = w

    for r_idx, row_vals in enumerate(MATRIX_ROWS):
        for c_idx, val in enumerate(row_vals):
            c = m_table.cell(r_idx, c_idx)
            set_cell_border(c, **border_kw)
            p = c.paragraphs[0]
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(val)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(9.5)
            if r_idx == 0:
                run.font.bold = True
                shd = parse_xml(r'<w:shd {} w:fill="002D62"/>'.format(nsdecls('w')))
                c._tc.get_or_add_tcPr().append(shd)
                run.font.color.rgb = RGBColor(255, 255, 255)
            elif c_idx == 0 or c_idx == 3:
                run.font.bold = True

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # SECTION 3: PROPOSED SYSTEM & METHODOLOGY
    # -------------------------------------------------------------------------
    add_p("3. Proposed System - Methodology (Tools and Technologies)", font_size=14, bold=True, space_before=12, space_after=8)
    add_p(
        "VivaGuard shifts the paradigm from punitive text detection to affirmative oral defense. The methodology integrates "
        "modern web standards, speech synthesis, document grounding via retrieval-augmented pipelines, and an adaptive state engine "
        "to deliver a trustworthy, scalable academic assessment ecosystem."
    )

    add_p("3.1 System Architecture / Data flow diagrams", font_size=14, bold=True, space_before=10, space_after=6)
    add_p("VivaGuard follows a modern modular cloud architecture organized into four primary functional layers:")
    add_bullet("Client Presentation Layer: ", "Implemented in Next.js 14, React 18, and Tailwind CSS. Provides separate, secure interfaces for students (assignment submission portal, interactive viva voice examination chamber, feedback dashboard) and faculty (assignment orchestrator, class-wide authenticity monitor, and individual evidence dossier audit view).")
    add_bullet("Audio & Speech Processing Pipeline: ", "Leverages the Web Audio API for continuous microphone capture, visual audio waveform rendering, and silence detection. Client audio is transcribed via OpenAI Whisper STT / Web Speech recognition, while examiner prompts are vocalized using neural text-to-speech engines.")
    add_bullet("Intelligence & Orchestration Layer: ", "Houses the Knowledge Map Extractor, the Grounded Question Generator, the Adaptive Viva State Engine, and the Cognitive Rubric Evaluator. These services interact to parse manuscripts, structure question trees, guide live dialogue, and evaluate candidate comprehension.")
    add_bullet("Persistence & Verification Layer: ", "Manages relational schemas for users, assignments, submissions, knowledge map graphs, audio transcripts, and final cognitive evaluation scores.")

    add_p("Figure 3.1: Data Flow Architecture (DFD Level 0 & Level 1)", font_size=12, bold=True, space_before=10, space_after=4)
    p_dfd = doc.add_paragraph()
    p_dfd.paragraph_format.space_before = Pt(4)
    p_dfd.paragraph_format.space_after = Pt(8)
    r_dfd = p_dfd.add_run(DFD_ASCII)
    r_dfd.font.name = 'Courier New'
    r_dfd.font.size = Pt(8)

    add_p("3.2 System Requirements & Specification", font_size=14, bold=True, space_before=10, space_after=6)

    add_p("a. Software requirements", font_size=12, bold=True, space_before=6, space_after=4)
    add_bullet("Operating System: ", "Cross-platform compatible (macOS Sonoma+, Windows 11, Ubuntu 22.04 LTS).")
    add_bullet("Web Development Framework: ", "Next.js 14.2.24 (App Router), React 18.3.1, TypeScript 5.x.")
    add_bullet("Styling & Animation: ", "Tailwind CSS 3.4.17, Framer Motion 11.18.2, Lucide React Icons.")
    add_bullet("Speech Processing: ", "Web Audio API, Web Speech Recognition API, OpenAI Whisper STT, Neural Edge TTS.")
    add_bullet("Report & Document Engine: ", "Python 3.12, ReportLab 4.x, python-docx 1.2.0, PyPDF 5.x.")
    add_bullet("Execution Environment: ", "Node.js v18.17+ and Python 3.10+ virtual environments.")

    add_p("b. Hardware requirements", font_size=12, bold=True, space_before=6, space_after=4)
    add_bullet("Client Workstation: ", "Any desktop, laptop, or tablet device equipped with standard audio I/O.")
    add_bullet("Processor: ", "Dual-Core 2.0 GHz CPU or higher (Apple Silicon M-Series or Intel Core i5/i7/AMD Ryzen).")
    add_bullet("Memory (RAM): ", "Minimum 4 GB RAM (8 GB RAM recommended for local model execution).")
    add_bullet("Audio Peripherals: ", "Integrated or USB omnidirectional microphone and stereo speakers/headphones.")
    add_bullet("Network Connectivity: ", "Stable broadband connection with minimum 5 Mbps upload/download throughput.")

    add_p("c. Data requirements (Inputs and Expected Outputs)", font_size=12, bold=True, space_before=6, space_after=4)
    add_bullet("Input Data: ", "Student manuscript files in Portable Document Format (.pdf), Microsoft Word (.docx), or Plain Text (.txt); assignment parameters (course identifier, viva duration limit, rubric weights, difficulty threshold); live candidate audio streams.")
    add_bullet("Output Data: ", "Structured Submission Knowledge Map (claims, methodology nodes, citation graph); synthesized examiner voice prompts; time-indexed verbal transcripts; six-dimensional cognitive scores (0-100 scale); comprehensive evidence dossier with page/paragraph citations.")

    add_p("d. Description of Modules", font_size=12, bold=True, space_before=6, space_after=4)
    add_bullet("1. Document Parsing & Knowledge Map Extractor: ", "Ingests student submissions and extracts clean structural representations. It segments text into sections, extracts empirical claims, identifies core methodology tools, catalogs cited references, and links each entity to its exact page number and paragraph offset.")
    add_bullet("2. Document-Grounded Question Generation Engine: ", "Synthesizes candidate questions across 8 defined typologies: Understanding (core thesis), Methodology (technical choices), Defense (trade-offs and limitations), Application (real-world scenarios), Critical Thinking (novel implications), Citation Check (verifying cited literature), Deep Dive (probing algorithmic specifics), and Contradiction (addressing incongruous statements).")
    add_bullet("3. Adaptive Examination State Engine: ", "Regulates the live conversational flow. It maintains an examination state machine (Idle -> Active Examination -> Question Delivery -> Student Response Capture -> Dynamic Difficulty Adjustment -> Follow-up Probing -> Session Conclusion). It dynamically scales question difficulty from Level 1 to Level 5 based on response quality.")
    add_bullet("4. Audio Streaming & Transcription Engine: ", "Provides full-duplex conversational audio. It captures microphone input, detects conversational pauses using energy thresholds, routes speech data through STT models, and streams synthetic examiner voice audio back to the candidate with sub-second latency.")
    add_bullet("5. Multi-Dimensional Cognitive Scoring Engine: ", "Analyzes student transcripts against document knowledge anchors. It evaluates performance across six pedagogical dimensions: Conceptual Understanding (30%), Methodology (20%), Reasoning (15%), Critical Thinking (15%), Submission Familiarity (15%), and Oral Communication (5%).")
    add_bullet("6. Professor Governance & Evidence Audit Console: ", "Enables educators to review cohort authenticity trends, inspect flagged discrepancies, listen to timestamped audio clips, cross-reference student claims with original submission pages, and approve or adjust grades.")

    add_p("e. UML Diagrams", font_size=12, bold=True, space_before=6, space_after=4)
    add_p("The system's structural and behavioral characteristics are formally modeled using standard UML specifications:")
    add_bullet("Use Case Model: ", "Primary actors include Student (uploads paper, participates in adaptive oral viva, reviews cognitive score report), Professor (configures assignments, monitors cohort vivas, conducts evidence audits, applies score overrides), and AI Examiner (generates grounded questions, delivers speech prompts, evaluates responses).")
    add_bullet("Domain Class Structure: ", "Core entities include User, Assignment, Submission, KnowledgeMap, Question, VivaSession, VivaTurn, and ScoreEvaluation.")
    add_bullet("Sequence Workflow: ", "Step-by-step turn-taking between Student client, Audio Engine, Knowledge Base, and Cognitive Evaluator.")

    p_seq = doc.add_paragraph()
    p_seq.paragraph_format.space_before = Pt(4)
    p_seq.paragraph_format.space_after = Pt(8)
    r_seq = p_seq.add_run(SEQ_ASCII)
    r_seq.font.name = 'Courier New'
    r_seq.font.size = Pt(8)

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # SECTION 4: INITIAL IMPLEMENTATION
    # -------------------------------------------------------------------------
    add_p("4. Initial Implementation (Optional)", font_size=14, bold=True, space_before=12, space_after=8)
    add_p(
        "A fully functional interactive prototype of the VivaGuard platform has been developed and verified. The software architecture "
        "is implemented using TypeScript, Next.js 14 App Router, and Tailwind CSS, featuring robust state management and real-time audio orchestration."
    )

    add_p("4.1 Implemented Components and Modules", font_size=14, bold=True, space_before=10, space_after=6)
    add_bullet("Live Interactive Viva Chamber (LiveVivaRoom.tsx): ", "A production-grade student examination interface featuring real-time microphone audio capture, dynamic audio waveform visualizers, active speaker detection indicators, real-time question display, and live transcription feeds.")
    add_bullet("Knowledge Map Extraction Pipeline (knowledge-map-extractor.ts): ", "Core parsing algorithms that extract key claims, methodological tools, and citations from submitted documents, attaching exact page and paragraph references to each extracted entity.")
    add_bullet("Adaptive Examination State Machine (viva-engine.ts): ", "Manages examination progression across question categories, handles dynamic follow-up triggers when a candidate provides partial answers, and computes final multi-dimensional rubric scores.")
    add_bullet("Faculty Governance Dashboard (ProfessorDashboard.tsx & SubmissionReportView.tsx): ", "Enables professors to review cohort-wide viva completion, inspect candidate authenticity confidence indicators, listen to student audio recordings, and inspect side-by-side submission citations.")
    add_bullet("Comprehensive Candidate Feedback View (StudentResultsView.tsx): ", "Provides students with transparent score breakdowns across the six cognitive evaluation dimensions, highlighting strengths and specific areas for conceptual improvement.")

    add_p("4.2 Evaluation Rubric Configuration", font_size=14, bold=True, space_before=10, space_after=6)
    add_p("The implemented scoring engine evaluates candidate performance using the normalized rubric parameters specified in Table 4.1:")

    add_p("Table 4.1: Six-Dimensional Cognitive Evaluation Rubric Weights", font_size=12, bold=True, space_before=8, space_after=6)

    rub_table = doc.add_table(rows=7, cols=3)
    rub_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    rub_widths = [Inches(2.0), Inches(1.0), Inches(3.5)]
    for row in rub_table.rows:
        for i, w in enumerate(rub_widths):
            row.cells[i].width = w

    for r_idx, row_vals in enumerate(RUBRIC_ROWS):
        for c_idx, val in enumerate(row_vals):
            c = rub_table.cell(r_idx, c_idx)
            set_cell_border(c, **border_kw)
            p = c.paragraphs[0]
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(val)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(9.5)
            if r_idx == 0:
                run.font.bold = True
                shd = parse_xml(r'<w:shd {} w:fill="002D62"/>'.format(nsdecls('w')))
                c._tc.get_or_add_tcPr().append(shd)
                run.font.color.rgb = RGBColor(255, 255, 255)
            elif c_idx == 0 or c_idx == 1:
                run.font.bold = True

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # SECTION 5: REFERENCES
    # -------------------------------------------------------------------------
    add_p("5. References", font_size=14, bold=True, space_before=12, space_after=8)
    for ref in REFERENCES_LIST:
        clean_ref = ref.replace('<i>', '').replace('</i>', '')
        add_bullet("", clean_ref)

    doc.save(output_docx_path)
    print(f"[+] Word DOCX Report successfully generated: {output_docx_path}")


if __name__ == '__main__':
    project_dir = "/Users/yashwanthkrishna/SP project"
    pdf_out = os.path.join(project_dir, "VivaGuard_Special_Project_Midterm_Report.pdf")
    docx_out = os.path.join(project_dir, "VivaGuard_Special_Project_Midterm_Report.docx")

    print("[*] Generating Mid-term Report in institutional ICFAI format...")
    build_pdf(pdf_out)
    build_docx(docx_out)
    print("[✓] All formats generated successfully!")
