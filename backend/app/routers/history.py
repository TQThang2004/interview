"""
Router: History – CRUD lịch sử phỏng vấn.

Endpoints:
  POST   /api/interviews                     – Tạo phiên mới
  GET    /api/interviews                     – Lấy danh sách phiên của user
  GET    /api/interviews/{interview_id}      – Chi tiết 1 phiên
  PATCH  /api/interviews/{interview_id}/complete  – Hoàn thành phiên
  PATCH  /api/interviews/{interview_id}/abandon   – Huỷ / thoát giữa chừng
  POST   /api/interviews/{interview_id}/questions           – Lưu 1 câu hỏi
  PATCH  /api/interviews/{interview_id}/questions/{q_id}    – Lưu câu trả lời + đánh giá
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.schemas.interview_schemas import (
    CreateInterviewBody,
    CompleteInterviewBody,
    SaveQuestionBody,
    UpdateAnswerBody,
)
from app.controllers import history_controller

router = APIRouter(prefix="/api/interviews", tags=["History"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_interview(
    body: CreateInterviewBody,
    current_user: dict = Depends(get_current_user),
):
    """Tạo phiên phỏng vấn mới và trả về interview_id để frontend theo dõi."""
    return await history_controller.handle_create_interview(
        current_user["id"], body.topic, body.level, body.language
    )


@router.get("")
async def list_interviews(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """Lấy danh sách lịch sử phỏng vấn của user hiện tại."""
    return await history_controller.handle_list_interviews(current_user["id"], limit, offset)


@router.get("/{interview_id}")
async def get_interview(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Chi tiết một phiên phỏng vấn kèm tất cả câu hỏi."""
    result = await history_controller.handle_get_interview(interview_id, current_user["id"])
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên phỏng vấn.")
    return result


@router.patch("/{interview_id}/complete")
async def complete_interview(
    interview_id: str,
    body: CompleteInterviewBody,
    current_user: dict = Depends(get_current_user),
):
    """Đánh dấu hoàn thành phiên và lưu điểm tổng / nhận xét tổng."""
    result = await history_controller.handle_complete_interview(
        interview_id, current_user["id"], body.overall_score, body.overall_feedback
    )
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy hoặc không có quyền.")
    return result


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
    return await history_controller.handle_abandon_interview(interview_id, current_user["id"])


@router.post("/{interview_id}/questions", status_code=status.HTTP_201_CREATED)
async def save_question(
    interview_id: str,
    body: SaveQuestionBody,
    current_user: dict = Depends(get_current_user),
):
    """Lưu câu hỏi khi bắt đầu hỏi (chưa có câu trả lời)."""
    return await history_controller.handle_save_question(
        interview_id, body.question_text, body.question_order
    )


@router.patch("/{interview_id}/questions/{question_id}")
async def update_answer(
    interview_id: str,
    question_id: str,
    body: UpdateAnswerBody,
    current_user: dict = Depends(get_current_user),
):
    """Cập nhật câu trả lời và đánh giá AI cho một câu hỏi đã lưu."""
    score_value = body.score if body.score is not None else 0.0
    ok = await history_controller.handle_update_answer(
        question_id, body.user_answer, body.ai_evaluation, score_value
    )
    if not ok:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi.")
    return {"status": "success"}
