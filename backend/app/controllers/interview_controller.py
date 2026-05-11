"""
Interview Controller – business logic cho luồng phỏng vấn.

Tách biệt xử lý nghiệp vụ ra khỏi router để dễ test và tái sử dụng.
Gọi trực tiếp rag_generator thay vì qua rag_service facade.
"""
from fastapi import UploadFile

from app.utils.file import extract_text_from_pdf_bytes
from app.services.rag_generator import generate_questions_from_cv_jd


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
    print("\n\n" + "*" * 80)
    print(">>> [LOG] BẮT ĐẦU LUỒNG PHỎNG VẤN MỚI")
    print("*" * 80)

    cv_text = ""
    if cv:
        cv_bytes = await cv.read()
        cv_text = extract_text_from_pdf_bytes(cv_bytes)
        print(">>> [LOG] TÌNH TRẠNG CV: CÓ NHẬN ĐƯỢC CV")
    else:
        print(">>> [LOG] TÌNH TRẠNG CV: KHÔNG NHẬN ĐƯỢC CV")

    print("\n>>> [LOG] NỘI DUNG JD NHẬN ĐƯỢC:")
    print(jd.strip() if jd.strip() else "(Không có JD)")

    questions = generate_questions_from_cv_jd(cv_text, jd, level, language)
    return {"status": "success", "questions": questions}
