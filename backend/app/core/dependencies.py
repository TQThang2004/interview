"""
Core Dependencies – FastAPI dependency injection cho xác thực người dùng.

Cung cấp:
- get_current_user: Dependency lấy user hiện tại từ JWT cookie.
- get_admin_user:   Dependency yêu cầu user phải có role='admin'.
"""
from fastapi import Cookie, Depends, HTTPException, status
from jose import JWTError

from app.core.logging import get_logger
from app.core.security import COOKIE_NAME, decode_access_token
from app.database.connection import get_pool

logger = get_logger(__name__)


async def get_current_user(
    access_token: str | None = Cookie(default=None, alias=COOKIE_NAME),
) -> dict:
    """
    Dependency inject vào các route cần xác thực.
    Đọc JWT từ cookie → trả về dict user từ DB.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Chưa đăng nhập hoặc phiên đã hết hạn.",
    )

    # Không có cookie → chưa đăng nhập
    if not access_token:
        raise credentials_exception

    # Giải mã JWT
    try:
        payload = decode_access_token(access_token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Truy vấn DB – bắt mọi lỗi kết nối để trả 401 thay vì 500
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            user = await conn.fetchrow(
                """
                SELECT id::text, username, email, role::text, avatar_url, phone_number,
                       fullname, bio, level, language, notifications
                FROM users WHERE id = $1
                """,
                user_id,
            )
    except Exception as exc:
        logger.warning("Database connection failed while authenticating user: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Không thể kết nối cơ sở dữ liệu.",
        )

    if not user:
        raise credentials_exception

    return dict(user)


async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency: yêu cầu user hiện tại phải có role='admin'.
    Nếu không → 403 Forbidden.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập trang này.",
        )
    return current_user
