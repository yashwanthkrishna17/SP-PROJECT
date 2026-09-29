import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas

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
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header on pages 2+
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "VivaGuard: Adaptive AI Oral Defense — Abstract & Literature Survey")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)
            
        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 36, page_str)
        self.drawString(54, 36, "Academic Research Document • Stanford University CS Department")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 8.5 * inch - 54, 48)
        
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#4F46E5'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    abstract_box_style = ParagraphStyle(
        'AbstractBody',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        leftIndent=12,
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    table_body_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#1E293B')
    )

    elements = []

    # Title & Metadata Header
    elements.append(Paragraph("VivaGuard: Adaptive AI Oral Defense and Authentic Comprehension Platform", title_style))
    elements.append(Paragraph("Formal Abstract & Comprehensive Literature Survey", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#4F46E5'), spaceAfter=15))

    # Abstract Section Box
    abstract_text = (
        "<b>Abstract—</b> Modern generative AI models (LLMs) present a profound threat to academic evaluation integrity. "
        "Existing statistical AI detectors suffer from severe false-positive rates—disproportionately penalizing non-native English writers—and "
        "remain vulnerable to adversarial paraphrasing. This paper introduces <b>VivaGuard</b>, an evidence-based academic integrity platform "
        "that shifts the paradigm from punitive text scanning to authentic document-grounded oral defense (<i>viva voce</i>). "
        "VivaGuard extracts a structured Submission Knowledge Map from student papers (PDF, DOCX, TXT) and orchestrates a 3-to-10 minute adaptive voice examination. "
        "The system evaluates responses across six cognitive dimensions: Conceptual Understanding (30%), Methodology (20%), Reasoning (15%), "
        "Critical Thinking (15%), Submission Familiarity (15%), and Communication (5%). Rather than issuing automated cheating accusations, "
        "VivaGuard provides faculty with grounded evidence reports featuring exact page/paragraph citations and audio transcripts."
    )
    
    abstract_table = Table([[Paragraph(abstract_text, abstract_box_style)]], colWidths=[504])
    abstract_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(abstract_table)
    elements.append(Spacer(1, 14))

    # Section 1: Introduction & Literature Survey Scope
    elements.append(Paragraph("1. Literature Survey & Related Work", h1_style))
    elements.append(Paragraph(
        "The literature survey evaluates prior research across four key pillars: the statistical failures of text-based AI detectors, "
        "the pedagogical foundations of oral viva assessment, retrieval-augmented generation (RAG) for hallucination prevention, and adaptive educational state engines.",
        body_style
    ))

    # Section 1.1: Limitations of AI Detectors
    elements.append(Paragraph("1.1 Limitations of Statistical AI Detection Models", h2_style))
    elements.append(Paragraph(
        "Recent empirical literature demonstrates the fundamental unreliability of statistical classifiers for detecting AI-generated text:",
        body_style
    ))
    elements.append(Paragraph("• <b>High False-Positive Bias on Non-Native Writers:</b> Liang et al. (2023) evaluated seven commercial AI detectors on TOEFL essays written by non-native English speakers. The detectors misclassified over 61% of authentic human essays as AI-generated due to lower linguistic perplexity and structural uniformity.", bullet_style))
    elements.append(Paragraph("• <b>Adversarial Evasion Vulnerability:</b> Sadasivan et al. (2023) theoretically proved that as LLM text distributions approach human capability, statistical detection accuracy approaches random chance. Light paraphrasing tools reduce detection sensitivity to near zero.", bullet_style))
    elements.append(Paragraph("• <b>Pedagogical Incompatibility:</b> Dawson & Sutherland-Smith (2018) highlighted that arbitrary probability scores damage student-faculty trust without providing diagnostic learning evidence.", bullet_style))

    # Section 1.2: Pedagogical Foundations
    elements.append(Paragraph("1.2 Pedagogical Foundations of Oral Examinations (Viva Voce)", h2_style))
    elements.append(Paragraph(
        "Oral defenses represent the gold standard of authentic academic assessment:",
        body_style
    ))
    elements.append(Paragraph("• <b>Bloom's Taxonomy Higher-Order Evaluation:</b> Bloom et al. (1956) and Anderson & Krathwohl (2001) establish that while written papers can be ghostwritten or generated, live oral defenses force candidates to operate at higher cognitive levels: Analysis, Evaluation, and Defense.", bullet_style))
    elements.append(Paragraph("• <b>Combatting Ghostwriting & Contract Cheating:</b> Joughin (1998, 2010) and Brown & Knight (1994) demonstrated that oral vivas effectively eliminate contract cheating because third-party proxy writers cannot replicate personal familiarity under spontaneous questioning.", bullet_style))
    elements.append(Paragraph("• <b>The Scalability Bottleneck:</b> Traditionally, oral vivas were restricted to doctoral dissertations due to high faculty time demands. VivaGuard automates viva orchestration while maintaining human faculty oversight.", bullet_style))

    # Section 1.3: Comparative Synthesis Matrix
    elements.append(Paragraph("1.3 Comparative System Matrix", h2_style))
    
    matrix_data = [
        [
            Paragraph("Dimension", table_header_style),
            Paragraph("Statistical Detectors (Turnitin/GPTZero)", table_header_style),
            Paragraph("Human Viva Voce", table_header_style),
            Paragraph("VivaGuard Platform", table_header_style)
        ],
        [
            Paragraph("<b>Core Paradigm</b>", table_body_style),
            Paragraph("Statistical text scanning", table_body_style),
            Paragraph("Live faculty dialogue", table_body_style),
            Paragraph("<b>Document-Grounded AI Viva</b>", table_body_style)
        ],
        [
            Paragraph("<b>Primary Output</b>", table_body_style),
            Paragraph("Accusatory probability %", table_body_style),
            Paragraph("Qualitative pass/fail", table_body_style),
            Paragraph("<b>0-100 Score + Evidence Report</b>", table_body_style)
        ],
        [
            Paragraph("<b>Grounding</b>", table_body_style),
            Paragraph("Text n-gram matching", table_body_style),
            Paragraph("Human memory of paper", table_body_style),
            Paragraph("<b>Knowledge Map (Page & Para Ref)</b>", table_body_style)
        ],
        [
            Paragraph("<b>Scalability</b>", table_body_style),
            Paragraph("High (Instant scan)", table_body_style),
            Paragraph("Low (Faculty hours)", table_body_style),
            Paragraph("<b>High (Automated 100+ vivas)</b>", table_body_style)
        ],
        [
            Paragraph("<b>Non-Native Bias</b>", table_body_style),
            Paragraph("Severe (>61% false positive)", table_body_style),
            Paragraph("Low", table_body_style),
            Paragraph("<b>Low (Tests understanding)</b>", table_body_style)
        ],
    ]

    t = Table(matrix_data, colWidths=[100, 134, 134, 136])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 12))

    # Section 2: Key Contributions & Methodology
    elements.append(Paragraph("2. VivaGuard Methodological Contributions", h1_style))
    elements.append(Paragraph("1. <b>Knowledge Map Tree Extraction:</b> Automated extraction of claims, methodologies, tools, and citations into an inspectable tree graph.", bullet_style))
    elements.append(Paragraph("2. <b>Document-Grounded Question Pool:</b> Categorized candidate questions spanning 8 question types (Understanding, Methodology, Defense, Application, Critical Thinking, Citation, Deep Dive, Contradiction).", bullet_style))
    elements.append(Paragraph("3. <b>Adaptive Examination Engine:</b> Real-time Speech-to-Text (STT) and Text-to-Speech (TTS) orchestration with dynamic follow-up questioning.", bullet_style))
    elements.append(Paragraph("4. <b>Human-in-the-Loop Governance:</b> Faculty dashboard with exact source page/paragraph references, audio transcripts, and score override capabilities.", bullet_style))

    # Section 3: References
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("3. References", h1_style))
    refs = [
        "Anderson, L. W., & Krathwohl, D. R. (2001). <i>A Taxonomy for Learning, Teaching, and Assessing</i>. Longman.",
        "Bloom, B. S., et al. (1956). <i>Taxonomy of Educational Objectives</i>. Longman.",
        "Brown, S., & Knight, P. (1994). <i>Assessing Learners in Higher Education</i>. Kogan Page.",
        "Dawson, P., & Sutherland-Smith, W. (2018). Can markers detect contract cheating? <i>Assessment & Evaluation in Higher Education</i>, 43(6), 920-930.",
        "Gao, Y., et al. (2023). Retrieval-augmented generation for large language models: A survey. <i>arXiv:2312.10997</i>.",
        "Joughin, G. (1998). Dimensions of oral assessment. <i>Assessment & Evaluation in Higher Education</i>, 23(4), 367-378.",
        "Krishna, K., et al. (2023). Paraphrasing evades detector watermarks in language models. <i>arXiv:2303.13408</i>.",
        "Lewis, P., et al. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. <i>NeurIPS</i>, 33, 9459-9474.",
        "Liang, W., et al. (2023). GPT detectors are biased against non-native English writers. <i>Patterns (Cell Press)</i>, 4(7), 100779.",
        "Sadasivan, V. S., et al. (2023). Can AI-generated text be reliably detected? <i>arXiv:2303.11156</i>."
    ]

    for ref in refs:
        elements.append(Paragraph(f"• {ref}", ParagraphStyle(
            'RefStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=11.5,
            textColor=colors.HexColor('#475569'),
            leftIndent=10,
            spaceAfter=3
        )))

    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {filename}")

if __name__ == '__main__':
    target = "/Users/yashwanthkrishna/SP project/VivaGuard_Abstract_and_Literature_Survey.pdf"
    build_pdf(target)
    
    # Also copy to artifacts directory
    artifact_dir = "/Users/yashwanthkrishna/.gemini/antigravity-ide/brain/d593c278-fdac-4d3f-bbd7-b6c31af2ba2b"
    if os.path.exists(artifact_dir):
        import shutil
        shutil.copy(target, os.path.join(artifact_dir, "VivaGuard_Abstract_and_Literature_Survey.pdf"))
