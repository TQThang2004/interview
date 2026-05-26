"""
Evaluate Controller – business logic cho chức năng chấm điểm câu trả lời.

Gọi trực tiếp evaluate_service thay vì qua rag_service facade.
"""
from app.services.evaluate_service import evaluate_answer, evaluate_cv
from fastapi import UploadFile
from app.utils.file import extract_text_from_pdf_bytes
from app.schemas.interview_schemas import EvaluateAnswerRequest


def handle_evaluate_answer(req: EvaluateAnswerRequest) -> dict:
    """
    Gọi evaluate_service để chấm điểm và nhận xét câu trả lời của ứng viên.

    Returns:
        dict với keys: status, evaluation (score, score_str, strengths, weaknesses, suggestions)
    """
    result = evaluate_answer(
        question=req.question,
        user_answer=req.answer,
        reference=req.reference,
        level=req.level,
        language=req.language,
    )
    return {"status": "success", "evaluation": result.to_dict()}

async def handle_evaluate_cv_file(cv: UploadFile) -> dict:
    cv_bytes = await cv.read()
    cv_text = extract_text_from_pdf_bytes(cv_bytes)
    result = evaluate_cv(cv_text)
    return {"status": "success", "result": result}

