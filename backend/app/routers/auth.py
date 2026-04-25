"""
Auth Router: /api/auth/register  /api/auth/login  /api/auth/logout  /api/auth/me
             /api/auth/google/callback
Token được lưu vào HttpOnly cookie thời hạn 1 ngày.
"""
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.auth.dependencies import get_current_user
from app.auth.jwt_handler import ACCESS_TOKEN_EXPIRE_DAYS, COOKIE_NAME, create_access_token
from app.auth.schemas import LoginRequest, RegisterRequest, UserResponse, GoogleCallbackRequest
from app.auth.service import authenticate_user, register_user, google_login_or_register

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# ── Số giây sống của cookie (1 ngày) ─────────────────────────────────────────
_COOKIE_MAX_AGE = ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60   # 86400 giây


def _set_auth_cookie(response: Response, token: str) -> None:
    """Ghi JWT vào HttpOnly Secure cookie."""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=_COOKIE_MAX_AGE,
        httponly=True,       # Không đọc được từ JS → an toàn hơn
        samesite="lax",      # Bảo vệ CSRF cơ bản
        secure=False,        # Đặt True khi deploy HTTPS
    )


# ── Đăng ký ──────────────────────────────────────────────────────────────────
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, response: Response):
    """Tạo tài khoản mới và trả về token trong cookie."""
    try:
        user = await register_user(body.username, body.email, body.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    token = create_access_token({"sub": user["id"]})
    _set_auth_cookie(response, token)

    return {
        "message": "Đăng ký thành công.",
        "user": UserResponse(**user).model_dump(),
    }


# ── Đăng nhập ─────────────────────────────────────────────────────────────────
@router.post("/login")
async def login(body: LoginRequest, response: Response):
    """Xác thực tài khoản và trả về token trong cookie."""
    user = await authenticate_user(body.email, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác.",
        )

    token = create_access_token({"sub": user["id"]})
    _set_auth_cookie(response, token)

    return {
        "message": "Đăng nhập thành công.",
        "user": UserResponse(**user).model_dump(),
    }


# ── Đăng nhập / Đăng ký qua Google ──────────────────────────────────────────
@router.post("/google/callback")
async def google_callback(body: GoogleCallbackRequest, response: Response):
    """
    Nhận Google credential (id_token) từ frontend,
    xác minh với Google, tạo/lấy user và trả cookie JWT.
    """
    try:
        user = await google_login_or_register(body.credential, body.user_info)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    token = create_access_token({"sub": user["id"]})
    _set_auth_cookie(response, token)

    return {
        "message": "Đăng nhập Google thành công.",
        "user": UserResponse(**user).model_dump(),
    }


# ── Đăng xuất ─────────────────────────────────────────────────────────────────
@router.post("/logout")
async def logout(response: Response):
    """Xoá cookie xác thực."""
    response.delete_cookie(key=COOKIE_NAME, httponly=True, samesite="lax")
    return {"message": "Đăng xuất thành công."}


# ── Lấy thông tin user hiện tại ───────────────────────────────────────────────
@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    """Trả về thông tin user đang đăng nhập (dùng cookie)."""
    return UserResponse(**current_user).model_dump()
