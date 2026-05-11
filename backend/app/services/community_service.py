"""
Community Service – business logic cho các chức năng cộng đồng.

Bao gồm: CRUD bài viết, comments, likes, saves, tags.
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
    """Lấy danh sách bài viết với phân trang, tìm kiếm và filter."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        conditions = []
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

        where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

        rows = await conn.fetch(
            f"""
            SELECT
                p.id::text,
                p.title,
                p.content,
                p.category,
                p.tags,
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
            *params, current_user_id, current_user_id, limit, offset,
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
) -> dict:
    """Tạo bài viết mới. Trả về dict bài viết đã tạo."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO community_posts (author_id, title, content, category, tags)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id::text, title, content, category, tags, created_at
            """,
            author_id, title, content, category, tags,
        )
    return serialize_record(row)


async def get_post_detail(post_id: str, current_user_id: str) -> Optional[dict]:
    """Chi tiết bài viết kèm comments. Trả về None nếu không tìm thấy."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        post = await conn.fetchrow(
            """
            SELECT
                p.id::text, p.title, p.content, p.category, p.tags, p.created_at,
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
    Thêm comment vào bài viết.
    Trả về None nếu bài viết không tồn tại.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        exists = await conn.fetchval(
            "SELECT id FROM community_posts WHERE id = $1", post_id
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
    """Lấy danh sách tags phổ biến nhất."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT unnest(tags) AS tag, COUNT(*) AS count
            FROM community_posts
            GROUP BY tag
            ORDER BY count DESC
            LIMIT $1
            """,
            limit,
        )
    return [{"tag": r["tag"], "count": r["count"]} for r in rows]


async def get_my_saves(user_id: str, limit: int, offset: int) -> list[dict]:
    """Lấy danh sách bài viết đã lưu của user."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                p.id::text, p.title, p.content, p.category, p.tags, p.created_at,
                u.username AS author_name, u.avatar_url AS author_avatar,
                (SELECT COUNT(*) FROM community_likes l WHERE l.post_id = p.id) AS likes_count,
                (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id) AS comments_count
            FROM community_saves s
            JOIN community_posts p ON p.id = s.post_id
            JOIN users u ON u.id = p.author_id
            WHERE s.user_id = $1
            ORDER BY s.saved_at DESC
            LIMIT $2 OFFSET $3
            """,
            user_id, limit, offset,
        )
    return [serialize_record(r) for r in rows]
