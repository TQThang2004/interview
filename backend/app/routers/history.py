"""
Router: History â€“ CRUD lá»‹ch sá»­ phá»ng váº¥n.

Endpoints:
  POST   /api/interviews                     â€“ Táº¡o phiÃªn má»›i
  GET    /api/interviews                     â€“ Láº¥y danh sÃ¡ch phiÃªn cá»§a user
  GET    /api/interviews/{interview_id}      â€“ Chi tiáº¿t 1 phiÃªn
  PATCH  /api/interviews/{interview_id}/complete  â€“ HoÃ n thÃ nh phiÃªn
  PATCH  /api/interviews/{interview_id}/abandon   â€“ Huá»· / thoÃ¡t giá»¯a chá»«ng
  POST   /api/interviews/{interview_id}/questions           â€“ LÆ°u 1 cÃ¢u há»i
  PATCH  /api/interviews/{interview_id}/questions/{q_id}    â€“ LÆ°u cÃ¢u tráº£ lá»i + Ä‘Ã¡nh giÃ¡
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.logging import get_logger
from app.core.dependencies import get_current_user
from app.schemas.interview_schemas import (
    CreateInterviewBody,
    CompleteInterviewBody,
    SaveQuestionBody,
    UpdateAnswerBody,
)
from app.controllers import history_controller

router = APIRouter(prefix="/api/interviews", tags=["History"])
logger = get_logger(__name__)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_interview(
    body: CreateInterviewBody,
    current_user: dict = Depends(get_current_user),
):
    """Táº¡o phiÃªn phá»ng váº¥n má»›i vÃ  tráº£ vá» interview_id Ä‘á»ƒ frontend theo dÃµi."""
    return await history_controller.handle_create_interview(
        current_user["id"], body.topic, body.level, body.language
    )


@router.get("")
async def list_interviews(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """Láº¥y danh sÃ¡ch lá»‹ch sá»­ phá»ng váº¥n cá»§a user hiá»‡n táº¡i."""
    return await history_controller.handle_list_interviews(current_user["id"], limit, offset)


@router.get("/{interview_id}")
async def get_interview(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Chi tiáº¿t má»™t phiÃªn phá»ng váº¥n kÃ¨m táº¥t cáº£ cÃ¢u há»i."""
    result = await history_controller.handle_get_interview(interview_id, current_user["id"])
    if not result:
        raise HTTPException(status_code=404, detail="KhÃ´ng tÃ¬m tháº¥y phiÃªn phá»ng váº¥n.")
    return result


@router.patch("/{interview_id}/complete")
async def complete_interview(
    interview_id: str,
    body: CompleteInterviewBody,
    current_user: dict = Depends(get_current_user),
):
    """ÄÃ¡nh dáº¥u hoÃ n thÃ nh phiÃªn vÃ  lÆ°u Ä‘iá»ƒm tá»•ng / nháº­n xÃ©t tá»•ng."""
    result = await history_controller.handle_complete_interview(
        interview_id, current_user["id"], body.overall_score, body.overall_feedback
    )
    if not result:
        raise HTTPException(status_code=404, detail="KhÃ´ng tÃ¬m tháº¥y hoáº·c khÃ´ng cÃ³ quyá»n.")
    return result


@router.patch("/{interview_id}/abandon")
async def abandon_interview(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Huá»· phiÃªn phá»ng váº¥n (ngÆ°á»i dÃ¹ng thoÃ¡t giá»¯a chá»«ng).
    - Náº¿u chÆ°a tráº£ lá»i cÃ¢u nÃ o â†’ xoÃ¡ khá»i DB.
    - Náº¿u Ä‘Ã£ tráº£ lá»i Ã­t nháº¥t 1 cÃ¢u â†’ Ä‘á»•i status='cancelled', lÆ°u Ä‘iá»ƒm TB.
    """
    return await history_controller.handle_abandon_interview(interview_id, current_user["id"])


@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interview(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    """XÃ³a lá»‹ch sá»­ phá»ng váº¥n cá»§a ngÆ°á»i dÃ¹ng."""
    deleted = await history_controller.handle_delete_interview(interview_id, current_user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="KhÃ´ng tÃ¬m tháº¥y phiÃªn phá»ng váº¥n hoáº·c khÃ´ng cÃ³ quyá»n.")


@router.post("/{interview_id}/questions", status_code=status.HTTP_201_CREATED)
async def save_question(
    interview_id: str,
    body: SaveQuestionBody,
    current_user: dict = Depends(get_current_user),
):
    """LÆ°u cÃ¢u há»i khi báº¯t Ä‘áº§u há»i (chÆ°a cÃ³ cÃ¢u tráº£ lá»i)."""
    result = await history_controller.handle_save_question(
        interview_id, current_user["id"], body.question_text, body.question_order
    )
    if result.get("status") == "not_found":
        raise HTTPException(status_code=404, detail="KhÃ´ng tÃ¬m tháº¥y phiÃªn phá»ng váº¥n hoáº·c khÃ´ng cÃ³ quyá»n.")
    return result


@router.patch("/{interview_id}/questions/{question_id}")
async def update_answer(
    interview_id: str,
    question_id: str,
    body: UpdateAnswerBody,
    current_user: dict = Depends(get_current_user),
):
    """Cáº­p nháº­t cÃ¢u tráº£ lá»i vÃ  Ä‘Ã¡nh giÃ¡ AI cho má»™t cÃ¢u há»i Ä‘Ã£ lÆ°u."""
    # Validate score range
    score_value = max(0.0, min(10.0, body.score))
    if score_value != body.score:
        logger.warning("Clamped interview question score from %s to %s", body.score, score_value)


    ok = await history_controller.handle_update_answer(
        interview_id, question_id, current_user["id"], body.user_answer, body.ai_evaluation, score_value
    )
    if not ok:
        raise HTTPException(status_code=404, detail="KhÃ´ng tÃ¬m tháº¥y cÃ¢u há»i.")
    return {"status": "success"}
