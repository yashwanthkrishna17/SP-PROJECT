"""
Cross-platform document extraction and OCR for VivaGuard.

Render/Linux: Tesseract first, EasyOCR fallback when installed.
macOS: Apple Vision first, then Tesseract and EasyOCR.
"""
import io
import logging
import os
import platform
import shutil
import subprocess
import tempfile
from typing import Tuple, Dict, Any

from PIL import Image, ImageOps, ImageFilter
from pypdf import PdfReader
from docx import Document

logger = logging.getLogger(__name__)

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VISION_BINARY = os.path.join(PROJECT_ROOT, "backend", "vision_ocr")

try:
    import pytesseract
except ImportError:
    pytesseract = None


def get_ocr_status() -> Dict[str, Any]:
    """Return real OCR availability instead of a hard-coded success value."""
    tesseract_path = shutil.which("tesseract")
    tesseract_ok = False
    tesseract_version = None

    if pytesseract and tesseract_path:
        try:
            tesseract_version = str(pytesseract.get_tesseract_version())
            tesseract_ok = True
        except Exception as exc:
            logger.warning("Tesseract health check failed: %s", exc)

    vision_ok = platform.system() == "Darwin" and os.path.isfile(VISION_BINARY) and os.access(VISION_BINARY, os.X_OK)

    if vision_ok:
        engine = "Apple Vision"
    elif tesseract_ok:
        engine = "Tesseract"
    else:
        engine = "Unavailable"

    return {
        "ocr_available": bool(vision_ok or tesseract_ok),
        "htr_engine": engine,
        "tesseract_available": tesseract_ok,
        "tesseract_version": tesseract_version,
        "easyocr_fallback": _easyocr_installed(),
        "platform": platform.system(),
    }


def _easyocr_installed() -> bool:
    try:
        import importlib.util
        return importlib.util.find_spec("easyocr") is not None
    except Exception:
        return False


class DocumentExtractor:
    @staticmethod
    def _run_apple_vision_ocr(file_bytes: bytes) -> str:
        """Run the bundled Apple Vision helper only on macOS."""
        if platform.system() != "Darwin" or not os.path.isfile(VISION_BINARY):
            return ""

        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name
            proc = subprocess.run(
                [VISION_BINARY, tmp_path],
                capture_output=True,
                text=True,
                timeout=30,
                check=False,
            )
            if proc.returncode == 0:
                return proc.stdout.strip()
            logger.warning("Apple Vision OCR exited %s: %s", proc.returncode, proc.stderr[-1000:])
        except Exception:
            logger.exception("Apple Vision OCR failed")
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except OSError:
                    logger.warning("Could not remove temporary OCR file: %s", tmp_path)
        return ""

    @staticmethod
    def _run_tesseract(file_bytes: bytes) -> str:
        """Run Linux/macOS/Windows Tesseract with image preprocessing."""
        if not pytesseract or not shutil.which("tesseract"):
            logger.warning("Tesseract OCR unavailable: pytesseract or tesseract binary missing")
            return ""

        try:
            with Image.open(io.BytesIO(file_bytes)) as source:
                image = ImageOps.exif_transpose(source).convert("RGB")
                # Upscale small images for more reliable recognition.
                if image.width < 1400:
                    scale = min(2.0, 1400 / max(image.width, 1))
                    image = image.resize((int(image.width * scale), int(image.height * scale)))
                gray = image.convert("L")
                prepared = ImageOps.autocontrast(gray, cutoff=1).filter(ImageFilter.MedianFilter(size=3))
                result = pytesseract.image_to_string(prepared, lang="eng", config="--oem 3 --psm 6")
                text = result.strip()
                logger.info("Tesseract OCR completed: %s characters extracted", len(text))
                return text
        except Exception:
            logger.exception("Tesseract OCR failed while processing image")
            return ""

    @staticmethod
    def _run_easyocr(file_bytes: bytes) -> str:
        """Optional neural OCR fallback; logs failures instead of hiding them."""
        try:
            import easyocr
            import numpy as np

            with Image.open(io.BytesIO(file_bytes)) as source:
                image = ImageOps.exif_transpose(source).convert("RGB")
                array = np.asarray(image)
            reader = easyocr.Reader(["en"], gpu=False, verbose=False)
            results = reader.readtext(array, detail=0)
            text = "\n".join(results).strip()
            logger.info("EasyOCR completed: %s characters extracted", len(text))
            return text
        except ImportError:
            logger.info("EasyOCR not installed; skipping optional fallback")
        except Exception:
            logger.exception("EasyOCR failed while processing image")
        return ""

    @classmethod
    def extract_from_image(cls, file_bytes: bytes) -> Tuple[str, str]:
        """Use the platform-appropriate OCR engine and return text plus engine name."""
        engines = []
        if platform.system() == "Darwin":
            engines.append(("Apple Vision Neural HTR", cls._run_apple_vision_ocr))
        engines.extend([
            ("Tesseract OCR", cls._run_tesseract),
            ("EasyOCR Deep Engine", cls._run_easyocr),
        ])

        for engine_name, runner in engines:
            text = runner(file_bytes)
            if text and len(text.split()) >= 3:
                return text, engine_name
        return "", "OCR unavailable or no readable text detected"

    @classmethod
    def extract_from_pdf(cls, file_bytes: bytes) -> Tuple[str, str]:
        """Extract native PDF text; OCR embedded page images if the PDF is scanned."""
        reader = PdfReader(io.BytesIO(file_bytes))
        digital_text_parts = []

        for page in reader.pages:
            try:
                page_text = page.extract_text() or ""
                if page_text.strip():
                    digital_text_parts.append(page_text.strip())
            except Exception:
                logger.exception("Native PDF text extraction failed on a page")

        combined_text = "\n\n".join(digital_text_parts).strip()
        word_count = len(combined_text.split())
        page_count = max(len(reader.pages), 1)

        if word_count / page_count < 15:
            ocr_text_parts = []
            used_engines = []
            for page in reader.pages:
                try:
                    for image_obj in page.images:
                        try:
                            ocr_result, engine_name = cls.extract_from_image(image_obj.data)
                            if ocr_result and len(ocr_result.strip()) > 10:
                                ocr_text_parts.append(ocr_result.strip())
                                used_engines.append(engine_name)
                        except Exception:
                            logger.exception("OCR failed for an embedded PDF image")
                except Exception:
                    logger.exception("Could not inspect images on a PDF page")

            if ocr_text_parts:
                engine_name = ", ".join(sorted(set(used_engines)))
                return "\n\n".join(ocr_text_parts).strip(), f"{engine_name} (Scanned PDF)"

        return combined_text, "Native PDF Parser"

    @classmethod
    def extract_from_docx(cls, file_bytes: bytes) -> str:
        """Extract paragraphs and table cells from Word documents."""
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
        """Route a supported file to its extraction method."""
        lower = (filename or "").lower()
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
            "text": extracted_text,
        }
