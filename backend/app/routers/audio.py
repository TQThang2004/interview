"""
Router: Audio – POST /api/transcribe, POST /api/tts
"""
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.controllers import audio_controller
from app.schemas.interview_schemas import TTSRequest

router = APIRouter(prefix="/api", tags=["Audio"])


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    try:
        return await audio_controller.handle_transcribe(audio)
    except Exception as e:
        print(f"[Router] Error /transcribe: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tts")
def generate_tts(req: TTSRequest):
    try:
        return audio_controller.handle_tts(req)
    except Exception as e:
        print(f"[Router] Error /tts: {e}")
        raise HTTPException(status_code=500, detail=str(e))
