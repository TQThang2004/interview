"""
Auth Service – xử lý business logic đăng ký, đăng nhập, Google OAuth.
"""
import os
import httpx
from dotenv import load_dotenv

from app.core.security import hash_password, verify_password
from app.database.connection import get_pool

_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(dotenv_path=_env_path, override=True)

GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


async def register_user(username: str, email: str, password: str) -> dict:
    """
    Tạo user mới trong DB.
    Raise ValueError nếu username/email đã tồn tại.
    """
    pool = await get_pool()
    password_hash = hash_password(password)

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
            RETURNING id::text, username, email, role::text, avatar_url, phone_number, fullname, bio, level, language, notifications
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
                   role::text, avatar_url, phone_number, fullname, bio, level, language, notifications
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


async def google_login_or_register(access_token: str, user_info: dict | None = None) -> dict:
    """
    Xác minh Google access_token bằng cách gọi Google userinfo endpoint,
    sau đó tạo mới hoặc lấy user hiện có từ DB.
    Trả về dict user (không có password_hash).
    Raise ValueError nếu token không hợp lệ.
    """
    # Nếu frontend đã gửi user_info kèm theo, vẫn verify lại bằng access_token
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if resp.status_code != 200:
        raise ValueError("Google access token không hợp lệ hoặc đã hết hạn.")

    idinfo: dict = resp.json()

    google_id: str = idinfo.get("sub", "")
    email: str = idinfo.get("email", "")
    name: str = idinfo.get("name", "") or (email.split("@")[0] if email else "user")
    picture: str = idinfo.get("picture", "")

    if not google_id or not email:
        raise ValueError("Không lấy được thông tin người dùng từ Google.")

    pool = await get_pool()
    async with pool.acquire() as conn:
        # 1. Tìm user theo google_id
        user = await conn.fetchrow(
            "SELECT id::text, username, email, role::text, avatar_url, phone_number, fullname, bio, level, language, notifications "
            "FROM users WHERE google_id = $1",
            google_id,
        )

        if not user:
            # 2. Tìm theo email (tài khoản email/pass đã tồn tại → liên kết)
            user = await conn.fetchrow(
                "SELECT id::text, username, email, role::text, avatar_url, phone_number, fullname, bio, level, language, notifications "
                "FROM users WHERE email = $1",
                email,
            )
            if user:
                # Liên kết google_id vào tài khoản đã có
                await conn.execute(
                    "UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE email = $3",
                    google_id, picture, email,
                )
                # Lấy lại bản ghi sau update
                user = await conn.fetchrow(
                    "SELECT id::text, username, email, role::text, avatar_url, phone_number, fullname, bio, level, language, notifications "
                    "FROM users WHERE email = $1",
                    email,
                )
            else:
                # 3. Tạo tài khoản mới (không có password)
                # Đảm bảo username unique (thêm hậu tố nếu cần)
                base_username = name.replace(" ", "").lower()[:30] or "user"
                username = base_username
                suffix = 1
                while await conn.fetchrow("SELECT id FROM users WHERE username = $1", username):
                    username = f"{base_username}{suffix}"
                    suffix += 1

                user = await conn.fetchrow(
                    """
                    INSERT INTO users (username, email, google_id, avatar_url)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id::text, username, email, role::text, avatar_url, phone_number, fullname, bio, level, language, notifications
                    """,
                    username, email, google_id, picture,
                )

    return dict(user)

async def update_profile(user_id: str, updates: dict) -> dict:
    pool = await get_pool()
    async with pool.acquire() as conn:
        set_clauses = []
        values = []
        idx = 1
        for k, v in updates.items():
            if v is not None:
                set_clauses.append(f"{k} = ${idx}")
                values.append(v)
                idx += 1
        
        if not set_clauses:
            row = await conn.fetchrow(
                "SELECT id::text, username, email, role::text, avatar_url, phone_number, fullname, bio, level, language, notifications FROM users WHERE id = $1",
                user_id
            )
            return dict(row)
            
        values.append(user_id)
        query = f"""
            UPDATE users
            SET {', '.join(set_clauses)}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${idx}
            RETURNING id::text, username, email, role::text, avatar_url, phone_number, fullname, bio, level, language, notifications
        """
        row = await conn.fetchrow(query, *values)
        return dict(row)
