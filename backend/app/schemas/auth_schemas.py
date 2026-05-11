"""
Auth Schemas – Pydantic schemas cho các API xác thực.

Bao gồm: Register, Login, Google OAuth, UserResponse.
"""
from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def username_min_length(cls, v: str) -> str:
        if len(v.strip()) < 3:
            raise ValueError("Tên người dùng phải có ít nhất 3 ký tự.")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Mật khẩu phải có ít nhất 8 ký tự.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleCallbackRequest(BaseModel):
    """
    Nhận Google credential từ frontend.
    - credential: access_token trả về từ useGoogleLogin (@react-oauth/google)
    - user_info: thông tin user đã lấy từ Google userinfo endpoint (do frontend gửi kèm)
    """
    credential: str
    user_info: dict | None = None


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    avatar_url: str | None = None
    phone_number: str | None = None

    class Config:
        from_attributes = True
