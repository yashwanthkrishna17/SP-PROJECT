"""
FastAPI Server for Assignment Plagiarism Detector.
Handles batch upload, OCR, text extraction, and peer-to-peer similarity detection.
"""
from typing import List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.ocr_pipeline import DocumentExtractor
from backend.similarity_engine import SimilarityEngine

app = FastAPI(
    title="Assignment Plagiarism Detector API",
    description="Peer-to-Peer batch document similarity detection with OCR",
    version="1.0.0"
)

# Allow CORS for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = SimilarityEngine(similarity_threshold=0.30)


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "Plagiarism Detector API",
        "ocr_available": True,
        "htr_engine": "Apple Vision Neural Framework"
    }


@app.get("/api/demo-data")
def get_demo_analysis():
    """Returns a ready-to-visualize demo analysis with known plagiarized pairs."""
    demo_docs = [
        {
            "filename": "Alex_Turner_Assignment2.docx",
            "text": (
                "Artificial neural networks represent computational models inspired by biological neural networks. "
                "The core mechanism of training deep feedforward networks relies on gradient descent and the backpropagation algorithm. "
                "During backpropagation, the partial derivatives of the loss function with respect to each weight and bias parameter "
                "are computed recursively via the chain rule of calculus. "
                "Stochastic Gradient Descent (SGD) introduces parameter updates using mini-batches to minimize the empirical risk. "
                "Vanishing gradients in deep architectures were mitigated by introducing Rectified Linear Units (ReLU) and residual skip connections. "
                "In conclusion, modern optimization techniques like Adam and RMSprop enable robust convergence in high-dimensional non-convex parameter spaces."
            ),
            "word_count": 105,
            "extraction_method": "Native Word Parser"
        },
        {
            "filename": "Brian_Clark_Assignment2.pdf",
            "text": (
                "Artificial neural networks represent computational models inspired by biological neural networks. "
                "The fundamental mechanism of training deep networks relies heavily on gradient descent and the backpropagation algorithm. "
                "During backpropagation, the partial derivatives of the loss function with respect to each weight and bias parameter "
                "are computed recursively via the chain rule of calculus. "
                "Furthermore, Stochastic Gradient Descent introduces parameter updates using mini-batches to minimize empirical risk. "
                "Vanishing gradients in deep architectures were mitigated by introducing Rectified Linear Units (ReLU) and residual skip connections. "
                "In summary, modern optimization techniques like Adam and RMSprop allow robust convergence across high-dimensional parameter spaces."
            ),
            "word_count": 105,
            "extraction_method": "Apple Vision Neural HTR (Scanned PDF)"
        },
        {
            "filename": "Clara_Mendoza_Assignment2.png",
            "text": (
                "Convolutional Neural Networks (CNNs) have revolutionized computer vision tasks including object classification and segmentation. "
                "The architectural topology relies on shared parameter convolutional kernels and spatial pooling layers such as max-pooling. "
                "Unlike standard multilayer perceptrons, convolutional layers enforce translation invariance and localized feature extraction. "
                "Architectures like ResNet and EfficientNet achieve state-of-the-art accuracy by managing computational depth and width."
            ),
            "word_count": 59,
            "extraction_method": "Apple Vision Neural HTR"
        },
        {
            "filename": "David_Kim_Assignment2.docx",
            "text": (
                "Deep learning models rely on gradient descent optimization to adjust internal synaptic weights. "
                "While backpropagation computes partial derivatives using the chain rule of calculus, gradient explosion remains a challenge. "
                "Adaptive learning rate optimizers such as Adam, AdaGrad, and RMSprop adjust step sizes per parameter to guarantee smooth convergence. "
                "In conclusion, modern optimization techniques like Adam and RMSprop enable robust convergence in high-dimensional non-convex parameter spaces."
            ),
            "word_count": 66,
            "extraction_method": "Native Word Parser"
        }
    ]

    report = engine.analyze_batch(demo_docs)
    report["extraction_summary"] = [
        {
            "filename": d["filename"],
            "word_count": d["word_count"],
            "method": d["extraction_method"],
            "text_preview": d["text"][:300] + ("..." if len(d["text"]) > 300 else "")
        }
        for d in demo_docs
    ]
    report["warnings"] = []
    return report


@app.post("/api/check-plagiarism")
async def check_plagiarism_batch(files: List[UploadFile] = File(...)):
    """
    Upload a batch of assignments (PDFs, DOCX, PNG, JPG).
    Extracts text, runs Apple Vision / EasyOCR for handwritten pages, and generates similarity reports.
    """
    if len(files) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 assignment files are required to compare peer-to-peer similarity."
        )

    processed_docs = []
    extraction_errors = []

    for file in files:
        try:
            content = await file.read()
            doc_info = DocumentExtractor.process_file(file.filename, content)
            
            if doc_info["word_count"] < 3:
                extraction_errors.append(
                    f"{file.filename}: Very little text detected ({doc_info['word_count']} words). Ensure the scan or photo is in focus."
                )
            else:
                processed_docs.append(doc_info)
        except Exception as e:
            extraction_errors.append(f"{file.filename}: Extraction failed ({str(e)})")

    if len(processed_docs) < 2:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Fewer than 2 readable documents could be extracted from the uploaded batch.",
                "errors": extraction_errors
            }
        )

    # Execute similarity engine
    report = engine.analyze_batch(processed_docs)
    report["extraction_summary"] = [
        {
            "filename": d["filename"],
            "word_count": d["word_count"],
            "method": d["extraction_method"],
            "text_preview": d["text"][:500] + ("..." if len(d["text"]) > 500 else "")
        }
        for d in processed_docs
    ]
    report["warnings"] = extraction_errors

    return report
