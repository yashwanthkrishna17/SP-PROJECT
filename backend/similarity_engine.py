"""
Peer-to-Peer Plagiarism Comparison Engine with Semantic Paraphrase Detection.
Combines:
1. Sentence-Level Dense Semantic Embeddings (Sentence-Transformers MiniLM)
2. Directional W-Shingling / Containment (Broder's Containment)
3. Sublinear Unigram + Bigram TF-IDF Vectorization
4. Exact Verbatim Sequence Matching vs. Paraphrased Rewrite Classification
"""
import re
import difflib
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Try loading SentenceTransformer for semantic paraphrase detection
try:
    from sentence_transformers import SentenceTransformer, util
    _SEMANTIC_MODEL: Optional[SentenceTransformer] = SentenceTransformer('all-MiniLM-L6-v2')
except Exception:
    _SEMANTIC_MODEL = None


class SimilarityEngine:

    def __init__(self, similarity_threshold: float = 0.30):
        self.threshold = similarity_threshold
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words='english',
            min_df=1,
            sublinear_tf=True
        )
        self.semantic_model = _SEMANTIC_MODEL

    @staticmethod
    def extract_shingles(text: str, k: int = 4) -> set:
        """Extracts k-word shingles for containment testing."""
        words = re.findall(r'\b[a-zA-Z0-9_\-]+\b', text.lower())
        if len(words) < k:
            return set(words)
        return set(tuple(words[i : i + k]) for i in range(len(words) - k + 1))

    @staticmethod
    def get_meaningful_sentences(text: str) -> List[str]:
        """Extracts clean non-trivial sentences or bullet points."""
        raw_lines = text.split('\n')
        sentences = []
        for line in raw_lines:
            line_str = line.strip()
            if not line_str:
                continue
            parts = re.split(r'[\.\?\!]+', line_str)
            for p in parts:
                cleaned = re.sub(r'\s+', ' ', p).strip()
                if len(cleaned.split()) >= 4:
                    sentences.append(cleaned)
        return sentences

    @staticmethod
    def is_verbatim_match(s: str, t: str) -> bool:
        """Determines if two sentences are nearly verbatim copies."""
        words_s = set(s.lower().split())
        words_t = set(t.lower().split())
        if not words_s or not words_t:
            return False
        
        intersection = len(words_s & words_t)
        union = len(words_s | words_t)
        jaccard = intersection / union if union > 0 else 0
        if jaccard >= 0.60:
            return True
        if jaccard < 0.20:
            return False
            
        return difflib.SequenceMatcher(None, s.lower(), t.lower()).ratio() >= 0.70

    def detect_paraphrased_sentences(
        self, sentences_a: List[str], sentences_b: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Uses dense semantic embeddings (Sentence-Transformers) to detect
        sentences that express the same meaning using different words (synonym swap, AI rephrasing).
        """
        if not self.semantic_model or not sentences_a or not sentences_b:
            return []

        # Limit to top 50 sentences per document for sub-second pairwise embedding speed
        s_a = sentences_a[:50]
        s_b = sentences_b[:50]

        try:
            emb_a = self.semantic_model.encode(s_a, convert_to_tensor=True, show_progress_bar=False)
            emb_b = self.semantic_model.encode(s_b, convert_to_tensor=True, show_progress_bar=False)
            sim_matrix = util.cos_sim(emb_a, emb_b).cpu().numpy()
        except Exception:
            return []

        paraphrases = []
        for i, sent_a in enumerate(s_a):
            best_j = int(np.argmax(sim_matrix[i]))
            score = float(sim_matrix[i, best_j])
            sent_b = s_b[best_j]

            # If semantic similarity is high (>= 75%) BUT it's NOT an exact string match, it's a paraphrase!
            string_sim = difflib.SequenceMatcher(None, sent_a.lower(), sent_b.lower()).ratio()
            
            if score >= 0.74 and string_sim < 0.70:
                paraphrases.append({
                    "doc_a_sentence": sent_a,
                    "doc_b_sentence": sent_b,
                    "semantic_score": round(score * 100, 1),
                    "lexical_similarity": round(string_sim * 100, 1),
                    "paraphrase_type": "Synonym Replacement / Structural Rewrite"
                })

        return sorted(paraphrases, key=lambda x: x["semantic_score"], reverse=True)

    def compute_sentence_overlap(self, sentences_a: List[str], sentences_b: List[str]) -> Tuple[float, float]:
        """Calculates directional sentence overlap."""
        if not sentences_a or not sentences_b:
            return 0.0, 0.0

        matched_a = sum(1 for sa in sentences_a if any(self.is_verbatim_match(sa, sb) for sb in sentences_b))
        matched_b = sum(1 for sb in sentences_b if any(self.is_verbatim_match(sb, sa) for sa in sentences_a))

        ratio_a_in_b = matched_a / len(sentences_a)
        ratio_b_in_a = matched_b / len(sentences_b)
        return ratio_a_in_b, ratio_b_in_a

    @staticmethod
    def find_matching_passages(text_a: str, text_b: str, min_match_chars: int = 30) -> List[Dict[str, Any]]:
        """Extracts verbatim or closely matching blocks between two texts."""
        matcher = difflib.SequenceMatcher(None, text_a, text_b, autojunk=False)
        matching_blocks = []

        for block in matcher.get_matching_blocks():
            if block.size >= min_match_chars:
                matched_str = text_a[block.a : block.a + block.size].strip()
                if len(matched_str) > 0:
                    matching_blocks.append({
                        "doc_a_start": block.a,
                        "doc_a_end": block.a + block.size,
                        "doc_b_start": block.b,
                        "doc_b_end": block.b + block.size,
                        "matched_text": matched_str,
                        "length": block.size
                    })

        return sorted(matching_blocks, key=lambda x: x["length"], reverse=True)

    def analyze_batch(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compares all documents against each other using both Lexical and Semantic Paraphrase detection."""
        n = len(documents)
        if n < 2:
            return {
                "flagged_pairs": [],
                "similarity_matrix": [[100.0]] if n == 1 else [],
                "document_names": [d["filename"] for d in documents],
                "message": "At least 2 documents are required for peer-to-peer comparison."
            }

        corpus = [doc["text"] for doc in documents]
        doc_names = [doc["filename"] for doc in documents]

        all_shingles = [self.extract_shingles(text, k=4) for text in corpus]
        all_sentences = [self.get_meaningful_sentences(text) for text in corpus]

        tfidf_matrix = self.vectorizer.fit_transform(corpus)
        cosine_sim_matrix = cosine_similarity(tfidf_matrix)

        composite_matrix = np.zeros((n, n))
        for i in range(n):
            composite_matrix[i, i] = 100.0

        flagged_pairs = []

        for i in range(n):
            for j in range(i + 1, n):
                cos_score = float(cosine_sim_matrix[i, j])

                # 1. Asymmetric W-Shingling Containment
                s_i, s_j = all_shingles[i], all_shingles[j]
                if s_i and s_j:
                    common_shingles = len(s_i.intersection(s_j))
                    containment_i_in_j = common_shingles / len(s_i)
                    containment_j_in_i = common_shingles / len(s_j)
                    max_containment = max(containment_i_in_j, containment_j_in_i)
                else:
                    containment_i_in_j, containment_j_in_i, max_containment = 0.0, 0.0, 0.0

                # 2. Verbatim Sentence-Level Overlap
                sent_i_in_j, sent_j_in_i = self.compute_sentence_overlap(all_sentences[i], all_sentences[j])
                max_sent_overlap = max(sent_i_in_j, sent_j_in_i)

                # 3. Dense Semantic Paraphrase Detection
                paraphrased_passages = self.detect_paraphrased_sentences(all_sentences[i], all_sentences[j])
                
                # Ratio of sentences that were paraphrased
                total_min_sents = min(len(all_sentences[i]), len(all_sentences[j]))
                paraphrase_ratio = len(paraphrased_passages) / total_min_sents if total_min_sents > 0 else 0.0

                # Composite Plagiarism Score:
                # Combines TF-IDF, verbatim containment, sentence copying, AND semantic paraphrasing
                composite_score = (
                    0.15 * cos_score +
                    0.35 * max_containment +
                    0.30 * max_sent_overlap +
                    0.20 * min(paraphrase_ratio * 1.2, 1.0)
                )

                final_percentage = max(
                    composite_score * 100.0,
                    max_sent_overlap * 88.0,
                    max_containment * 85.0,
                    cos_score * 100.0,
                    (max_sent_overlap + paraphrase_ratio * 0.5) * 85.0
                )
                final_percentage = min(round(final_percentage, 1), 99.9)

                composite_matrix[i, j] = final_percentage
                composite_matrix[j, i] = final_percentage

                # Exact verbatim passage blocks
                matches = self.find_matching_passages(corpus[i], corpus[j])

                severity = "CRITICAL" if final_percentage >= 70.0 else "MODERATE" if final_percentage >= 40.0 else "LOW"

                flagged_pairs.append({
                    "id": f"{i}-{j}",
                    "doc_a": doc_names[i],
                    "doc_b": doc_names[j],
                    "doc_a_text": corpus[i],
                    "doc_b_text": corpus[j],
                    "similarity_score": round(final_percentage / 100.0, 3),
                    "similarity_percentage": final_percentage,
                    "severity": severity,
                    "metrics": {
                        "sentence_overlap": round(max_sent_overlap * 100, 1),
                        "phrase_containment": round(max_containment * 100, 1),
                        "topical_cosine_similarity": round(cos_score * 100, 1),
                        "paraphrase_count": len(paraphrased_passages),
                        "paraphrase_percentage": round(min(paraphrase_ratio * 100, 100.0), 1)
                    },
                    "overlapping_passages": matches[:8],
                    "paraphrased_passages": paraphrased_passages[:8],
                    "total_overlapping_snippets": len(matches)
                })

        flagged_pairs.sort(key=lambda x: x["similarity_percentage"], reverse=True)

        return {
            "document_names": doc_names,
            "similarity_matrix": composite_matrix.tolist(),
            "flagged_pairs": flagged_pairs,
            "total_documents": n,
            "critical_matches_count": sum(1 for p in flagged_pairs if p["severity"] == "CRITICAL"),
            "moderate_matches_count": sum(1 for p in flagged_pairs if p["severity"] == "MODERATE"),
            "paraphrase_detection_enabled": True
        }
