import io

from gtts import gTTS

from app.core.config import GOOGLE_API_KEY_AUDIO, LLM_MODEL
from app.core.logging import get_logger
from app.utils.gemini_client import transcribe_audio

logger = get_logger(__name__)


def transcribe_audio_gemini(audio_bytes: bytes) -> str:
    prompt = (
        "Lắng nghe và chép lại đoạn thu âm này. "
        "Người nói đang sử dụng Tiếng Việt và các thuật ngữ chuyên ngành IT "
        "(ví dụ: ReactJS, NodeJS, Database, Framework, Code, Bug, Vinglish). "
        "Ưu tiên chép chính xác từ chuyên môn. "
        "Trả về phần text nội dung, tuyệt đối không suy diễn thêm hay bình luận:"
    )
    try:
        return transcribe_audio(
            api_key=GOOGLE_API_KEY_AUDIO,
            prompt=prompt,
            audio_bytes=audio_bytes,
            mime_type="audio/webm",
            model=LLM_MODEL,
        )
    except Exception as exc:
        logger.warning("Gemini STT failed: %s", exc)
        return f"(Lỗi khi phân tích audio bằng Gemini: {exc})"


def generate_tts(text: str, language: str = "vi") -> bytes:
    try:
        lang_code = "vi" if language == "vi" else "en"
        tts = gTTS(text=text, lang=lang_code, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        return fp.getvalue()
    except Exception:
        logger.exception("gTTS generation failed")
        raise
