"""
Core Config – đọc biến môi trường và định nghĩa các cấu hình toàn cục.

Tất cả cấu hình hệ thống được tập trung tại đây.
Các module khác import từ đây thay vì đọc trực tiếp os.getenv().
"""
import os
import logging
from dotenv import load_dotenv

# Load .env từ thư mục gốc dự án (Data/.env)
_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(dotenv_path=_env_path, override=True)

# -- API Keys --
GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
# Task-specific keys (fallback to global key if not set)
GOOGLE_API_KEY_EMBEDDING: str = os.getenv("GOOGLE_API_KEY_EMBEDDING", GOOGLE_API_KEY)
GOOGLE_API_KEY_TRANSLATE: str = os.getenv("GOOGLE_API_KEY_TRANSLATE", GOOGLE_API_KEY)
GOOGLE_API_KEY_EXTRACT_TOPIC: str = os.getenv("GOOGLE_API_KEY_EXTRACT_TOPIC", GOOGLE_API_KEY)
GOOGLE_API_KEY_GENERATE_Q: str = os.getenv("GOOGLE_API_KEY_GENERATE_Q", GOOGLE_API_KEY)
GOOGLE_API_KEY_EVALUATE: str = os.getenv("GOOGLE_API_KEY_EVALUATE", GOOGLE_API_KEY)
GOOGLE_API_KEY_AUDIO: str = os.getenv("GOOGLE_API_KEY", GOOGLE_API_KEY)

# -- Cloudinary --
CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

# -- Email / SMTP (optional) --
SMTP_HOST: str = os.getenv("SMTP_HOST", "")
SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", SMTP_USERNAME)
SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() in {"1", "true", "yes", "on"}

if not GOOGLE_API_KEY:
    logging.getLogger(__name__).warning("GOOGLE_API_KEY is not configured; AI modules may fail without task-specific keys.")

# -- Model names --
LLM_MODEL: str = "gemini-2.5-flash"
EMBED_MODEL: str = "models/gemini-embedding-001"

# -- ChromaDB --
CHROMA_DB_PATH: str = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../chroma_db")
)
COLLECTION_NAME: str = "interview_questions"

# -- RAG settings --
TOP_K_RETRIEVE: int = 20
NUM_QUESTIONS: int = 5

# -- LLM retry --
LLM_RETRY_WAIT: int = 45  # giây chờ khi bị rate-limit
