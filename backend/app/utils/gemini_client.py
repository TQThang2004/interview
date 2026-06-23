from __future__ import annotations

import time
from typing import Sequence

from google import genai
from google.genai import types

from app.core.config import EMBED_MODEL, LLM_MODEL, LLM_RETRY_WAIT
from app.core.logging import get_logger

logger = get_logger(__name__)


RETRYABLE_ERROR_MARKERS = (
    "429",
    "500",
    "502",
    "503",
    "504",
    "RESOURCE_EXHAUSTED",
    "UNAVAILABLE",
    "INTERNAL",
    "DEADLINE_EXCEEDED",
    "timeout",
    "timed out",
    "quota",
    "rate",
    "temporarily",
    "high demand",
)

RATE_LIMIT_ERROR_MARKERS = (
    "429",
    "RESOURCE_EXHAUSTED",
    "quota",
    "rate",
)


def normalize_model_name(model: str) -> str:
    return model.removeprefix("models/")


def is_retryable_error(error_text: str) -> bool:
    lower_error = error_text.lower()
    return any(marker.lower() in lower_error for marker in RETRYABLE_ERROR_MARKERS)


def retry_wait_seconds(error_text: str, attempt: int) -> int:
    lower_error = error_text.lower()
    if any(marker.lower() in lower_error for marker in RATE_LIMIT_ERROR_MARKERS):
        return LLM_RETRY_WAIT * attempt
    return min(10 * attempt, 30)


def generate_text(api_key: str, prompt: str, model: str = LLM_MODEL, max_retries: int = 3) -> str:
    client = genai.Client(api_key=api_key)
    model_name = normalize_model_name(model)
    for attempt in range(1, max_retries + 1):
        try:
            response = client.models.generate_content(model=model_name, contents=prompt)
            return (response.text or "").strip()
        except Exception as exc:
            err = str(exc)
            if is_retryable_error(err) and attempt < max_retries:
                wait = retry_wait_seconds(err, attempt)
                logger.warning(
                    "LLM temporary failure; retrying in %ss (%s/%s): %s",
                    wait,
                    attempt,
                    max_retries,
                    err[:200],
                )
                time.sleep(wait)
                continue
            logger.warning("LLM request failed after %s attempt(s): %s", attempt, err[:200])
            return "(Lỗi hệ thống LLM. Không thể thực hiện vào lúc này.)"
    return "(Vượt quá số lần thử tối đa của LLM API.)"


def _embedding_values(item) -> list[float]:
    values = getattr(item, "values", None)
    if values is not None:
        return list(values)
    if isinstance(item, dict):
        return list(item.get("values") or item.get("embedding") or [])
    return list(item)


def embed_contents(
    api_key: str,
    contents: str | Sequence[str],
    model: str = EMBED_MODEL,
    task_type: str | None = "RETRIEVAL_QUERY",
) -> list[list[float]]:
    client = genai.Client(api_key=api_key)
    config = types.EmbedContentConfig(task_type=task_type) if task_type else None
    response = client.models.embed_content(
        model=normalize_model_name(model),
        contents=contents,
        config=config,
    )
    embeddings = getattr(response, "embeddings", None)
    if embeddings is not None:
        return [_embedding_values(item) for item in embeddings]

    embedding = getattr(response, "embedding", None)
    if embedding is not None:
        return [_embedding_values(embedding)]

    if isinstance(response, dict):
        raw = response.get("embeddings") or response.get("embedding") or []
        if raw and isinstance(raw[0], (int, float)):
            return [list(raw)]
        return [_embedding_values(item) for item in raw]

    return []


def transcribe_audio(
    api_key: str,
    prompt: str,
    audio_bytes: bytes,
    mime_type: str = "audio/webm",
    model: str = LLM_MODEL,
) -> str:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=normalize_model_name(model),
        contents=[
            prompt,
            types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
        ],
    )
    return (response.text or "").strip()
