"""
Logging Middleware â€“ middleware ghi log má»i HTTP request/response.

Ghi láº¡i: method, path, status code, thá»i gian xá»­ lÃ½.
"""
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import get_logger

logger = get_logger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware ghi log thÃ´ng tin request vÃ  thá»i gian xá»­ lÃ½."""

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed = (time.perf_counter() - start) * 1000

        logger.info("HTTP %s %s -> %s (%.1fms)", request.method, request.url.path, response.status_code, elapsed)
        return response


def register_logging_middleware(app) -> None:
    """ÄÄƒng kÃ½ logging middleware vÃ o á»©ng dá»¥ng FastAPI."""
    app.add_middleware(LoggingMiddleware)
