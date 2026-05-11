"""
Utils LLM Client – helper dùng chung cho toàn bộ services LLM.

Cung cấp:
- GeminiClient: configure + gọi LLM có retry tự động
- parse_json_safely: làm sạch markdown block rồi parse JSON
"""
from __future__ import annotations

import json
import time
from typing import Any

import google.generativeai as genai

from app.core.config import LLM_MODEL, LLM_RETRY_WAIT


# ---------------------------------------------------------------------------
# JSON helper
# ---------------------------------------------------------------------------

def parse_json_safely(raw: str) -> Any | None:
    """Làm sạch markdown fence rồi parse JSON từ output LLM."""
    cleaned = raw.strip()
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
        print(f"[LLMClient] Lỗi parse JSON: {e}")
        return None


# ---------------------------------------------------------------------------
# GeminiClient
# ---------------------------------------------------------------------------

class GeminiClient:
    """
    Wrapper quanh google.generativeai để:
    - Configure API key trước mỗi lần gọi (an toàn đa luồng).
    - Retry tự động khi bị rate-limit (429 / RESOURCE_EXHAUSTED).
    - Cung cấp generate() trả về str thuần.
    """

    def __init__(self, api_key: str, model: str = LLM_MODEL):
        self._api_key = api_key
        self._model = model

    def _configure(self) -> genai.GenerativeModel:
        genai.configure(api_key=self._api_key)
        return genai.GenerativeModel(self._model)

    def generate(self, prompt: str, max_retries: int = 3) -> str:
        """
        Gửi prompt, retry nếu rate-limit.
        Trả về text thuần hoặc chuỗi lỗi (không raise exception).
        """
        llm = self._configure()
        for attempt in range(1, max_retries + 1):
            try:
                response = llm.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                err = str(e)
                if "429" in err or "RESOURCE_EXHAUSTED" in err or "quota" in err.lower():
                    wait = LLM_RETRY_WAIT * attempt
                    print(
                        f"[LLMClient] Rate-limit – chờ {wait}s "
                        f"(lần {attempt}/{max_retries})..."
                    )
                    time.sleep(wait)
                else:
                    print(f"[LLMClient] Lỗi LLM: {err[:200]}")
                    return "(Lỗi hệ thống LLM. Không thể thực hiện vào lúc này.)"
        return "(Vượt quá số lần thử tối đa của LLM API.)"

    def generate_json(self, prompt: str, max_retries: int = 3) -> Any | None:
        """Gọi generate() và parse kết quả thành JSON. Trả về None nếu lỗi."""
        raw = self.generate(prompt, max_retries)
        return parse_json_safely(raw)
