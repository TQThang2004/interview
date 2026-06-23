from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.controllers import admin_controller
from app.core.constants import VALID_ROLES
from app.core.dependencies import get_admin_user
from app.schemas.admin_schemas import CreateUserBody, UpdateRoleBody

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats")
async def get_stats(admin: dict = Depends(get_admin_user)):
    return await admin_controller.handle_get_stats()


@router.get("/stats/chart")
async def get_chart_data(
    days: int = Query(default=30, ge=7, le=90),
    admin: dict = Depends(get_admin_user),
):
    return await admin_controller.handle_get_chart_data(days)


@router.get("/users")
async def list_users(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: Optional[str] = Query(default=None),
    role: Optional[str] = Query(default=None),
    admin: dict = Depends(get_admin_user),
):
    return await admin_controller.handle_list_users(limit, offset, search, role)


@router.get("/users/{user_id}")
async def get_user_detail(user_id: str, admin: dict = Depends(get_admin_user)):
    result = await admin_controller.handle_get_user_detail(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
    return result


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(
    body: CreateUserBody,
    admin: dict = Depends(get_admin_user),
):
    if body.role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Role không hợp lệ. Chỉ chấp nhận: {', '.join(VALID_ROLES)}.",
        )
    try:
        return await admin_controller.handle_create_user(body, admin["id"])
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: UpdateRoleBody,
    admin: dict = Depends(get_admin_user),
):
    if body.role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Role không hợp lệ. Chỉ chấp nhận: {', '.join(VALID_ROLES)}.",
        )
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Không thể thay đổi role của chính mình.")

    result = await admin_controller.handle_update_user_role(admin["id"], user_id, body.role)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
    return result


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Không thể xóa tài khoản admin đang đăng nhập.")
    deleted = await admin_controller.handle_delete_user(admin["id"], user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")


@router.get("/interviews")
async def list_all_interviews(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    search: Optional[str] = Query(default=None),
    admin: dict = Depends(get_admin_user),
):
    return await admin_controller.handle_list_all_interviews(limit, offset, status_filter, search)


@router.get("/interviews/{interview_id}")
async def get_interview_detail(
    interview_id: str,
    admin: dict = Depends(get_admin_user),
):
    result = await admin_controller.handle_admin_get_interview_detail(interview_id)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên phỏng vấn.")
    return result


@router.delete("/interviews/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interview(
    interview_id: str,
    admin: dict = Depends(get_admin_user),
):
    deleted = await admin_controller.handle_admin_delete_interview(admin["id"], interview_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên phỏng vấn.")


@router.get("/top-candidates")
async def get_top_candidates(
    limit: int = Query(default=10, ge=1, le=50),
    admin: dict = Depends(get_admin_user),
):
    return await admin_controller.handle_get_top_candidates(limit)


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = Query(default=15, ge=1, le=50),
    admin: dict = Depends(get_admin_user),
):
    return await admin_controller.handle_get_recent_activity(limit)


@router.get("/rag/status")
async def get_rag_status(admin: dict = Depends(get_admin_user)):
    return await admin_controller.handle_get_rag_status()


@router.get("/community/posts")
async def list_community_posts(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    search: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    admin: dict = Depends(get_admin_user),
):
    return await admin_controller.handle_list_community_posts(
        limit, offset, status_filter, search, category
    )


@router.patch("/community/posts/{post_id}/approve")
async def approve_community_post(
    post_id: str,
    admin: dict = Depends(get_admin_user),
):
    result = await admin_controller.handle_approve_community_post(admin["id"], post_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bài viết hoặc bài đã được duyệt rồi.",
        )
    return result


@router.post("/community/posts/{post_id}/reject", status_code=status.HTTP_200_OK)
async def reject_community_post(
    post_id: str,
    admin: dict = Depends(get_admin_user),
):
    result = await admin_controller.handle_reject_community_post(admin["id"], post_id)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết.")
    return result


@router.delete("/community/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_community_post(
    post_id: str,
    admin: dict = Depends(get_admin_user),
):
    deleted = await admin_controller.handle_admin_delete_community_post(admin["id"], post_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết.")


@router.get("/cv-evaluations")
async def list_all_cv_evaluations(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: Optional[str] = Query(default=None),
    from_date: Optional[str] = Query(default=None),
    to_date: Optional[str] = Query(default=None),
    admin: dict = Depends(get_admin_user),
):
    return await admin_controller.handle_list_all_cv_evaluations(
        limit, offset, search, from_date, to_date
    )


@router.delete("/cv-evaluations/{eval_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_cv_evaluation(
    eval_id: str,
    admin: dict = Depends(get_admin_user),
):
    result = await admin_controller.handle_admin_delete_cv_evaluation(admin["id"], eval_id)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá CV.")


@router.get("/audit-logs")
async def list_audit_logs(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    actor_id: Optional[str] = Query(default=None),
    action: Optional[str] = Query(default=None),
    entity_type: Optional[str] = Query(default=None),
    admin: dict = Depends(get_admin_user),
):
    return await admin_controller.handle_list_audit_logs(
        limit, offset, actor_id, action, entity_type
    )
