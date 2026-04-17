"""
JWT helper: tạo và xác thực access token.
Token được lưu vào HttpOnly cookie trong 1 ngày.
"""
import os
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from dotenv import load_dotenv

_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(dotenv_path=_env_path, override=True)

# Lấy secret từ .env, fallback an toàn cho dev
SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me-in-production-super-secret-key")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS: int = 1          # Cookie sống 1 ngày
COOKIE_NAME: str = "access_token"


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
