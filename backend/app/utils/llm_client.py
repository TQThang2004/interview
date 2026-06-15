"""
Utils LLM Client â€“ helper dÃ¹ng chung cho toÃ n bá»™ services LLM.

Cung cáº¥p:
- GeminiClient: configure + gá»i LLM cÃ³ retry tá»± Ä‘á»™ng
- parse_json_safely: lÃ m sáº¡ch markdown block rá»“i parse JSON
"""
from __future__ import annotations

import json
import time
from typing import Any

import google.generativeai as genai

from app.core.config import LLM_MODEL, LLM_RETRY_WAIT
from app.core.logging import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# JSON helper
# ---------------------------------------------------------------------------

def parse_json_safely(raw: str) -> Any | None:
    """LÃ m sáº¡ch markdown fence rá»“i parse JSON tá»« output LLM."""
    cleaned = raw.strip()
    # BÃ³c markdown code-fence náº¿u cÃ³
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
    Wrapper quanh google.generativeai Ä‘á»ƒ:
    - Configure API key trÆ°á»›c má»—i láº§n gá»i (an toÃ n Ä‘a luá»“ng).
    - Retry tá»± Ä‘á»™ng khi bá»‹ rate-limit (429 / RESOURCE_EXHAUSTED).
    - Cung cáº¥p generate() tráº£ vá» str thuáº§n.
    """

    def __init__(self, api_key: str, model: str = LLM_MODEL):
        self._api_key = api_key
        self._model = model

    def _configure(self) -> genai.GenerativeModel:
        genai.configure(api_key=self._api_key)
        return genai.GenerativeModel(self._model)

    def generate(self, prompt: str, max_retries: int = 3) -> str:
        """
        Gá»­i prompt, retry náº¿u rate-limit.
        Tráº£ vá» text thuáº§n hoáº·c chuá»—i lá»—i (khÃ´ng raise exception).
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
                    logger.warning("LLM rate limited; retrying in %ss (%s/%s)", wait, attempt, max_retries)
                    time.sleep(wait)
                else:
                    logger.warning("LLM request failed: %s", err[:200])
                    return "(Lá»—i há»‡ thá»‘ng LLM. KhÃ´ng thá»ƒ thá»±c hiá»‡n vÃ o lÃºc nÃ y.)"
        return "(VÆ°á»£t quÃ¡ sá»‘ láº§n thá»­ tá»‘i Ä‘a cá»§a LLM API.)"

    def generate_json(self, prompt: str, max_retries: int = 3) -> Any | None:
        """Gá»i generate() vÃ  parse káº¿t quáº£ thÃ nh JSON. Tráº£ vá» None náº¿u lá»—i."""
        raw = self.generate(prompt, max_retries)
        return parse_json_safely(raw)
