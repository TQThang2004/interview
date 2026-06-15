"""
Router: Audio – POST /api/transcribe, POST /api/tts
"""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.controllers import audio_controller
from app.core.dependencies import get_current_user
from app.core.logging import get_logger
from app.core.rate_limit import rate_limit
from app.schemas.interview_schemas import TTSRequest

router = APIRouter(prefix="/api", tags=["Audio"])
logger = get_logger(__name__)


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    _: None = Depends(rate_limit(max_requests=30, window_seconds=60)),
):
    try:
        return await audio_controller.handle_transcribe(audio)
    except Exception as e:
        logger.exception("Failed to transcribe audio")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tts")
def generate_tts(
    req: TTSRequest,
    current_user: dict = Depends(get_current_user),
    _: None = Depends(rate_limit(max_requests=60, window_seconds=60)),
):
    try:
        return audio_controller.handle_tts(req)
    except Exception as e:
        logger.exception("Failed to generate TTS audio")
        raise HTTPException(status_code=500, detail=str(e))
