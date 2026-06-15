"""
RAG Generator â€“ Orchestrator cá»§a pipeline RAG Ä‘áº§y Ä‘á»§ (R â†’ A â†’ G).

Flow:
  1. [Extract]  extract_cv_jd_context()   â†’ CVJDContext        (1 LLM call)
  2. [Retrieve] retrieve_raw_docs()       â†’ list[RawDoc]       (1 Embedding call + ChromaDB)
                                            tráº£ vá» ngÃ¢n hÃ ng TOP_K_RETRIEVE docs
  3. [Augment]  augment_questions()       â†’ list[Question]     (1 LLM call)
                                            chá»n lá»c tá»« ngÃ¢n hÃ ng â†’ sinh NUM_QUESTIONS cÃ¢u há»i

Tá»•ng: 2 LLM calls + 1 Embedding call.
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
    Sinh danh sÃ¡ch cÃ¢u há»i phá»ng váº¥n dá»±a trÃªn CV vÃ  JD theo pipeline RAG Ä‘Ãºng ká»¹ thuáº­t:
      Retrieve â†’ Augmented Generation

    Args:
        cv_text:  Ná»™i dung CV dÆ°á»›i dáº¡ng plain text.
        jd_text:  Ná»™i dung Job Description.
        level:    Cáº¥p Ä‘á»™ phá»ng váº¥n (junior/mid/seniorâ€¦).
        language: "vi" (tiáº¿ng Viá»‡t) hoáº·c "en" (English).
        num_q:    Sá»‘ cÃ¢u há»i muá»‘n sinh ra.

    Returns:
        list[dict] vá»›i má»—i dict gá»“m: id, question, reference, source.
    """

    # â”€â”€ Fallback khi khÃ´ng cÃ³ CV vÃ  JD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if not cv_text.strip() and not jd_text.strip():
        fallback_context = CVJDContext(
            topics=["software engineering core technical interview questions"],
            tech_stack=[],
            matching_skills=[],
            gap_areas=[],
            matching_topics=["software engineering core technical interview questions"],
            gap_topics=[],
            candidate_summary="á»¨ng viÃªn khÃ´ng cung cáº¥p CV.",
            position_summary="Vá»‹ trÃ­ ká»¹ thuáº­t pháº§n má»m tá»•ng quÃ¡t.",
        )
        # Retrieve ngÃ¢n hÃ ng â†’ Augment sinh ra num_q cÃ¢u
        raw_docs = retrieve_raw_docs(
            fallback_context.topics, level,
            matching_topics=fallback_context.matching_topics,
            gap_topics=fallback_context.gap_topics,
        )
        questions = augment_questions(raw_docs, fallback_context, level, language, num_q)
        return _to_dict_list(questions)

    # â”€â”€ BÆ°á»›c 1: Extract CV/JD Context + Gap Analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    context = extract_cv_jd_context(cv_text, jd_text)

    # â”€â”€ BÆ°á»›c 2: Retrieve tá»« ChromaDB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    raw_docs = retrieve_raw_docs(
        context.topics, level,
        matching_topics=context.matching_topics,
        gap_topics=context.gap_topics,
    )

    # â”€â”€ BÆ°á»›c 3: Augmented Generation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    questions = augment_questions(raw_docs, context, level, language, num_q)

    return _to_dict_list(questions)


def _to_dict_list(questions: list[Question]) -> list[dict]:
    """Chuyá»ƒn Question objects thÃ nh list[dict] cho API response."""
    return [
        {
            "id": q.id,
            "question": q.question,
            "reference": q.reference,
            "source": q.source,
        }
        for q in questions
    ]
