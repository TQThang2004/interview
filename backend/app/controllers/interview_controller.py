"""
Interview Controller – business logic cho luồng phỏng vấn.

Tách biệt xử lý nghiệp vụ ra khỏi router để dễ test và tái sử dụng.
Gọi trực tiếp rag_generator thay vì qua rag_service facade.
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
    Xử lý request bắt đầu phỏng vấn:
      1. Đọc và parse CV (nếu có)
      2. Sinh danh sách câu hỏi qua pipeline RAG (Extract → Retrieve → Augment)
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
