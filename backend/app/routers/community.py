"""
Community Router - Quản lý bài viết cộng đồng.

Endpoints:
  GET    /api/community/posts              - Danh sách bài viết (phân trang + tìm kiếm)
  POST   /api/community/posts              - Tạo bài viết mới
  GET    /api/community/posts/{post_id}    - Chi tiết bài viết + comments
  DELETE /api/community/posts/{post_id}    - Xóa bài viết (owner hoặc admin)
  POST   /api/community/posts/{post_id}/like    - Toggle like
  POST   /api/community/posts/{post_id}/save    - Toggle save
  GET    /api/community/posts/{post_id}/comments - Lấy comments
  POST   /api/community/posts/{post_id}/comments - Thêm comment
  DELETE /api/community/comments/{comment_id}    - Xóa comment
  GET    /api/community/tags               - Danh sách tags phổ biến
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.database.connection import get_pool

router = APIRouter(prefix="/api/community", tags=["Community"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class CreatePostBody(BaseModel):
    title: str
    content: str
    category: str = "Thảo luận"   # Kinh nghiệm | Câu hỏi | Tài nguyên | Thảo luận
    tags: List[str] = []


class CreateCommentBody(BaseModel):
    content: str


# ── Helper ────────────────────────────────────────────────────────────────────

def _serialize(row) -> dict:
    if row is None:
        return {}
    d = dict(row)
    for k, v in d.items():
        if hasattr(v, "isoformat"):
            d[k] = v.isoformat()
        elif v is not None and not isinstance(v, (str, int, float, bool, list, dict)):
            d[k] = str(v)
    return d


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/posts")
async def list_posts(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    tag: Optional[str] = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    """Lấy danh sách bài viết với phân trang và tìm kiếm."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Build WHERE conditions
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
            *params, current_user["id"], current_user["id"], limit, offset,
        )

        count_query = f"SELECT COUNT(*) FROM community_posts p {where}"
        total = await conn.fetchval(count_query, *params)

    return {
        "status": "success",
        "total": total,
        "posts": [_serialize(r) for r in rows],
    }


@router.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_post(
    body: CreatePostBody,
    current_user: dict = Depends(get_current_user),
):
    """Tạo bài viết mới."""
    if not body.title.strip():
        raise HTTPException(status_code=400, detail="Tiêu đề không được để trống.")
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Nội dung không được để trống.")
    if body.category not in ("Kinh nghiệm", "Câu hỏi", "Tài nguyên", "Thảo luận"):
        raise HTTPException(status_code=400, detail="Danh mục không hợp lệ.")

    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO community_posts (author_id, title, content, category, tags)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id::text, title, content, category, tags, created_at
            """,
            current_user["id"], body.title.strip(), body.content.strip(),
            body.category, body.tags,
        )
    result = _serialize(row)
    result["author_name"] = current_user["username"]
    result["author_avatar"] = current_user.get("avatar_url")
    result["likes_count"] = 0
    result["comments_count"] = 0
    result["is_liked"] = False
    result["is_saved"] = False
    return {"status": "success", "post": result}


@router.get("/posts/{post_id}")
async def get_post_detail(
    post_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Chi tiết bài viết kèm comments."""
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
            post_id, current_user["id"],
        )
        if not post:
            raise HTTPException(status_code=404, detail="Không tìm thấy bài viết.")

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

    result = _serialize(post)
    result["comments"] = [_serialize(c) for c in comments]
    return {"status": "success", "post": result}


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: str, current_user: dict = Depends(get_current_user)):
    """Xóa bài viết (chỉ owner hoặc admin)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        post = await conn.fetchrow(
            "SELECT author_id::text FROM community_posts WHERE id = $1", post_id
        )
        if not post:
            raise HTTPException(status_code=404, detail="Không tìm thấy bài viết.")
        if post["author_id"] != current_user["id"] and current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Bạn không có quyền xóa bài viết này.")
        await conn.execute("DELETE FROM community_posts WHERE id = $1", post_id)


@router.post("/posts/{post_id}/like")
async def toggle_like(post_id: str, current_user: dict = Depends(get_current_user)):
    """Toggle like bài viết."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT id FROM community_likes WHERE post_id = $1 AND user_id = $2",
            post_id, current_user["id"],
        )
        if existing:
            await conn.execute(
                "DELETE FROM community_likes WHERE post_id = $1 AND user_id = $2",
                post_id, current_user["id"],
            )
            liked = False
        else:
            await conn.execute(
                "INSERT INTO community_likes (post_id, user_id) VALUES ($1, $2)",
                post_id, current_user["id"],
            )
            liked = True
        count = await conn.fetchval(
            "SELECT COUNT(*) FROM community_likes WHERE post_id = $1", post_id
        )
    return {"status": "success", "liked": liked, "likes_count": count}


@router.post("/posts/{post_id}/save")
async def toggle_save(post_id: str, current_user: dict = Depends(get_current_user)):
    """Toggle save/bookmark bài viết."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT id FROM community_saves WHERE post_id = $1 AND user_id = $2",
            post_id, current_user["id"],
        )
        if existing:
            await conn.execute(
                "DELETE FROM community_saves WHERE post_id = $1 AND user_id = $2",
                post_id, current_user["id"],
            )
            saved = False
        else:
            await conn.execute(
                "INSERT INTO community_saves (post_id, user_id) VALUES ($1, $2)",
                post_id, current_user["id"],
            )
            saved = True
    return {"status": "success", "saved": saved}


@router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str, current_user: dict = Depends(get_current_user)):
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
    return {"status": "success", "comments": [_serialize(r) for r in rows]}


@router.post("/posts/{post_id}/comments", status_code=status.HTTP_201_CREATED)
async def add_comment(
    post_id: str,
    body: CreateCommentBody,
    current_user: dict = Depends(get_current_user),
):
    """Thêm comment vào bài viết."""
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Nội dung comment không được để trống.")
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Kiểm tra bài viết tồn tại
        exists = await conn.fetchval("SELECT id FROM community_posts WHERE id = $1", post_id)
        if not exists:
            raise HTTPException(status_code=404, detail="Không tìm thấy bài viết.")
        row = await conn.fetchrow(
            """
            INSERT INTO community_comments (post_id, author_id, content)
            VALUES ($1, $2, $3)
            RETURNING id::text, content, created_at
            """,
            post_id, current_user["id"], body.content.strip(),
        )
    result = _serialize(row)
    result["author_id"] = current_user["id"]
    result["author_name"] = current_user["username"]
    result["author_avatar"] = current_user.get("avatar_url")
    return {"status": "success", "comment": result}


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(comment_id: str, current_user: dict = Depends(get_current_user)):
    """Xóa comment (chỉ owner hoặc admin)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        comment = await conn.fetchrow(
            "SELECT author_id::text FROM community_comments WHERE id = $1", comment_id
        )
        if not comment:
            raise HTTPException(status_code=404, detail="Không tìm thấy comment.")
        if comment["author_id"] != current_user["id"] and current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Bạn không có quyền xóa comment này.")
        await conn.execute("DELETE FROM community_comments WHERE id = $1", comment_id)


@router.get("/tags")
async def get_popular_tags(
    limit: int = Query(default=20, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
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
    return {
        "status": "success",
        "tags": [{"tag": r["tag"], "count": r["count"]} for r in rows],
    }


@router.get("/my-saves")
async def get_my_saves(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    """Lấy danh sách bài viết đã lưu của user hiện tại."""
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
            current_user["id"], limit, offset,
        )
    return {"status": "success", "posts": [_serialize(r) for r in rows]}
