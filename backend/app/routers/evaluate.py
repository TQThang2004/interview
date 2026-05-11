"""
Router: Evaluate – POST /api/evaluate
"""
from fastapi import APIRouter, HTTPException

from app.controllers import evaluate_controller
from app.schemas.interview_schemas import EvaluateAnswerRequest

router = APIRouter(prefix="/api", tags=["Evaluate"])


@router.post("/evaluate")
def evaluate_answer(req: EvaluateAnswerRequest):
    try:
        return evaluate_controller.handle_evaluate_answer(req)
    except Exception as e:
        print(f"[Router] Error /evaluate: {e}")
        raise HTTPException(status_code=500, detail=str(e))
