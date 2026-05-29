"""
Community Controller – nhận request, gọi community_service, format response.
"""
from typing import Optional

from app.services import community_service


async def handle_list_posts(
    limit: int, offset: int,
    search: Optional[str], category: Optional[str], tag: Optional[str],
    current_user: dict,
) -> dict:
    total, posts = await community_service.list_posts(
        limit, offset, search, category, tag, current_user["id"]
    )
    return {"status": "success", "total": total, "posts": posts}


async def handle_create_post(
    author_id: str, author_username: str, author_avatar: Optional[str],
    title: str, content: str, category: str, tags: list[str], image_url: Optional[str] = None
) -> dict:
    post = await community_service.create_post(author_id, title, content, category, tags, image_url)
    post["author_name"] = author_username
    post["author_avatar"] = author_avatar
    post["likes_count"] = 0
    post["comments_count"] = 0
    post["is_liked"] = False
    post["is_saved"] = False
    return {
        "status": "success",
        "post": post,
        "message": "Bài viết đã được gửi và đang chờ admin kiểm duyệt."
    }


async def handle_get_post_detail(post_id: str, current_user_id: str) -> dict | None:
    post = await community_service.get_post_detail(post_id, current_user_id)
    if not post:
        return None
    return {"status": "success", "post": post}


async def handle_delete_post(
    post_id: str, current_user_id: str, current_user_role: str
) -> str | None:
    """
    Trả về:
    - None: bài viết không tồn tại
    - "forbidden": không có quyền xóa
    - "ok": xóa thành công
    """
    author_id = await community_service.get_post_author_id(post_id)
    if author_id is None:
        return None
    if author_id != current_user_id and current_user_role != "admin":
        return "forbidden"
    await community_service.delete_post(post_id)
    return "ok"


async def handle_toggle_like(post_id: str, user_id: str) -> dict:
    liked, count = await community_service.toggle_like(post_id, user_id)
    return {"status": "success", "liked": liked, "likes_count": count}


async def handle_toggle_save(post_id: str, user_id: str) -> dict:
    saved = await community_service.toggle_save(post_id, user_id)
    return {"status": "success", "saved": saved}


async def handle_get_comments(post_id: str) -> dict:
    comments = await community_service.get_comments(post_id)
    return {"status": "success", "comments": comments}


async def handle_add_comment(
    post_id: str, author_id: str, author_username: str,
    author_avatar: Optional[str], content: str,
) -> dict | None:
    comment = await community_service.add_comment(post_id, author_id, content)
    if comment is None:
        return None
    comment["author_id"] = author_id
    comment["author_name"] = author_username
    comment["author_avatar"] = author_avatar
    return {"status": "success", "comment": comment}


async def handle_delete_comment(
    comment_id: str, current_user_id: str, current_user_role: str
) -> str | None:
    """
    Trả về:
    - None: comment không tồn tại
    - "forbidden": không có quyền xóa
    - "ok": xóa thành công
    """
    author_id = await community_service.get_comment_author_id(comment_id)
    if author_id is None:
        return None
    if author_id != current_user_id and current_user_role != "admin":
        return "forbidden"
    await community_service.delete_comment(comment_id)
    return "ok"


async def handle_get_popular_tags(limit: int) -> dict:
    tags = await community_service.get_popular_tags(limit)
    return {"status": "success", "tags": tags}


async def handle_get_my_saves(user_id: str, limit: int, offset: int) -> dict:
    posts = await community_service.get_my_saves(user_id, limit, offset)
    return {"status": "success", "posts": posts}


async def handle_get_my_posts(user_id: str, limit: int, offset: int) -> dict:
    total, posts = await community_service.get_my_posts(user_id, limit, offset)
    return {"status": "success", "total": total, "posts": posts}


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

async def handle_get_notifications(user_id: str, limit: int = 20) -> dict:
    notifications = await community_service.get_user_notifications(user_id, limit)
    unread_count = await community_service.count_unread_notifications(user_id)
    return {
        "status": "success",
        "notifications": notifications,
        "unread_count": unread_count,
    }


async def handle_mark_notification_read(notification_id: str, user_id: str) -> dict:
    success = await community_service.mark_notification_read(notification_id, user_id)
    return {"status": "success" if success else "not_found"}


async def handle_mark_all_notifications_read(user_id: str) -> dict:
    await community_service.mark_all_notifications_read(user_id)
    return {"status": "success"}
