"""
Utils LLM Client – helper dùng chung cho toàn bộ services LLM.

Cung cấp:
- GeminiClient: configure + gọi LLM có retry tự động
- parse_json_safely: làm sạch markdown block rồi parse JSON
"""
from __future__ import annotations

import json
from typing import Any

from app.core.config import LLM_MODEL
from app.core.logging import get_logger
from app.utils.gemini_client import generate_text

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# JSON helper
# ---------------------------------------------------------------------------

def parse_json_safely(raw: str) -> Any | None:
    """Làm sạch markdown fence rồi parse JSON từ output LLM."""
    cleaned = raw.strip()
    if not cleaned:
        logger.warning("LLM returned empty output; cannot parse JSON.")
        return None
    if cleaned.startswith("(") and cleaned.endswith(")") and "LLM" in cleaned:
        logger.warning("LLM returned an internal error message; skip JSON parsing.")
        return None

    # Bóc markdown code-fence nếu có
    for prefix in ("```json", "```"):
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):]
            break
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    try:
        return json.loads(cleaned.strip())
    except Exception as e:
        logger.warning("Failed to parse LLM JSON output: %s", e)
        return None


# ---------------------------------------------------------------------------
# GeminiClient
# ---------------------------------------------------------------------------

class GeminiClient:
    """
    Wrapper quanh Google Gen AI SDK để:
    - Configure API key trước mỗi lần gọi (an toàn đa luồng).
    - Retry tự động khi bị rate-limit (429 / RESOURCE_EXHAUSTED).
    - Cung cấp generate() trả về str thuần.
    """

    def __init__(self, api_key: str, model: str = LLM_MODEL):
        self._api_key = api_key
        self._model = model

    def generate(self, prompt: str, max_retries: int = 3) -> str:
        """
        Gửi prompt, retry nếu rate-limit.
        Trả về text thuần hoặc chuỗi lỗi (không raise exception).
        """
        return generate_text(self._api_key, prompt, self._model, max_retries)

    def generate_json(self, prompt: str, max_retries: int = 3) -> Any | None:
        """Gọi generate() và parse kết quả thành JSON. Trả về None nếu lỗi."""
        raw = self.generate(prompt, max_retries)
        return parse_json_safely(raw)
