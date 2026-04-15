"""
Entry point dành cho uvicorn.
Chạy: uvicorn main:app --reload  (từ thư mục backend/)
"""
from app.main import app  # noqa: F401 – re-export để uvicorn nhận diện

__all__ = ["app"]
