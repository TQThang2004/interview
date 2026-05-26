"""
Auth Controller – nhận request, gọi auth_service, format response.
"""
from fastapi import Response

from app.core.security import ACCESS_TOKEN_EXPIRE_DAYS, COOKIE_NAME, create_access_token
from app.schemas.auth_schemas import UserResponse
from app.services import auth_service

# Số giây sống của cookie (1 ngày)
_COOKIE_MAX_AGE = ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60   # 86400 giây


def set_auth_cookie(response: Response, token: str) -> None:
    """Ghi JWT vào HttpOnly Secure cookie."""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=_COOKIE_MAX_AGE,
        httponly=True,       # Không đọc được từ JS → an toàn hơn
        samesite="lax",      # Bảo vệ CSRF cơ bản
        secure=False,        # Đặt True khi deploy HTTPS
    )


async def handle_register(username: str, email: str, password: str, response: Response) -> dict:
    """Đăng ký user mới, set cookie và trả về user info."""
    user = await auth_service.register_user(username, email, password)
    token = create_access_token({"sub": user["id"]})
    set_auth_cookie(response, token)
    return {
        "message": "Đăng ký thành công.",
        "user": UserResponse(**user).model_dump(),
    }


async def handle_login(email: str, password: str, response: Response) -> dict | None:
    """Đăng nhập, set cookie và trả về user info. None nếu sai credentials."""
    user = await auth_service.authenticate_user(email, password)
    if not user:
        return None
    token = create_access_token({"sub": user["id"]})
    set_auth_cookie(response, token)
    return {
        "message": "Đăng nhập thành công.",
        "user": UserResponse(**user).model_dump(),
    }


async def handle_google_callback(
    credential: str, user_info: dict | None, response: Response
) -> dict:
    """Đăng nhập/đăng ký qua Google, set cookie và trả về user info."""
    user = await auth_service.google_login_or_register(credential, user_info)
    token = create_access_token({"sub": user["id"]})
    set_auth_cookie(response, token)
    return {
        "message": "Đăng nhập Google thành công.",
        "user": UserResponse(**user).model_dump(),
    }

async def handle_update_profile(user_id: str, body: dict) -> dict:
    user = await auth_service.update_profile(user_id, body)
    return {
        "message": "Cập nhật thành công.",
        "user": UserResponse(**user).model_dump(),
    }
