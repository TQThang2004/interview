"""
Admin Controller – nhận request, gọi admin_service, format response.
"""
from typing import Optional

import cloudinary
import cloudinary.uploader

from app.services import admin_service, community_service
from app.core.config import (
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
)

# Cloudinary config (có thể đã được init ở cv_evaluation_controller, nhưng đặt lại để chắc chắn)
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)


async def handle_get_stats() -> dict:
    stats = await admin_service.get_system_stats()
    return {"status": "success", "stats": stats}


async def handle_get_chart_data(days: int) -> dict:
    chart = await admin_service.get_chart_data(days)
    return {"status": "success", "chart": chart}


async def handle_list_users(limit: int, offset: int, search: Optional[str]) -> dict:
    total, users = await admin_service.list_users(limit, offset, search)
    return {"status": "success", "total": total, "users": users}


async def handle_get_user_detail(user_id: str) -> dict | None:
    user = await admin_service.get_user_detail(user_id)
    if not user:
        return None
    return {"status": "success", "user": user}


async def handle_update_user_role(user_id: str, role: str) -> dict | None:
    user = await admin_service.update_user_role(user_id, role)
    if not user:
        return None
    return {"status": "success", "user": user}


async def handle_delete_user(user_id: str) -> bool:
    return await admin_service.delete_user(user_id)


async def handle_list_all_interviews(
    limit: int, offset: int, status_filter: Optional[str]
) -> dict:
    total, interviews = await admin_service.list_all_interviews(limit, offset, status_filter)
    return {"status": "success", "total": total, "interviews": interviews}


async def handle_get_top_candidates(limit: int) -> dict:
    candidates = await admin_service.get_top_candidates(limit)
    return {"status": "success", "candidates": candidates}


async def handle_get_recent_activity(limit: int) -> dict:
    activities = await admin_service.get_recent_activity(limit)
    return {"status": "success", "activities": activities}


# ---------------------------------------------------------------------------
# Community Posts (Admin)
# ---------------------------------------------------------------------------

async def handle_list_community_posts(
    limit: int,
    offset: int,
    status_filter: Optional[str],
    search: Optional[str],
) -> dict:
    total, posts = await admin_service.list_community_posts_admin(
        limit, offset, status_filter, search
    )
    return {"status": "success", "total": total, "posts": posts}


async def handle_approve_community_post(post_id: str) -> dict | None:
    """Duyệt bài và gửi notification cho tác giả."""
    post = await admin_service.approve_community_post(post_id)
    if not post:
        return None
    # Gửi notification cho tác giả
    await community_service.create_notification(
        user_id=post["author_id"],
        notif_type="post_approved",
        message=f"✅ Bài viết \"{post['title']}\" của bạn đã được admin duyệt và hiển thị công khai.",
    )
    return {"status": "success", "post": post}


async def handle_reject_community_post(post_id: str) -> dict | None:
    """Từ chối bài, xóa bài và gửi notification cho tác giả."""
    result = await admin_service.reject_community_post(post_id)
    if not result:
        return None
    author_id, title = result
    # Gửi notification cho tác giả
    await community_service.create_notification(
        user_id=author_id,
        notif_type="post_rejected",
        message=f"❌ Bài viết \"{title}\" của bạn đã bị từ chối và xóa do không phù hợp với quy định cộng đồng.",
    )
    return {"status": "success", "message": "Bài viết đã bị từ chối và xóa."}


async def handle_admin_delete_community_post(post_id: str) -> bool:
    return await admin_service.admin_delete_community_post(post_id)


# ---------------------------------------------------------------------------
# CV Evaluations (Admin)
# ---------------------------------------------------------------------------

async def handle_list_all_cv_evaluations(
    limit: int, offset: int, search: Optional[str]
) -> dict:
    total, evaluations = await admin_service.list_all_cv_evaluations(limit, offset, search)
    return {"status": "success", "total": total, "evaluations": evaluations}


async def handle_admin_delete_cv_evaluation(eval_id: str) -> dict | None:
    """Admin xóa CV evaluation khỏi DB và Cloudinary."""
    public_id = await admin_service.admin_delete_cv_evaluation(eval_id)
    if public_id is None:
        return None
    # Xóa file trên Cloudinary
    try:
        cloudinary.uploader.destroy(public_id, resource_type="image")
    except Exception as exc:
        print(f"[AdminController] WARNING: Không thể xóa Cloudinary asset {public_id}: {exc}")
    return {"status": "success", "deleted_id": eval_id}
