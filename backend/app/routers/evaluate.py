"""
Router: Evaluate

Endpoints:
  POST   /api/evaluate                            – Chấm điểm câu trả lời phỏng vấn
  POST   /api/evaluate/cv                         – Đánh giá CV (không lưu)
  POST   /api/evaluate/cv/save                    – Lưu bản đánh giá CV (cần auth)
  GET    /api/evaluate/cv/history                  – Danh sách lịch sử đánh giá CV
  GET    /api/evaluate/cv/history/{evaluation_id}  – Chi tiết 1 bản đánh giá
  DELETE /api/evaluate/cv/history/{evaluation_id}  – Xóa bản đánh giá
  GET    /api/evaluate/cv/count                    – Đếm số bản hiện có
"""
import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.controllers import evaluate_controller
from app.controllers import cv_evaluation_controller
from app.core.constants import ALLOWED_CV_MIME_TYPES, ALLOWED_CV_EXTENSIONS
from app.core.dependencies import get_current_user
from app.schemas.interview_schemas import EvaluateAnswerRequest

router = APIRouter(prefix="/api", tags=["Evaluate"])


# ---------------------------------------------------------------------------
# Đánh giá câu trả lời phỏng vấn
# ---------------------------------------------------------------------------

@router.post("/evaluate")
def evaluate_answer(req: EvaluateAnswerRequest):
    try:
        return evaluate_controller.handle_evaluate_answer(req)
    except Exception as e:
        print(f"[Router] Error /evaluate: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Đánh giá CV (không lưu – không cần auth)
# ---------------------------------------------------------------------------

@router.post("/evaluate/cv")
async def evaluate_cv(cv: UploadFile = File(...)):
    if cv is None or cv.filename == "":
        raise HTTPException(status_code=422, detail="CV là bắt buộc.")

    is_pdf_mime = cv.content_type in ALLOWED_CV_MIME_TYPES
    is_pdf_ext  = (cv.filename or "").lower().endswith(ALLOWED_CV_EXTENSIONS)
    if not (is_pdf_mime or is_pdf_ext):
        raise HTTPException(status_code=422, detail="Chỉ hỗ trợ file PDF.")

    try:
        return await evaluate_controller.handle_evaluate_cv_file(cv)
    except Exception as e:
        print(f"[Router] Error /evaluate/cv: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Lịch sử đánh giá CV (cần auth)
# ---------------------------------------------------------------------------

@router.post("/evaluate/cv/save", status_code=201)
async def save_cv_evaluation(
    cv: UploadFile = File(...),
    evaluation_result: str = Form(...),   # JSON string
    cv_text: str = Form(default=""),
    current_user: dict = Depends(get_current_user),
):
    """
    Lưu bản đánh giá CV.
    Nhận multipart/form-data:
      - cv: file PDF
      - evaluation_result: JSON string kết quả đánh giá
      - cv_text: text đã parse từ PDF
    """
    # Validate file CV
    is_pdf_mime = cv.content_type in ALLOWED_CV_MIME_TYPES
    is_pdf_ext  = (cv.filename or "").lower().endswith(ALLOWED_CV_EXTENSIONS)
    if not (is_pdf_mime or is_pdf_ext):
        raise HTTPException(status_code=422, detail="Chỉ hỗ trợ file PDF.")

    # Parse evaluation_result JSON string
    try:
        eval_dict = json.loads(evaluation_result)
    except Exception:
        raise HTTPException(status_code=422, detail="evaluation_result phải là JSON hợp lệ.")

    return await cv_evaluation_controller.handle_save_cv_evaluation(
        user_id=current_user["id"],
        cv_file=cv,
        evaluation_result=eval_dict,
        cv_text=cv_text,
    )


@router.get("/evaluate/cv/count")
async def count_cv_evaluations(current_user: dict = Depends(get_current_user)):
    """Trả về số bản đánh giá CV hiện có và giới hạn."""
    return await cv_evaluation_controller.handle_count_cv_evaluations(current_user["id"])


@router.get("/evaluate/cv/history")
async def list_cv_evaluations(
    limit: int = 10,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """Lấy danh sách lịch sử đánh giá CV."""
    return await cv_evaluation_controller.handle_list_cv_evaluations(
        current_user["id"], limit, offset
    )


@router.get("/evaluate/cv/history/{evaluation_id}")
async def get_cv_evaluation(
    evaluation_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Chi tiết 1 bản đánh giá CV (kèm cv_text và cloudinary_url)."""
    return await cv_evaluation_controller.handle_get_cv_evaluation(
        evaluation_id, current_user["id"]
    )


@router.delete("/evaluate/cv/history/{evaluation_id}")
async def delete_cv_evaluation(
    evaluation_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Xóa bản đánh giá CV (xóa DB + file Cloudinary)."""
    return await cv_evaluation_controller.handle_delete_cv_evaluation(
        evaluation_id, current_user["id"]
    )
