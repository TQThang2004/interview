"""
Service xá»­ lÃ½ audio: Speech-to-Text báº±ng Gemini vÃ  Text-to-Speech báº±ng gTTS.
"""
import io
import google.generativeai as genai
from gtts import gTTS

from app.core.config import GOOGLE_API_KEY_AUDIO, LLM_MODEL
from app.core.logging import get_logger

genai.configure(api_key=GOOGLE_API_KEY_AUDIO)
logger = get_logger(__name__)


def _get_llm():
    return genai.GenerativeModel(LLM_MODEL)


def transcribe_audio_gemini(audio_bytes: bytes) -> str:
    """
    DÃ¹ng Gemini Multimodal Ä‘á»ƒ chuyá»ƒn audio -> vÄƒn báº£n.
    Há»— trá»£ Tiáº¿ng Viá»‡t pha thuáº­t ngá»¯ IT (Vinglish).
    """
    model = _get_llm()
    prompt = (
        "Láº¯ng nghe vÃ  chÃ©p lá»i Ä‘oáº¡n thu Ã¢m nÃ y. "
        "NgÆ°á»i nÃ³i Ä‘ang sá»­ dá»¥ng Tiáº¿ng Viá»‡t vÃ  cÃ¡c thuáº­t ngá»¯ chuyÃªn ngÃ nh IT "
        "(vÃ­ dá»¥: ReactJS, NodeJS, Database, Framework, Code, Bug, Vinglish). "
        "Æ¯u tiÃªn chÃ©p chÃ­nh xÃ¡c tá»« chuyÃªn mÃ´n. "
        "Tráº£ vá» pháº§n text ná»™i dung, tuyá»‡t Ä‘á»‘i khÃ´ng suy diá»…n thÃªm hay bÃ¬nh luáº­n:"
    )
    try:
        response = model.generate_content([
            prompt,
            {"mime_type": "audio/webm", "data": audio_bytes},
        ])
        return response.text.strip()
    except Exception as e:
        logger.warning("Gemini STT failed: %s", e)
        return f"(Lá»—i khi phÃ¢n tÃ­ch audio báº±ng Gemini: {e})"


def generate_tts(text: str, language: str = "vi") -> bytes:
    """
    Táº¡o file MP3 tá»« gTTS (Google Translate TTS â€“ miá»…n phÃ­).
    Tráº£ vá» raw bytes cá»§a file MP3.
    """
    try:
        lang_code = "vi" if language == "vi" else "en"
        tts = gTTS(text=text, lang=lang_code, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        return fp.getvalue()
    except Exception as e:
        logger.exception("gTTS generation failed")
        raise
