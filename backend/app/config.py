"""
DEPRECATED – Backward compatibility shim.

File này chỉ re-export từ app.core.config.
Hãy import trực tiếp từ app.core.config thay vì app.config.

Giữ lại để các module ngoài (data_pipeline, scripts) không bị vỡ import.
"""
from app.core.config import (  # noqa: F401 – re-export
    GOOGLE_API_KEY,
    GOOGLE_API_KEY_EMBEDDING,
    GOOGLE_API_KEY_TRANSLATE,
    GOOGLE_API_KEY_EXTRACT_TOPIC,
    GOOGLE_API_KEY_GENERATE_Q,
    GOOGLE_API_KEY_EVALUATE,
    LLM_MODEL,
    EMBED_MODEL,
    CHROMA_DB_PATH,
    COLLECTION_NAME,
    TOP_K_RETRIEVE,
    NUM_QUESTIONS,
    LLM_RETRY_WAIT,
)
