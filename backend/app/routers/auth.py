"""
Auth Router – /api/auth/register  /api/auth/login  /api/auth/logout  /api/auth/me
             /api/auth/google/callback

Token được lưu vào HttpOnly cookie thời hạn 1 ngày.
"""
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.dependencies import get_current_user
from app.core.security import COOKIE_NAME
from app.schemas.auth_schemas import LoginRequest, RegisterRequest, UserResponse, GoogleCallbackRequest
from app.controllers import auth_controller

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ── Đăng ký ──────────────────────────────────────────────────────────────────
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, response: Response):
    """Tạo tài khoản mới và trả về token trong cookie."""
    try:
        return await auth_controller.handle_register(
            body.username, body.email, body.password, response
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


# ── Đăng nhập ─────────────────────────────────────────────────────────────────
@router.post("/login")
async def login(body: LoginRequest, response: Response):
    """Xác thực tài khoản và trả về token trong cookie."""
    result = await auth_controller.handle_login(body.email, body.password, response)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác.",
        )
    return result


# ── Đăng nhập / Đăng ký qua Google ──────────────────────────────────────────
@router.post("/google/callback")
async def google_callback(body: GoogleCallbackRequest, response: Response):
    """
    Nhận Google credential (access_token) từ frontend,
    xác minh với Google, tạo/lấy user và trả cookie JWT.
    """
    try:
        return await auth_controller.handle_google_callback(
            body.credential, body.user_info, response
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


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

from app.schemas.auth_schemas import UpdateProfileRequest

@router.put("/profile")
async def update_profile(body: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    """Cập nhật thông tin profile của user hiện tại."""
    try:
        return await auth_controller.handle_update_profile(
            current_user["id"], body.model_dump(exclude_unset=True)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
