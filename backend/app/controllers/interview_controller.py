"""
Interview Controller â€“ business logic cho luá»“ng phá»ng váº¥n.

TÃ¡ch biá»‡t xá»­ lÃ½ nghiá»‡p vá»¥ ra khá»i router Ä‘á»ƒ dá»… test vÃ  tÃ¡i sá»­ dá»¥ng.
Gá»i trá»±c tiáº¿p rag_generator thay vÃ¬ qua rag_service facade.
"""
from fastapi import UploadFile

from app.core.logging import get_logger
from app.utils.file import extract_text_from_pdf_bytes
from app.services.rag_generator import generate_questions_from_cv_jd


logger = get_logger(__name__)


async def handle_start_interview(
    cv: UploadFile | None,
    jd: str,
    level: str,
    language: str,
) -> dict:
    """
    Xá»­ lÃ½ request báº¯t Ä‘áº§u phá»ng váº¥n:
      1. Äá»c vÃ  parse CV (náº¿u cÃ³)
      2. Sinh danh sÃ¡ch cÃ¢u há»i qua pipeline RAG (Extract â†’ Retrieve â†’ Augment)
    """
    logger.info("Starting interview generation request.")

    cv_text = ""
    if cv:
        cv_bytes = await cv.read()
        cv_text = extract_text_from_pdf_bytes(cv_bytes)
        logger.info("CV received for interview generation.")
    else:
        logger.info("No CV received for interview generation.")

    logger.info("JD received: %s", bool(jd and jd.strip()))

    questions = generate_questions_from_cv_jd(cv_text, jd, level, language)
    return {"status": "success", "questions": questions}
