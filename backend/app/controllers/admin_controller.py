"""
Admin Controller – nhận request, gọi admin_service, format response.
"""
from typing import Optional

import cloudinary
import cloudinary.uploader

from app.core.logging import get_logger
from app.services import admin_service, community_service, email_service
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

logger = get_logger(__name__)


async def handle_get_stats() -> dict:
    stats = await admin_service.get_system_stats()
    return {"status": "success", "stats": stats}


async def handle_get_chart_data(days: int) -> dict:
    chart = await admin_service.get_chart_data(days)
    return {"status": "success", "chart": chart}


async def handle_list_users(
    limit: int,
    offset: int,
    search: Optional[str],
    role: Optional[str] = None,
) -> dict:
    total, users = await admin_service.list_users(limit, offset, search, role)
    return {"status": "success", "total": total, "users": users}


async def handle_create_user(body, admin_id: str) -> dict:
    user = await admin_service.create_user(body.username, body.email, body.password, body.role)
    await admin_service.create_audit_log(admin_id, "create_user", "user", user["id"], {"email": body.email, "role": body.role})
    return {"status": "success", "user": user}


async def handle_get_user_detail(user_id: str) -> dict | None:
    user = await admin_service.get_user_detail(user_id)
    if not user:
        return None
    return {"status": "success", "user": user}


async def handle_update_user_role(admin_id: str, user_id: str, role: str) -> dict | None:
    user = await admin_service.update_user_role(user_id, role)
    if not user:
        return None
    await admin_service.create_audit_log(admin_id, "update_user_role", "user", user_id, {"role": role})
    return {"status": "success", "user": user}


async def handle_delete_user(admin_id: str, user_id: str) -> bool:
    deleted = await admin_service.delete_user(user_id)
    if deleted:
        await admin_service.create_audit_log(admin_id, "delete_user", "user", user_id)
    return deleted


async def handle_list_all_interviews(
    limit: int,
    offset: int,
    status_filter: Optional[str],
    search: Optional[str] = None,
) -> dict:
    total, interviews = await admin_service.list_all_interviews(limit, offset, status_filter, search)
    return {"status": "success", "total": total, "interviews": interviews}


async def handle_admin_get_interview_detail(interview_id: str) -> dict | None:
    detail = await admin_service.admin_get_interview_detail(interview_id)
    if not detail:
        return None
    return {"status": "success", "interview": detail}


async def handle_admin_delete_interview(admin_id: str, interview_id: str) -> bool:
    deleted = await admin_service.admin_delete_interview(interview_id)
    if deleted:
        await admin_service.create_audit_log(admin_id, "delete_interview", "interview", interview_id)
    return deleted


async def handle_get_top_candidates(limit: int) -> dict:
    candidates = await admin_service.get_top_candidates(limit)
    return {"status": "success", "candidates": candidates}


async def handle_get_recent_activity(limit: int) -> dict:
    activities = await admin_service.get_recent_activity(limit)
    return {"status": "success", "activities": activities}


async def handle_get_rag_status() -> dict:
    return await admin_service.get_rag_status()


# ---------------------------------------------------------------------------
# Community Posts (Admin)
# ---------------------------------------------------------------------------

async def handle_list_community_posts(
    limit: int,
    offset: int,
    status_filter: Optional[str],
    search: Optional[str],
    category: Optional[str] = None,
) -> dict:
    total, posts = await admin_service.list_community_posts_admin(
        limit, offset, status_filter, search, category
    )
    return {"status": "success", "total": total, "posts": posts}


async def handle_approve_community_post(admin_id: str, post_id: str) -> dict | None:
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
    author_email = await admin_service.get_user_email(post["author_id"])
    await email_service.send_email(
        author_email,
        "Bai viet cua ban da duoc duyet",
        f"Bai viet \"{post['title']}\" da duoc admin duyet va hien thi cong khai.",
    )
    await admin_service.create_audit_log(admin_id, "approve_post", "community_post", post_id)
    return {"status": "success", "post": post}


async def handle_reject_community_post(admin_id: str, post_id: str) -> dict | None:
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
    author_email = await admin_service.get_user_email(author_id)
    await email_service.send_email(
        author_email,
        "Bai viet cua ban bi tu choi",
        f"Bai viet \"{title}\" da bi tu choi va xoa do khong phu hop voi quy dinh cong dong.",
    )
    await admin_service.create_audit_log(admin_id, "reject_post", "community_post", post_id, {"title": title})
    return {"status": "success", "message": "Bài viết đã bị từ chối và xóa."}


async def handle_admin_delete_community_post(admin_id: str, post_id: str) -> bool:
    deleted = await admin_service.admin_delete_community_post(post_id)
    if deleted:
        await admin_service.create_audit_log(admin_id, "delete_post", "community_post", post_id)
    return deleted


# ---------------------------------------------------------------------------
# CV Evaluations (Admin)
# ---------------------------------------------------------------------------

async def handle_list_all_cv_evaluations(
    limit: int,
    offset: int,
    search: Optional[str],
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> dict:
    total, evaluations = await admin_service.list_all_cv_evaluations(
        limit, offset, search, from_date, to_date
    )
    return {"status": "success", "total": total, "evaluations": evaluations}


async def handle_admin_delete_cv_evaluation(admin_id: str, eval_id: str) -> dict | None:
    """Admin xóa CV evaluation khỏi DB và Cloudinary."""
    public_id = await admin_service.admin_delete_cv_evaluation(eval_id)
    if public_id is None:
        return None
    # Xóa file trên Cloudinary
    if public_id:
        try:
            cloudinary.uploader.destroy(public_id, resource_type="image")
        except Exception as exc:
            logger.warning("Failed to delete Cloudinary CV asset: %s", exc)
    await admin_service.create_audit_log(admin_id, "delete_cv_evaluation", "cv_evaluation", eval_id)
    return {"status": "success", "deleted_id": eval_id}


async def handle_list_audit_logs(
    limit: int,
    offset: int,
    actor_id: Optional[str],
    action: Optional[str],
    entity_type: Optional[str],
) -> dict:
    total, logs = await admin_service.list_audit_logs(
        limit, offset, actor_id, action, entity_type
    )
    return {"status": "success", "total": total, "logs": logs}
