"""
Cấu hình toàn cục: load biến môi trường và định nghĩa các hằng số.
"""
import os
from dotenv import load_dotenv

# Load .env từ thư mục gốc dự án (Data/.env)
_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(dotenv_path=_env_path, override=True)

# -- API Keys --
GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
if not GOOGLE_API_KEY:
    raise ValueError("Lỗi: Không tìm thấy GOOGLE_API_KEY trong file .env")

# -- Model names --
LLM_MODEL: str = "gemini-2.5-flash"
EMBED_MODEL: str = "models/gemini-embedding-001"

# -- ChromaDB --
CHROMA_DB_PATH: str = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../chroma_db")
)
COLLECTION_NAME: str = "interview_questions"

# -- RAG settings --
TOP_K_RETRIEVE: int = 50
NUM_QUESTIONS: int = 5

# -- LLM retry --
LLM_RETRY_WAIT: int = 45  # giây chờ khi bị rate-limit
