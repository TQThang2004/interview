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
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.dependencies import get_admin_user
from app.core.constants import VALID_ROLES
from app.schemas.admin_schemas import UpdateRoleBody
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
