"""
Router: Interview – POST /api/start-interview
"""
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.controllers import interview_controller
from app.core.constants import ALLOWED_CV_MIME_TYPES, ALLOWED_CV_EXTENSIONS

router = APIRouter(prefix="/api", tags=["Interview"])


@router.post("/start-interview")
async def start_interview(
    cv: UploadFile = File(None),
    jd: str = Form(""),
    level: str = Form("Junior"),
    language: str = Form("vi"),
):
    # ── Validate đầu vào ───────────────────────────────────────────────────────
    # 1. CV bắt buộc phải được gửi kèm
    if cv is None or cv.filename == "":
        raise HTTPException(
            status_code=422,
            detail="CV là bắt buộc. Vui lòng tải lên file CV của bạn."
        )

    # 2. CV phải là file PDF (kiểm tra MIME type và đuôi file)
    is_pdf_mime = cv.content_type in ALLOWED_CV_MIME_TYPES
    is_pdf_ext  = (cv.filename or "").lower().endswith(ALLOWED_CV_EXTENSIONS)
    if not (is_pdf_mime or is_pdf_ext):
        raise HTTPException(
            status_code=422,
            detail=f"CV phải là file PDF. File '{cv.filename}' không được chấp nhận."
        )

    # 3. JD bắt buộc không được để trống
    if not jd or not jd.strip():
        raise HTTPException(
            status_code=422,
            detail="Mô tả công việc (JD) là bắt buộc. Vui lòng nhập nội dung JD."
        )

    try:
        return await interview_controller.handle_start_interview(cv, jd, level, language)
    except Exception as e:
        print(f"[Router] Error /start-interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))
