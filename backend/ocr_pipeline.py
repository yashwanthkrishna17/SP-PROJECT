"""
Document text extraction and OCR pipeline.
Integrates Apple Vision Neural Framework (macOS HTR for handwritten assignments),
with EasyOCR and Tesseract fallbacks for printed text, Word (.docx), and Digital/Scanned PDFs.
"""
import io
import os
import subprocess
import tempfile
from typing import Tuple, Dict, Any
from PIL import Image, ImageOps, ImageFilter
from pypdf import PdfReader
from docx import Document

# Setup paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VISION_BINARY = os.path.join(PROJECT_ROOT, "backend", "vision_ocr")

# Fallback Tesseract setup
try:
    import pytesseract
    if os.path.exists("/opt/homebrew/bin/tesseract"):
        pytesseract.pytesseract.tesseract_cmd = "/opt/homebrew/bin/tesseract"
    elif os.path.exists("/usr/local/bin/tesseract"):
        pytesseract.pytesseract.tesseract_cmd = "/usr/local/bin/tesseract"
except ImportError:
    pytesseract = None


class DocumentExtractor:

    @staticmethod
    def _run_apple_vision_ocr(file_bytes: bytes) -> str:
        """
        Runs Apple Vision Framework (Live Text Neural HTR engine).
        Achieves state-of-the-art accuracy on handwritten student pages.
        """
        if not os.path.exists(VISION_BINARY):
            return ""

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            proc = subprocess.run(
                [VISION_BINARY, tmp_path],
                capture_output=True,
                text=True,
                timeout=20
            )
            if proc.returncode == 0:
                return proc.stdout.strip()
        except Exception:
            pass
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass
        return ""

    @staticmethod
    def _run_easyocr(file_bytes: bytes) -> str:
        """Fallback to EasyOCR for neural handwritten text detection."""
        try:
            import easyocr
            reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            results = reader.readtext(file_bytes, detail=0)
            return "\n".join(results).strip()
        except Exception:
            return ""

    @staticmethod
    def _run_tesseract(file_bytes: bytes) -> str:
        """Fallback to Tesseract with adaptive contrast enhancement."""
        if not pytesseract:
            return ""
        try:
            image = Image.open(io.BytesIO(file_bytes))
            gray = image.convert("L")
            autocontrast = ImageOps.autocontrast(gray, cutoff=2)
            denoised = autocontrast.filter(ImageFilter.MedianFilter(size=3))
            config = r'--oem 3 --psm 3'
            return pytesseract.image_to_string(denoised, config=config).strip()
        except Exception:
            return ""

    @classmethod
    def extract_from_image(cls, file_bytes: bytes) -> Tuple[str, str]:
        """
        Multi-tier OCR pipeline for photos and handwritten pages:
        1. Apple Vision Neural Live Text (best for cursive/handwritten papers)
        2. EasyOCR (CRAFT detector + CRNN recognizer)
        3. Tesseract (printed text fallback)
        Returns: (extracted_text, engine_used)
        """
        # Tier 1: Apple Vision Neural Engine
        text = cls._run_apple_vision_ocr(file_bytes)
        if text and len(text.split()) >= 5:
            return text, "Apple Vision Neural HTR"

        # Tier 2: EasyOCR
        text = cls._run_easyocr(file_bytes)
        if text and len(text.split()) >= 5:
            return text, "EasyOCR Deep Engine"

        # Tier 3: Tesseract
        text = cls._run_tesseract(file_bytes)
        return text, "Tesseract OCR"

    @classmethod
    def extract_from_pdf(cls, file_bytes: bytes) -> Tuple[str, str]:
        """
        Hybrid PDF extraction:
        1. Digital text extraction via pypdf.
        2. If scanned or photo-based (low word density), extracts page images and runs Vision OCR.
        """
        reader = PdfReader(io.BytesIO(file_bytes))
        digital_text_parts = []
        
        for page in reader.pages:
            try:
                page_text = page.extract_text() or ""
                if page_text.strip():
                    digital_text_parts.append(page_text.strip())
            except Exception:
                continue

        combined_text = "\n\n".join(digital_text_parts).strip()
        word_count = len(combined_text.split())
        page_count = max(len(reader.pages), 1)

        # If average words per page < 15, document is scanned/photo-based
        if word_count / page_count < 15:
            ocr_text_parts = []
            used_engine = "Neural OCR"
            for page in reader.pages:
                try:
                    for img_obj in page.images:
                        try:
                            ocr_result, eng = cls.extract_from_image(img_obj.data)
                            if ocr_result and len(ocr_result.strip()) > 10:
                                ocr_text_parts.append(ocr_result.strip())
                                used_engine = eng
                        except Exception:
                            continue
                except Exception:
                    continue
            
            if ocr_text_parts:
                return "\n\n".join(ocr_text_parts).strip(), f"{used_engine} (Scanned PDF)"

        return combined_text, "Native PDF Parser"

    @classmethod
    def extract_from_docx(cls, file_bytes: bytes) -> str:
        """Extract text from Word (.docx) documents, including tables."""
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    paragraphs.append(row_text)
                    
        return "\n\n".join(paragraphs).strip()

    @classmethod
    def process_file(cls, filename: str, content: bytes) -> Dict[str, Any]:
        """Router that identifies file type and executes optimal extraction strategy."""
        lower = filename.lower()
        extracted_text = ""
        method = "text"

        if lower.endswith(".pdf"):
            extracted_text, method = cls.extract_from_pdf(content)
        elif lower.endswith((".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp")):
            extracted_text, method = cls.extract_from_image(content)
        elif lower.endswith(".docx"):
            extracted_text = cls.extract_from_docx(content)
            method = "Native Word Parser"
        elif lower.endswith(".txt"):
            extracted_text = content.decode("utf-8", errors="ignore")
            method = "Plain Text"
        else:
            raise ValueError(f"Unsupported file format: {filename}")

        return {
            "filename": filename,
            "char_count": len(extracted_text),
            "word_count": len(extracted_text.split()),
            "extraction_method": method,
            "text": extracted_text
        }
