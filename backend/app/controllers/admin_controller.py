"""
Admin Controller â€“ nháº­n request, gá»i admin_service, format response.
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

# Cloudinary config (cÃ³ thá»ƒ Ä‘Ã£ Ä‘Æ°á»£c init á»Ÿ cv_evaluation_controller, nhÆ°ng Ä‘áº·t láº¡i Ä‘á»ƒ cháº¯c cháº¯n)
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


async def handle_list_users(limit: int, offset: int, search: Optional[str]) -> dict:
    total, users = await admin_service.list_users(limit, offset, search)
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
    limit: int, offset: int, status_filter: Optional[str]
) -> dict:
    total, interviews = await admin_service.list_all_interviews(limit, offset, status_filter)
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
) -> dict:
    total, posts = await admin_service.list_community_posts_admin(
        limit, offset, status_filter, search
    )
    return {"status": "success", "total": total, "posts": posts}


async def handle_approve_community_post(admin_id: str, post_id: str) -> dict | None:
    """Duyá»‡t bÃ i vÃ  gá»­i notification cho tÃ¡c giáº£."""
    post = await admin_service.approve_community_post(post_id)
    if not post:
        return None
    # Gá»­i notification cho tÃ¡c giáº£
    await community_service.create_notification(
        user_id=post["author_id"],
        notif_type="post_approved",
        message=f"âœ… BÃ i viáº¿t \"{post['title']}\" cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c admin duyá»‡t vÃ  hiá»ƒn thá»‹ cÃ´ng khai.",
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
    """Tá»« chá»‘i bÃ i, xÃ³a bÃ i vÃ  gá»­i notification cho tÃ¡c giáº£."""
    result = await admin_service.reject_community_post(post_id)
    if not result:
        return None
    author_id, title = result
    # Gá»­i notification cho tÃ¡c giáº£
    await community_service.create_notification(
        user_id=author_id,
        notif_type="post_rejected",
        message=f"âŒ BÃ i viáº¿t \"{title}\" cá»§a báº¡n Ä‘Ã£ bá»‹ tá»« chá»‘i vÃ  xÃ³a do khÃ´ng phÃ¹ há»£p vá»›i quy Ä‘á»‹nh cá»™ng Ä‘á»“ng.",
    )
    author_email = await admin_service.get_user_email(author_id)
    await email_service.send_email(
        author_email,
        "Bai viet cua ban bi tu choi",
        f"Bai viet \"{title}\" da bi tu choi va xoa do khong phu hop voi quy dinh cong dong.",
    )
    await admin_service.create_audit_log(admin_id, "reject_post", "community_post", post_id, {"title": title})
    return {"status": "success", "message": "BÃ i viáº¿t Ä‘Ã£ bá»‹ tá»« chá»‘i vÃ  xÃ³a."}


async def handle_admin_delete_community_post(admin_id: str, post_id: str) -> bool:
    deleted = await admin_service.admin_delete_community_post(post_id)
    if deleted:
        await admin_service.create_audit_log(admin_id, "delete_post", "community_post", post_id)
    return deleted


# ---------------------------------------------------------------------------
# CV Evaluations (Admin)
# ---------------------------------------------------------------------------

async def handle_list_all_cv_evaluations(
    limit: int, offset: int, search: Optional[str]
) -> dict:
    total, evaluations = await admin_service.list_all_cv_evaluations(limit, offset, search)
    return {"status": "success", "total": total, "evaluations": evaluations}


async def handle_admin_delete_cv_evaluation(admin_id: str, eval_id: str) -> dict | None:
    """Admin xÃ³a CV evaluation khá»i DB vÃ  Cloudinary."""
    public_id = await admin_service.admin_delete_cv_evaluation(eval_id)
    if public_id is None:
        return None
    # XÃ³a file trÃªn Cloudinary
    try:
        cloudinary.uploader.destroy(public_id, resource_type="image")
    except Exception as exc:
        logger.warning("Failed to delete Cloudinary CV asset: %s", exc)
    await admin_service.create_audit_log(admin_id, "delete_cv_evaluation", "cv_evaluation", eval_id)
    return {"status": "success", "deleted_id": eval_id}
