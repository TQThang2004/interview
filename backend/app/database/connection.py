"""
Quản lý kết nối PostgreSQL bằng asyncpg connection pool.
"""
import asyncpg
import os
from dotenv import load_dotenv

# Load .env từ thư mục gốc dự án
_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(dotenv_path=_env_path, override=True)

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    """Trả về connection pool, tạo mới nếu chưa tồn tại."""
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 5432)),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "ai_mock_interview_db"),
            min_size=1,
            max_size=10,
        )
    return _pool


async def close_pool() -> None:
    """Đóng connection pool khi shutdown."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
