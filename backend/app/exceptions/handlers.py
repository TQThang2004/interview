"""
Exception Handlers – global exception handler đăng ký vào FastAPI.

Bắt các custom exception và trả về JSON response đúng chuẩn,
đồng thời đảm bảo CORS header được thêm vào mọi error response.
"""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.exceptions.errors import AppException
from app.core.logging import get_logger


logger = get_logger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    """Đăng ký toàn bộ exception handler vào ứng dụng FastAPI."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        """Bắt các custom AppException và trả về JSON response chuẩn."""
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message},
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """Bắt mọi exception không được xử lý – đảm bảo luôn có CORS header."""
        logger.exception("Unhandled exception")
        return JSONResponse(
            status_code=500,
            content={"detail": "Lỗi máy chủ nội bộ, vui lòng thử lại."},
        )
