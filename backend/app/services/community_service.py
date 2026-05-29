"""
Community Service – business logic cho các chức năng cộng đồng.

Bao gồm: CRUD bài viết (có kiểm duyệt), comments, likes, saves, tags, notifications.

Luồng kiểm duyệt:
  - Bài mới tạo có status = 'pending'.
  - list_posts() chỉ trả về bài 'approved' (user thường).
  - Admin dùng get_posts_for_admin() để xem tất cả.
  - approve_post() → status = 'approved', gửi notification.
  - reject_post() → xóa bài, gửi notification cho tác giả.
"""
from typing import Optional

from app.database.connection import get_pool
from app.utils.common import serialize_record


async def list_posts(
    limit: int,
    offset: int,
    search: Optional[str],
    category: Optional[str],
    tag: Optional[str],
    current_user_id: str,
) -> tuple[int, list[dict]]:
    """Lấy danh sách bài viết ĐÃ DUYỆT với phân trang, tìm kiếm và filter."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        conditions = ["p.status = 'approved'"]
        params: list = []
        idx = 1

        if search:
            conditions.append(f"(p.title ILIKE ${idx} OR p.content ILIKE ${idx})")
            params.append(f"%{search}%")
            idx += 1

        if category:
            conditions.append(f"p.category = ${idx}")
            params.append(category)
            idx += 1

        if tag:
            conditions.append(f"${idx} = ANY(p.tags)")
            params.append(tag)
            idx += 1

        where = "WHERE " + " AND ".join(conditions)

        rows = await conn.fetch(
            f"""
            SELECT
                p.id::text,
                p.title,
                p.content,
                p.category,
                p.tags,
                p.image_url,
                p.status,
                p.created_at,
                u.id::text AS author_id,
                u.username AS author_name,
                u.avatar_url AS author_avatar,
                (SELECT COUNT(*) FROM community_likes l WHERE l.post_id = p.id) AS likes_count,
                (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id) AS comments_count,
                EXISTS(SELECT 1 FROM community_likes l WHERE l.post_id = p.id AND l.user_id = ${idx}) AS is_liked,
                EXISTS(SELECT 1 FROM community_saves s WHERE s.post_id = p.id AND s.user_id = ${idx}) AS is_saved
            FROM community_posts p
            JOIN users u ON u.id = p.author_id
            {where}
            ORDER BY p.created_at DESC
            LIMIT ${idx+1} OFFSET ${idx+2}
            """,
            *params, current_user_id, limit, offset,
        )

        count_query = f"SELECT COUNT(*) FROM community_posts p {where}"
        total = await conn.fetchval(count_query, *params)

    return total, [serialize_record(r) for r in rows]


async def create_post(
    author_id: str,
    title: str,
    content: str,
    category: str,
    tags: list[str],
    image_url: Optional[str] = None,
) -> dict:
    """Tạo bài viết mới với status='pending'. Trả về dict bài viết đã tạo."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO community_posts (author_id, title, content, category, tags, image_url, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
            RETURNING id::text, title, content, category, tags, image_url, status, created_at
            """,
            author_id, title, content, category, tags, image_url,
        )
    return serialize_record(row)


async def get_post_detail(post_id: str, current_user_id: str) -> Optional[dict]:
    """Chi tiết bài viết kèm comments. Trả về None nếu không tìm thấy."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        post = await conn.fetchrow(
            """
            SELECT
                p.id::text, p.title, p.content, p.category, p.tags, p.image_url, p.status, p.created_at,
                u.id::text AS author_id, u.username AS author_name, u.avatar_url AS author_avatar,
                (SELECT COUNT(*) FROM community_likes l WHERE l.post_id = p.id) AS likes_count,
                (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id) AS comments_count,
                EXISTS(SELECT 1 FROM community_likes l WHERE l.post_id = p.id AND l.user_id = $2) AS is_liked,
                EXISTS(SELECT 1 FROM community_saves s WHERE s.post_id = p.id AND s.user_id = $2) AS is_saved
            FROM community_posts p
            JOIN users u ON u.id = p.author_id
            WHERE p.id = $1
            """,
            post_id, current_user_id,
        )
        if not post:
            return None

        comments = await conn.fetch(
            """
            SELECT c.id::text, c.content, c.created_at,
                   u.id::text AS author_id, u.username AS author_name, u.avatar_url AS author_avatar
            FROM community_comments c
            JOIN users u ON u.id = c.author_id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
            """,
            post_id,
        )

    result = serialize_record(post)
    result["comments"] = [serialize_record(c) for c in comments]
    return result


async def get_post_author_id(post_id: str) -> Optional[str]:
    """Lấy author_id của bài viết để kiểm tra quyền xóa."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT author_id::text FROM community_posts WHERE id = $1", post_id
        )
    return row["author_id"] if row else None


async def delete_post(post_id: str) -> None:
    """Xóa bài viết."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM community_posts WHERE id = $1", post_id)


async def get_my_posts(user_id: str, limit: int, offset: int) -> tuple[int, list[dict]]:
    """Lấy bài viết của user (kể cả pending/rejected) để hiện trạng thái."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                p.id::text, p.title, p.content, p.category, p.tags, p.image_url,
                p.status, p.created_at,
                u.id::text AS author_id, u.username AS author_name, u.avatar_url AS author_avatar,
                (SELECT COUNT(*) FROM community_likes l WHERE l.post_id = p.id) AS likes_count,
                (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id) AS comments_count
            FROM community_posts p
            JOIN users u ON u.id = p.author_id
            WHERE p.author_id = $1
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3
            """,
            user_id, limit, offset,
        )
        total = await conn.fetchval(
            "SELECT COUNT(*) FROM community_posts WHERE author_id = $1", user_id
        )
    return total, [serialize_record(r) for r in rows]


# ---------------------------------------------------------------------------
# Admin-only: quản lý bài viết
# ---------------------------------------------------------------------------

async def get_posts_for_admin(
    limit: int,
    offset: int,
    status_filter: Optional[str],
    search: Optional[str] = None,
) -> tuple[int, list[dict]]:
    """Lấy TẤT CẢ bài viết (kể cả pending) cho admin quản lý."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        conditions = []
        params: list = []
        idx = 1

        if status_filter and status_filter in ("pending", "approved", "rejected"):
            conditions.append(f"p.status = ${idx}")
            params.append(status_filter)
            idx += 1

        if search:
            conditions.append(f"(p.title ILIKE ${idx} OR p.content ILIKE ${idx} OR u.username ILIKE ${idx})")
            params.append(f"%{search}%")
            idx += 1

        where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

        rows = await conn.fetch(
            f"""
            SELECT
                p.id::text, p.title, p.content, p.category, p.tags, p.image_url,
                p.status, p.created_at,
                u.id::text AS author_id, u.username AS author_name, u.avatar_url AS author_avatar,
                u.email AS author_email,
                (SELECT COUNT(*) FROM community_likes l WHERE l.post_id = p.id) AS likes_count,
                (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id) AS comments_count
            FROM community_posts p
            JOIN users u ON u.id = p.author_id
            {where}
            ORDER BY
                CASE p.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
                p.created_at DESC
            LIMIT ${idx} OFFSET ${idx+1}
            """,
            *params, limit, offset,
        )

        count_query = f"SELECT COUNT(*) FROM community_posts p JOIN users u ON u.id = p.author_id {where}"
        total = await conn.fetchval(count_query, *params)

    return total, [serialize_record(r) for r in rows]


async def approve_post(post_id: str) -> Optional[dict]:
    """Duyệt bài viết. Trả về dict bài viết nếu thành công, None nếu không tìm thấy."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE community_posts SET status = 'approved'
            WHERE id = $1
            RETURNING id::text, title, author_id::text, status
            """,
            post_id,
        )
    return serialize_record(row) if row else None


async def reject_post(post_id: str) -> Optional[str]:
    """
    Từ chối và XÓA bài viết.
    Trả về author_id (để gửi notification), None nếu không tìm thấy.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT author_id::text, title FROM community_posts WHERE id = $1", post_id
        )
        if not row:
            return None
        await conn.execute("DELETE FROM community_posts WHERE id = $1", post_id)
    return row["author_id"], row["title"]


# ---------------------------------------------------------------------------
# Likes, Saves, Comments
# ---------------------------------------------------------------------------

async def toggle_like(post_id: str, user_id: str) -> tuple[bool, int]:
    """Toggle like bài viết. Trả về (liked: bool, likes_count: int)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT id FROM community_likes WHERE post_id = $1 AND user_id = $2",
            post_id, user_id,
        )
        if existing:
            await conn.execute(
                "DELETE FROM community_likes WHERE post_id = $1 AND user_id = $2",
                post_id, user_id,
            )
            liked = False
        else:
            await conn.execute(
                "INSERT INTO community_likes (post_id, user_id) VALUES ($1, $2)",
                post_id, user_id,
            )
            liked = True
        count = await conn.fetchval(
            "SELECT COUNT(*) FROM community_likes WHERE post_id = $1", post_id
        )
    return liked, count


async def toggle_save(post_id: str, user_id: str) -> bool:
    """Toggle save bài viết. Trả về trạng thái saved mới."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT id FROM community_saves WHERE post_id = $1 AND user_id = $2",
            post_id, user_id,
        )
        if existing:
            await conn.execute(
                "DELETE FROM community_saves WHERE post_id = $1 AND user_id = $2",
                post_id, user_id,
            )
            return False
        else:
            await conn.execute(
                "INSERT INTO community_saves (post_id, user_id) VALUES ($1, $2)",
                post_id, user_id,
            )
            return True


async def get_comments(post_id: str) -> list[dict]:
    """Lấy danh sách comments của bài viết."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT c.id::text, c.content, c.created_at,
                   u.id::text AS author_id, u.username AS author_name, u.avatar_url AS author_avatar
            FROM community_comments c
            JOIN users u ON u.id = c.author_id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
            """,
            post_id,
        )
    return [serialize_record(r) for r in rows]


async def add_comment(post_id: str, author_id: str, content: str) -> Optional[dict]:
    """
    Thêm comment vào bài viết (chỉ bài đã approved).
    Trả về None nếu bài viết không tồn tại hoặc chưa được duyệt.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        exists = await conn.fetchval(
            "SELECT id FROM community_posts WHERE id = $1 AND status = 'approved'", post_id
        )
        if not exists:
            return None
        row = await conn.fetchrow(
            """
            INSERT INTO community_comments (post_id, author_id, content)
            VALUES ($1, $2, $3)
            RETURNING id::text, content, created_at
            """,
            post_id, author_id, content,
        )
    return serialize_record(row)


async def get_comment_author_id(comment_id: str) -> Optional[str]:
    """Lấy author_id của comment để kiểm tra quyền xóa."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT author_id::text FROM community_comments WHERE id = $1", comment_id
        )
    return row["author_id"] if row else None


async def delete_comment(comment_id: str) -> None:
    """Xóa comment."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "DELETE FROM community_comments WHERE id = $1", comment_id
        )


async def get_popular_tags(limit: int) -> list[dict]:
    """Lấy danh sách tags phổ biến nhất (chỉ từ bài approved)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT unnest(tags) AS tag, COUNT(*) AS count
            FROM community_posts
            WHERE status = 'approved'
            GROUP BY tag
            ORDER BY count DESC
            LIMIT $1
            """,
            limit,
        )
    return [{"tag": r["tag"], "count": r["count"]} for r in rows]


async def get_my_saves(user_id: str, limit: int, offset: int) -> list[dict]:
    """Lấy danh sách bài viết đã lưu của user (chỉ bài approved)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                p.id::text, p.title, p.content, p.category, p.tags, p.image_url, p.status, p.created_at,
                u.username AS author_name, u.avatar_url AS author_avatar,
                (SELECT COUNT(*) FROM community_likes l WHERE l.post_id = p.id) AS likes_count,
                (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id) AS comments_count
            FROM community_saves s
            JOIN community_posts p ON p.id = s.post_id
            JOIN users u ON u.id = p.author_id
            WHERE s.user_id = $1 AND p.status = 'approved'
            ORDER BY s.saved_at DESC
            LIMIT $2 OFFSET $3
            """,
            user_id, limit, offset,
        )
    return [serialize_record(r) for r in rows]


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

async def create_notification(user_id: str, notif_type: str, message: str) -> None:
    """Tạo thông báo cho user."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO notifications (user_id, type, message)
            VALUES ($1, $2, $3)
            """,
            user_id, notif_type, message,
        )


async def get_user_notifications(user_id: str, limit: int = 20) -> list[dict]:
    """Lấy thông báo của user (mới nhất trước)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id::text, type, message, is_read, created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
            """,
            user_id, limit,
        )
    return [serialize_record(r) for r in rows]


async def mark_notification_read(notification_id: str, user_id: str) -> bool:
    """Đánh dấu thông báo đã đọc. Trả về True nếu thành công."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2",
            notification_id, user_id,
        )
    return result != "UPDATE 0"


async def mark_all_notifications_read(user_id: str) -> None:
    """Đánh dấu tất cả thông báo của user là đã đọc."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = $1",
            user_id,
        )


async def count_unread_notifications(user_id: str) -> int:
    """Đếm số thông báo chưa đọc."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        count = await conn.fetchval(
            "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE",
            user_id,
        )
    return int(count or 0)
