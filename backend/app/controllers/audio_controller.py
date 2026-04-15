"""
Audio Controller – business logic cho transcribe (STT) và TTS.
"""
from fastapi import UploadFile
from fastapi.responses import Response

from app.schemas.models import TTSRequest
from app.services import audio_service


async def handle_transcribe(audio: UploadFile) -> dict:
    """Chuyển đổi audio bytes -> văn bản bằng Gemini STT."""
    audio_bytes = await audio.read()
    text = audio_service.transcribe_audio_gemini(audio_bytes)
    return {"status": "success", "text": text}


def handle_tts(req: TTSRequest) -> Response:
    """Chuyển đổi văn bản -> audio MP3 bằng gTTS."""
    audio_bytes = audio_service.generate_tts(req.text, req.language)
    return Response(content=audio_bytes, media_type="audio/mpeg")
