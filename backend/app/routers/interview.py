"""
Router: Interview – POST /api/start-interview
"""
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.controllers import interview_controller

router = APIRouter(prefix="/api", tags=["Interview"])


@router.post("/start-interview")
async def start_interview(
    cv: UploadFile = File(None),
    jd: str = Form(""),
    level: str = Form("Junior"),
    language: str = Form("vi"),
):
    try:
        return await interview_controller.handle_start_interview(cv, jd, level, language)
    except Exception as e:
        print(f"[Router] Error /start-interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))
