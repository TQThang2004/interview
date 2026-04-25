"""
Router: Interview History (CRUD lịch sử phỏng vấn)

Endpoints:
  POST   /api/interviews                     – Tạo phiên mới
  GET    /api/interviews                     – Lấy danh sách phiên của user
  GET    /api/interviews/{interview_id}      – Chi tiết 1 phiên
  PATCH  /api/interviews/{interview_id}/complete  – Hoàn thành phiên
  PATCH  /api/interviews/{interview_id}/abandon   – Huỷ / thoát giữa chừng
  POST   /api/interviews/{interview_id}/questions           – Lưu 1 câu hỏi
  PATCH  /api/interviews/{interview_id}/questions/{q_id}    – Lưu câu trả lời + đánh giá
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.services import interview_service

router = APIRouter(prefix="/api/interviews", tags=["History"])


# ── Request Schemas ─────────────────────────────────────────────────────────

class CreateInterviewBody(BaseModel):
    topic: str
    level: str
    language: str = "vi"


class CompleteInterviewBody(BaseModel):
    overall_score: Optional[float] = None
    overall_feedback: Optional[str] = None


class SaveQuestionBody(BaseModel):
    question_text: str
    question_order: int


class UpdateAnswerBody(BaseModel):
    user_answer: str
    ai_evaluation: str
    score: float


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_interview(
    body: CreateInterviewBody,
    current_user: dict = Depends(get_current_user),
):
    """Tạo phiên phỏng vấn mới và trả về interview_id để frontend theo dõi."""
    interview = await interview_service.create_interview(
        user_id=current_user["id"],
        topic=body.topic,
        level=body.level,
        language=body.language,
    )
    return {"status": "success", "interview": interview}


@router.get("")
async def list_interviews(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """Lấy danh sách lịch sử phỏng vấn của user hiện tại."""
    interviews = await interview_service.get_user_interviews(
        user_id=current_user["id"],
        limit=limit,
        offset=offset,
    )
    return {"status": "success", "interviews": interviews}


@router.get("/{interview_id}")
async def get_interview(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Chi tiết một phiên phỏng vấn kèm tất cả câu hỏi."""
    detail = await interview_service.get_interview_detail(
        interview_id=interview_id,
        user_id=current_user["id"],
    )
    if not detail:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên phỏng vấn.")
    return {"status": "success", "interview": detail}


@router.patch("/{interview_id}/complete")
async def complete_interview(
    interview_id: str,
    body: CompleteInterviewBody,
    current_user: dict = Depends(get_current_user),
):
    """Đánh dấu hoàn thành phiên và lưu điểm tổng / nhận xét tổng."""
    updated = await interview_service.complete_interview(
        interview_id=interview_id,
        user_id=current_user["id"],
        overall_score=body.overall_score,
        overall_feedback=body.overall_feedback,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Không tìm thấy hoặc không có quyền.")
    return {"status": "success", "interview": updated}


@router.patch("/{interview_id}/abandon")
async def abandon_interview(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Huỷ phiên phỏng vấn (người dùng thoát giữa chừng).
    - Nếu chưa trả lời câu nào → xoá khỏi DB.
    - Nếu đã trả lời ít nhất 1 câu → đổi status='cancelled', lưu điểm TB.
    """
    kept = await interview_service.abandon_interview(
        interview_id=interview_id,
        user_id=current_user["id"],
    )
    return {
        "status": "success",
        "kept": kept,  # True = lưu với cancelled, False = đã xoá
    }


@router.post("/{interview_id}/questions", status_code=status.HTTP_201_CREATED)
async def save_question(
    interview_id: str,
    body: SaveQuestionBody,
    current_user: dict = Depends(get_current_user),
):
    """Lưu câu hỏi khi bắt đầu hỏi (chưa có câu trả lời)."""
    q_id = await interview_service.save_question(
        interview_id=interview_id,
        question_text=body.question_text,
        question_order=body.question_order,
    )
    return {"status": "success", "question_id": q_id}


@router.patch("/{interview_id}/questions/{question_id}")
async def update_answer(
    interview_id: str,
    question_id: str,
    body: UpdateAnswerBody,
    current_user: dict = Depends(get_current_user),
):
    """Cập nhật câu trả lời và đánh giá AI cho một câu hỏi đã lưu."""
    ok = await interview_service.update_question_answer(
        question_db_id=question_id,
        user_answer=body.user_answer,
        ai_evaluation=body.ai_evaluation,
        score=body.score,
    )
    if not ok:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi.")
    return {"status": "success"}
