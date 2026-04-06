import google.generativeai as genai
import io
import os
from gtts import gTTS
from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(dotenv_path=env_path, override=True)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Lỗi: Không tìm thấy GOOGLE_API_KEY trong file .env")

genai.configure(api_key=GOOGLE_API_KEY)
LLM_MODEL = "gemini-2.5-flash"

def get_llm():
    return genai.GenerativeModel(LLM_MODEL)

def transcribe_audio_gemini(audio_bytes: bytes) -> str:
    """Sử dụng Gemini 1.5 Flash Multimodal để nghe file audio."""
    model = get_llm()
    prompt = "Lắng nghe và chép lời đoạn thu âm này. Người nói đang sử dụng Tiếng Việt và các thuật ngữ chuyên ngành IT (ví dụ: ReactJS, NodeJS, Database, Framework, Code, Bug, Vinglish). Ưu tiên chép chính xác từ chuyên môn. Trả về phần text nội dung, tuyệt đối không suy diễn thêm hay bình luận:"
    
    try:
        response = model.generate_content([
            prompt,
            {"mime_type": "audio/webm", "data": audio_bytes}
        ])
        return response.text.strip()
    except Exception as e:
        print(f"Error Gemini Speech to Text: {e}")
        return f"(Lỗi khi phân tích audio bằng Gemini: {e})"

def generate_tts(text: str, language: str = "vi") -> bytes:
    """Tạo file MP3 từ gTTS (Google Translate API) miễn phí"""
    try:
        lang_code = "vi" if language == "vi" else "en"
        tts = gTTS(text=text, lang=lang_code, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        return fp.getvalue()
    except Exception as e:
        print(f"Error gTTS: {e}")
        raise
