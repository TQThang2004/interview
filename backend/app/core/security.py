"""
Core Security – xử lý JWT token và password hashing.

Bao gồm:
- Tạo và giải mã JWT access token (lưu vào HttpOnly cookie).
- Hash và verify mật khẩu bằng bcrypt.
"""
import os
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt
from dotenv import load_dotenv

_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(dotenv_path=_env_path, override=True)

# Lấy secret từ .env, fallback an toàn cho dev
SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me-in-production-super-secret-key")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS: int = 1          # Cookie sống 1 ngày
COOKIE_NAME: str = "access_token"
COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() in ("1", "true", "yes", "on")


# ---------------------------------------------------------------------------
# JWT Token
# ---------------------------------------------------------------------------

def create_access_token(data: dict) -> str:
    """Tạo JWT với thời hạn ACCESS_TOKEN_EXPIRE_DAYS ngày."""
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Giải mã JWT.
    Raise JWTError nếu token không hợp lệ hoặc đã hết hạn.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


# ---------------------------------------------------------------------------
# Password Hashing
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    """Hash mật khẩu bằng bcrypt."""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Kiểm tra mật khẩu raw so với hash."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())
