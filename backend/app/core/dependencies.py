"""
Core Dependencies â€“ FastAPI dependency injection cho xÃ¡c thá»±c ngÆ°á»i dÃ¹ng.

Cung cáº¥p:
- get_current_user: Dependency láº¥y user hiá»‡n táº¡i tá»« JWT cookie.
- get_admin_user:   Dependency yÃªu cáº§u user pháº£i cÃ³ role='admin'.
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
    Dependency inject vÃ o cÃ¡c route cáº§n xÃ¡c thá»±c.
    Äá»c JWT tá»« cookie â†’ tráº£ vá» dict user tá»« DB.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="ChÆ°a Ä‘Äƒng nháº­p hoáº·c phiÃªn Ä‘Ã£ háº¿t háº¡n.",
    )

    # KhÃ´ng cÃ³ cookie â†’ chÆ°a Ä‘Äƒng nháº­p
    if not access_token:
        raise credentials_exception

    # Giáº£i mÃ£ JWT
    try:
        payload = decode_access_token(access_token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Truy váº¥n DB â€“ báº¯t má»i lá»—i káº¿t ná»‘i Ä‘á»ƒ tráº£ 401 thay vÃ¬ 500
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
            detail="KhÃ´ng thá»ƒ káº¿t ná»‘i cÆ¡ sá»Ÿ dá»¯ liá»‡u.",
        )

    if not user:
        raise credentials_exception

    return dict(user)


async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency: yÃªu cáº§u user hiá»‡n táº¡i pháº£i cÃ³ role='admin'.
    Náº¿u khÃ´ng â†’ 403 Forbidden.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p trang nÃ y.",
        )
    return current_user
