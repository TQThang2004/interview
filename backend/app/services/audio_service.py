"""
Service xử lý audio: Speech-to-Text bằng Gemini và Text-to-Speech bằng gTTS.
"""
import io
import google.generativeai as genai
from gtts import gTTS

from app.config import GOOGLE_API_KEY, LLM_MODEL

genai.configure(api_key=GOOGLE_API_KEY)


def _get_llm():
    return genai.GenerativeModel(LLM_MODEL)


def transcribe_audio_gemini(audio_bytes: bytes) -> str:
    """
    Dùng Gemini Multimodal để chuyển audio -> văn bản.
    Hỗ trợ Tiếng Việt pha thuật ngữ IT (Vinglish).
    """
    model = _get_llm()
    prompt = (
        "Lắng nghe và chép lời đoạn thu âm này. "
        "Người nói đang sử dụng Tiếng Việt và các thuật ngữ chuyên ngành IT "
        "(ví dụ: ReactJS, NodeJS, Database, Framework, Code, Bug, Vinglish). "
        "Ưu tiên chép chính xác từ chuyên môn. "
        "Trả về phần text nội dung, tuyệt đối không suy diễn thêm hay bình luận:"
    )
    try:
        response = model.generate_content([
            prompt,
            {"mime_type": "audio/webm", "data": audio_bytes},
        ])
        return response.text.strip()
    except Exception as e:
        print(f"[AudioService] Error Gemini STT: {e}")
        return f"(Lỗi khi phân tích audio bằng Gemini: {e})"


def generate_tts(text: str, language: str = "vi") -> bytes:
    """
    Tạo file MP3 từ gTTS (Google Translate TTS – miễn phí).
    Trả về raw bytes của file MP3.
    """
    try:
        lang_code = "vi" if language == "vi" else "en"
        tts = gTTS(text=text, lang=lang_code, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        return fp.getvalue()
    except Exception as e:
        print(f"[AudioService] Error gTTS: {e}")
        raise
