"""
RAG Generator – Orchestrator của pipeline RAG đầy đủ (R → A → G).

Flow:
  1. [Extract]  extract_cv_jd_context()   → CVJDContext        (1 LLM call)
  2. [Retrieve] retrieve_raw_docs()       → list[RawDoc]       (1 Embedding call + ChromaDB)
                                            trả về ngân hàng TOP_K_RETRIEVE docs
  3. [Augment]  augment_questions()       → list[Question]     (1 LLM call)
                                            chọn lọc từ ngân hàng → sinh NUM_QUESTIONS câu hỏi

Tổng: 2 LLM calls + 1 Embedding call.
"""
from __future__ import annotations

from app.core.config import NUM_QUESTIONS, TOP_K_RETRIEVE
from app.services.rag_retriever import retrieve_raw_docs
from app.services.rag_augmentor import (
    CVJDContext,
    Question,
    extract_cv_jd_context,
    augment_questions,
)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_questions_from_cv_jd(
    cv_text: str,
    jd_text: str,
    level: str,
    language: str = "vi",
    num_q: int = NUM_QUESTIONS,
) -> list[dict]:
    """
    Sinh danh sách câu hỏi phỏng vấn dựa trên CV và JD theo pipeline RAG đúng kỹ thuật:
      Retrieve → Augmented Generation

    Args:
        cv_text:  Nội dung CV dưới dạng plain text.
        jd_text:  Nội dung Job Description.
        level:    Cấp độ phỏng vấn (junior/mid/senior…).
        language: "vi" (tiếng Việt) hoặc "en" (English).
        num_q:    Số câu hỏi muốn sinh ra.

    Returns:
        list[dict] với mỗi dict gồm: id, question, reference, source.
    """

    # ── Fallback khi không có CV và JD ───────────────────────────────────────
    if not cv_text.strip() and not jd_text.strip():
        fallback_context = CVJDContext(
            topics=["software engineering core technical interview questions"],
            tech_stack=[],
            matching_skills=[],
            gap_areas=[],
            matching_topics=["software engineering core technical interview questions"],
            gap_topics=[],
            candidate_summary="Ứng viên không cung cấp CV.",
            position_summary="Vị trí kỹ thuật phần mềm tổng quát.",
        )
        # Retrieve ngân hàng → Augment sinh ra num_q câu
        raw_docs = retrieve_raw_docs(
            fallback_context.topics, level,
            matching_topics=fallback_context.matching_topics,
            gap_topics=fallback_context.gap_topics,
        )
        questions = augment_questions(raw_docs, fallback_context, level, language, num_q)
        return _to_dict_list(questions)

    # ── Bước 1: Extract CV/JD Context + Gap Analysis ─────────────────────────
    context = extract_cv_jd_context(cv_text, jd_text)

    # ── Bước 2: Retrieve từ ChromaDB ─────────────────────────────────────────
    raw_docs = retrieve_raw_docs(
        context.topics, level,
        matching_topics=context.matching_topics,
        gap_topics=context.gap_topics,
    )

    # ── Bước 3: Augmented Generation ─────────────────────────────────────────
    questions = augment_questions(raw_docs, context, level, language, num_q)

    return _to_dict_list(questions)


def _to_dict_list(questions: list[Question]) -> list[dict]:
    """Chuyển Question objects thành list[dict] cho API response."""
    return [
        {
            "id": q.id,
            "question": q.question,
            "reference": q.reference,
            "source": q.source,
        }
        for q in questions
    ]
