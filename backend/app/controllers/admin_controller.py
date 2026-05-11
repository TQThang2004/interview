"""
Admin Controller – nhận request, gọi admin_service, format response.
"""
from typing import Optional

from app.services import admin_service


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
