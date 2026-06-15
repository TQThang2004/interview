"""
Router: Practice – Luyện tập theo Chủ đề (Quiz).

Endpoints:
  GET    /api/practice/topics                          – Danh sách chủ đề
  POST   /api/practice/start                           – Bắt đầu bài kiểm tra
  POST   /api/practice/sessions/{id}/submit            – Nộp toàn bộ bài (Phương án B)
  PATCH  /api/practice/sessions/{id}/abandon           – Huỷ bài
  GET    /api/practice/sessions                        – Lịch sử bài kiểm tra
  GET    /api/practice/sessions/{id}                   – Chi tiết 1 bài
  GET    /api/practice/stats                           – Thống kê cho Dashboard
  DELETE /api/practice/sessions/{id}                   – Xóa bài kiểm tra
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.schemas.practice_schemas import StartPracticeBody, SubmitQuizBody
from app.controllers import practice_controller

router = APIRouter(prefix="/api/practice", tags=["Practice"])


@router.get("/topics")
async def get_topics():
    """Danh sách 13 chủ đề luyện tập."""
    return await practice_controller.handle_get_topics()


@router.post("/start", status_code=status.HTTP_201_CREATED)
async def start_practice(
    body: StartPracticeBody,
    current_user: dict = Depends(get_current_user),
):
    """
    Bắt đầu bài kiểm tra: lấy câu hỏi từ ChromaDB → tạo session.
    Trả về session_id + danh sách câu hỏi (không có đáp án).
    """
    result = await practice_controller.handle_start_practice(
        user_id=current_user["id"],
        topic=body.topic,
        level=body.level,
        language=body.language,
        num_q=body.num_questions,
    )
    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])
    return result


@router.post("/sessions/{session_id}/submit")
async def submit_quiz(
    session_id: str,
    body: SubmitQuizBody,
    current_user: dict = Depends(get_current_user),
):
    """
    Nộp toàn bộ bài kiểm tra (Phương án B).
    Chấm điểm tất cả câu, trả về kết quả chi tiết + đáp án tham khảo.
    """
    # Lấy thông tin session để biết level/language
    session_detail = await practice_controller.handle_get_detail(session_id, current_user["id"])
    if not session_detail:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài kiểm tra.")
    if session_detail["status"] != "in_progress":
        raise HTTPException(status_code=400, detail="Bài kiểm tra đã được nộp.")

    result = await practice_controller.handle_submit_quiz(
        session_id=session_id,
        user_id=current_user["id"],
        answers_input=body.answers,
        level=session_detail["level"],
        language=session_detail["language"],
    )
    return result


@router.patch("/sessions/{session_id}/abandon")
async def abandon_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Huỷ bài kiểm tra đang làm."""
    return await practice_controller.handle_abandon_session(session_id, current_user["id"])


@router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    """Thống kê luyện tập theo chủ đề (cho Dashboard)."""
    return await practice_controller.handle_get_stats(current_user["id"])


@router.get("/sessions")
async def list_sessions(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """Lịch sử bài kiểm tra của user."""
    return await practice_controller.handle_get_sessions(current_user["id"], limit, offset)


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Chi tiết 1 bài kiểm tra (kèm đáp án sau khi hoàn thành)."""
    result = await practice_controller.handle_get_detail(session_id, current_user["id"])
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài kiểm tra.")
    return {"session": result}


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Xóa bài kiểm tra."""
    deleted = await practice_controller.handle_delete_session(session_id, current_user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài kiểm tra.")
