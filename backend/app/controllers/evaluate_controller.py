"""
Evaluate Controller – business logic cho chức năng chấm điểm câu trả lời.
"""
from app.schemas.models import EvaluateAnswerRequest
from app.services import rag_service


def handle_evaluate_answer(req: EvaluateAnswerRequest) -> dict:
    """
    Gọi RAG service để chấm điểm và nhận xét câu trả lời của ứng viên.
    """
    result = rag_service.evaluate_rag_answer(
        req.question,
        req.answer,
        req.reference,
        req.level,
        req.language,
    )
    return {"status": "success", "evaluation": result}
