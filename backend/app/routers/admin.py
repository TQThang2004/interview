"""
Admin Router – Các endpoint quản trị hệ thống.
Tất cả route đều yêu cầu role='admin'.

Endpoints:
  GET    /api/admin/stats                    - Thống kê tổng quan
  GET    /api/admin/stats/chart              - Dữ liệu biểu đồ
  GET    /api/admin/users                    - Danh sách người dùng
  GET    /api/admin/users/{user_id}          - Chi tiết người dùng
  PATCH  /api/admin/users/{user_id}/role    - Thay đổi role
  DELETE /api/admin/users/{user_id}          - Xóa người dùng
  GET    /api/admin/interviews               - Tất cả phiên phỏng vấn
  GET    /api/admin/top-candidates           - Top ứng viên theo điểm
  GET    /api/admin/recent-activity          - Hoạt động gần đây

  -- Community moderation --
  GET    /api/admin/community/posts                      - Tất cả bài viết (filter status)
  PATCH  /api/admin/community/posts/{post_id}/approve   - Duyệt bài
  POST   /api/admin/community/posts/{post_id}/reject    - Từ chối bài (xóa + notify)
  DELETE /api/admin/community/posts/{post_id}           - Xóa thẳng bài

  -- CV Evaluations --
  GET    /api/admin/cv-evaluations           - Tất cả đánh giá CV
  DELETE /api/admin/cv-evaluations/{id}      - Xóa đánh giá CV
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.dependencies import get_admin_user
from app.core.constants import VALID_ROLES
from app.schemas.admin_schemas import UpdateRoleBody, CreateUserBody
from app.controllers import admin_controller

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats")
async def get_stats(admin: dict = Depends(get_admin_user)):
    """Thống kê tổng quan hệ thống."""
    return await admin_controller.handle_get_stats()


@router.get("/stats/chart")
async def get_chart_data(
    days: int = Query(default=30, ge=7, le=90),
    admin: dict = Depends(get_admin_user),
):
    """Dữ liệu biểu đồ: số phỏng vấn và điểm TB theo ngày."""
    return await admin_controller.handle_get_chart_data(days)


@router.get("/users")
async def list_users(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: Optional[str] = Query(default=None),
    admin: dict = Depends(get_admin_user),
):
    """Danh sách người dùng với tìm kiếm và phân trang."""
    return await admin_controller.handle_list_users(limit, offset, search)


@router.get("/users/{user_id}")
async def get_user_detail(user_id: str, admin: dict = Depends(get_admin_user)):
    """Chi tiết một người dùng kèm lịch sử phỏng vấn gần đây."""
    result = await admin_controller.handle_get_user_detail(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
    return result


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(
    body: CreateUserBody,
    admin: dict = Depends(get_admin_user),
):
    """Admin tạo người dùng mới."""
    if body.role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Role không hợp lệ. Chỉ chấp nhận: {', '.join(VALID_ROLES)}."
        )
    try:
        return await admin_controller.handle_create_user(body)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: UpdateRoleBody,
    admin: dict = Depends(get_admin_user),
):
    """Thay đổi quyền hạn của người dùng."""
    if body.role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Role không hợp lệ. Chỉ chấp nhận: {', '.join(VALID_ROLES)}."
        )
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Không thể thay đổi role của chính mình.")

    result = await admin_controller.handle_update_user_role(user_id, body.role)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
    return result


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    """Xóa người dùng khỏi hệ thống (cascade xóa interviews)."""
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Không thể xóa tài khoản admin đang đăng nhập.")
    deleted = await admin_controller.handle_delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")


@router.get("/interviews")
async def list_all_interviews(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    admin: dict = Depends(get_admin_user),
):
    """Danh sách tất cả phiên phỏng vấn của mọi người dùng."""
    return await admin_controller.handle_list_all_interviews(limit, offset, status_filter)


@router.get("/interviews/{interview_id}")
async def get_interview_detail(
    interview_id: str,
    admin: dict = Depends(get_admin_user),
):
    """Admin lấy chi tiết một phiên phỏng vấn (không check user_id)."""
    result = await admin_controller.handle_admin_get_interview_detail(interview_id)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên phỏng vấn.")
    return result


@router.delete("/interviews/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interview(
    interview_id: str,
    admin: dict = Depends(get_admin_user),
):
    """Admin xóa thẳng một phiên phỏng vấn."""
    deleted = await admin_controller.handle_admin_delete_interview(interview_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên phỏng vấn.")


@router.get("/top-candidates")
async def get_top_candidates(
    limit: int = Query(default=10, ge=1, le=50),
    admin: dict = Depends(get_admin_user),
):
    """Top ứng viên dựa trên điểm trung bình phỏng vấn."""
    return await admin_controller.handle_get_top_candidates(limit)


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = Query(default=15, ge=1, le=50),
    admin: dict = Depends(get_admin_user),
):
    """Hoạt động phỏng vấn gần đây trên toàn hệ thống."""
    return await admin_controller.handle_get_recent_activity(limit)


# =============================================================================
# Community Post Moderation
# =============================================================================

@router.get("/community/posts")
async def list_community_posts(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    search: Optional[str] = Query(default=None),
    admin: dict = Depends(get_admin_user),
):
    """Tất cả bài viết community (kể cả pending). Lọc theo status, tìm kiếm."""
    return await admin_controller.handle_list_community_posts(
        limit, offset, status_filter, search
    )


@router.patch("/community/posts/{post_id}/approve")
async def approve_community_post(
    post_id: str,
    admin: dict = Depends(get_admin_user),
):
    """Duyệt bài viết community. Gửi notification cho tác giả."""
    result = await admin_controller.handle_approve_community_post(post_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bài viết hoặc bài đã được duyệt rồi."
        )
    return result


@router.post("/community/posts/{post_id}/reject", status_code=status.HTTP_200_OK)
async def reject_community_post(
    post_id: str,
    admin: dict = Depends(get_admin_user),
):
    """Từ chối bài viết (xóa bài + gửi notification cho tác giả)."""
    result = await admin_controller.handle_reject_community_post(post_id)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết.")
    return result


@router.delete("/community/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_community_post(
    post_id: str,
    admin: dict = Depends(get_admin_user),
):
    """Admin xóa thẳng bài viết community."""
    deleted = await admin_controller.handle_admin_delete_community_post(post_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết.")


# =============================================================================
# CV Evaluations (Admin)
# =============================================================================

@router.get("/cv-evaluations")
async def list_all_cv_evaluations(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: Optional[str] = Query(default=None),
    admin: dict = Depends(get_admin_user),
):
    """Danh sách tất cả đánh giá CV của mọi người dùng."""
    return await admin_controller.handle_list_all_cv_evaluations(limit, offset, search)


@router.delete("/cv-evaluations/{eval_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_cv_evaluation(
    eval_id: str,
    admin: dict = Depends(get_admin_user),
):
    """Admin xóa đánh giá CV (DB + Cloudinary)."""
    result = await admin_controller.handle_admin_delete_cv_evaluation(eval_id)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá CV.")
