"""
Auth service: xử lý business logic đăng ký, đăng nhập.
"""
import bcrypt

from app.database.connection import get_pool


async def hash_password(plain: str) -> str:
    """Hash mật khẩu bằng bcrypt."""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Kiểm tra mật khẩu raw so với hash."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


async def register_user(username: str, email: str, password: str) -> dict:
    """
    Tạo user mới trong DB.
    Raise ValueError nếu username/email đã tồn tại.
    """
    pool = await get_pool()
    password_hash = await hash_password(password)

    async with pool.acquire() as conn:
        # Kiểm tra trùng email
        existing = await conn.fetchrow(
            "SELECT id FROM users WHERE email = $1 OR username = $2",
            email, username
        )
        if existing:
            # Xác định cụ thể trường nào bị trùng
            by_email = await conn.fetchrow("SELECT id FROM users WHERE email = $1", email)
            if by_email:
                raise ValueError("Email này đã được sử dụng.")
            raise ValueError("Tên người dùng này đã được sử dụng.")

        row = await conn.fetchrow(
            """
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id::text, username, email, role::text, avatar_url, phone_number
            """,
            username, email, password_hash
        )
    return dict(row)


async def authenticate_user(email: str, password: str) -> dict | None:
    """
    Xác thực đăng nhập email/password.
    Trả về dict user nếu hợp lệ, None nếu sai.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT id::text, username, email, password_hash,
                   role::text, avatar_url, phone_number
            FROM users WHERE email = $1
            """,
            email
        )
    if not row:
        return None
    if not row["password_hash"]:
        return None  # Tài khoản Google, không có password
    if not verify_password(password, row["password_hash"]):
        return None

    user = dict(row)
    user.pop("password_hash", None)
    return user
