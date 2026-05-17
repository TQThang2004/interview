"""
CORS Middleware – cấu hình Cross-Origin Resource Sharing cho FastAPI.

Lưu ý: khi credentials=True, allow_origins KHÔNG được là ["*"].
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Các origin được phép (thêm origin production khi deploy)
ALLOWED_ORIGINS = [
    "http://localhost:5173",    # Vite dev server (default)
    "http://localhost:5174",    # Vite dev server (fallback khi 5173 bị chiếm)
    "http://localhost:3000",    # CRA / alternative
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
]


def register_cors(app: FastAPI) -> None:
    """Đăng ký CORS middleware vào ứng dụng FastAPI."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,   # Cho phép gửi/nhận cookie
        allow_methods=["*"],
        allow_headers=["*"],
    )
