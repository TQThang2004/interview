"""
FastAPI dependency: xác thực người dùng từ cookie HttpOnly.
"""
from fastapi import Cookie, Depends, HTTPException, status
from jose import JWTError

from app.auth.jwt_handler import COOKIE_NAME, decode_access_token
from app.database.connection import get_pool


async def get_current_user(access_token: str | None = Cookie(default=None, alias=COOKIE_NAME)):
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
                "SELECT id::text, username, email, role::text, avatar_url, phone_number "
                "FROM users WHERE id = $1",
                user_id,
            )
    except Exception as exc:
        print(f"[Auth] Lỗi kết nối DB khi xác thực: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Không thể kết nối cơ sở dữ liệu.",
        )

    if not user:
        raise credentials_exception

    return dict(user)
