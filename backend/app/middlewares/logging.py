"""
Logging Middleware – middleware ghi log mọi HTTP request/response.

Ghi lại: method, path, status code, thời gian xử lý.
"""
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware ghi log thông tin request và thời gian xử lý."""

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed = (time.perf_counter() - start) * 1000

        print(
            f"[HTTP] {request.method} {request.url.path} "
            f"→ {response.status_code} ({elapsed:.1f}ms)"
        )
        return response


def register_logging_middleware(app) -> None:
    """Đăng ký logging middleware vào ứng dụng FastAPI."""
    app.add_middleware(LoggingMiddleware)
