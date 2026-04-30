"""
Admin Router - Các endpoint quản trị hệ thống.
Tất cả route đều yêu cầu role='admin'.

Endpoints:
  GET  /api/admin/stats                    - Thống kê tổng quan
  GET  /api/admin/users                    - Danh sách người dùng
  GET  /api/admin/users/{user_id}          - Chi tiết người dùng
  PATCH /api/admin/users/{user_id}/role    - Thay đổi role
  DELETE /api/admin/users/{user_id}        - Xóa người dùng
  GET  /api/admin/interviews               - Tất cả phiên phỏng vấn
  GET  /api/admin/top-candidates           - Top ứng viên theo điểm
  GET  /api/admin/recent-activity          - Hoạt động gần đây
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel

from app.auth.admin_dependency import get_admin_user
from app.database.connection import get_pool

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class UpdateRoleBody(BaseModel):
    role: str  # 'user' | 'admin'


# ── Helper ────────────────────────────────────────────────────────────────────

def _serialize(row) -> dict:
    """Chuyển asyncpg Record → dict, xử lý các kiểu đặc biệt."""
    if row is None:
        return {}
    d = dict(row)
    for k, v in d.items():
        if hasattr(v, "isoformat"):          # datetime / date
            d[k] = v.isoformat()
        elif v is not None and not isinstance(v, (str, int, float, bool, list, dict)):
            d[k] = str(v)
    return d


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats(admin: dict = Depends(get_admin_user)):
    """Thống kê tổng quan hệ thống."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        total_users = await conn.fetchval("SELECT COUNT(*) FROM users WHERE role != 'admin'")
        total_interviews = await conn.fetchval("SELECT COUNT(*) FROM interviews")
        completed_interviews = await conn.fetchval(
            "SELECT COUNT(*) FROM interviews WHERE status = 'completed'"
        )
        avg_score = await conn.fetchval(
            "SELECT ROUND(AVG(overall_score)::numeric, 2) FROM interviews "
            "WHERE status = 'completed' AND overall_score IS NOT NULL"
        )
        total_questions = await conn.fetchval("SELECT COUNT(*) FROM interview_questions")
        # Người dùng mới trong 7 ngày
        new_users_week = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days'"
        )
        # Phiên phỏng vấn trong 7 ngày
        interviews_week = await conn.fetchval(
            "SELECT COUNT(*) FROM interviews WHERE started_at >= NOW() - INTERVAL '7 days'"
        )
        # Tỷ lệ hoàn thành
        completion_rate = round(
            (float(completed_interviews) / float(total_interviews) * 100)
            if total_interviews and total_interviews > 0 else 0,
            1
        )

    return {
        "status": "success",
        "stats": {
            "total_users": total_users,
            "total_interviews": total_interviews,
            "completed_interviews": completed_interviews,
            "avg_score": float(avg_score) if avg_score else 0,
            "total_questions": total_questions,
            "new_users_week": new_users_week,
            "interviews_week": interviews_week,
            "completion_rate": completion_rate,
        },
    }


@router.get("/users")
async def list_users(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: Optional[str] = Query(default=None),
    admin: dict = Depends(get_admin_user),
):
    """Danh sách người dùng với tìm kiếm và phân trang."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        if search:
            rows = await conn.fetch(
                """
                SELECT u.id::text, u.username, u.email, u.role::text,
                       u.avatar_url, u.phone_number, u.created_at,
                       COUNT(i.id) AS total_interviews,
                       ROUND(AVG(i.overall_score)::numeric, 2) AS avg_score
                FROM users u
                LEFT JOIN interviews i ON i.user_id = u.id
                WHERE u.username ILIKE $1 OR u.email ILIKE $1
                GROUP BY u.id, u.username, u.email, u.role, u.avatar_url, u.phone_number, u.created_at
                ORDER BY u.created_at DESC
                LIMIT $2 OFFSET $3
                """,
                f"%{search}%", limit, offset,
            )
            total = await conn.fetchval(
                "SELECT COUNT(*) FROM users WHERE username ILIKE $1 OR email ILIKE $1",
                f"%{search}%",
            )
        else:
            rows = await conn.fetch(
                """
                SELECT u.id::text, u.username, u.email, u.role::text,
                       u.avatar_url, u.phone_number, u.created_at,
                       COUNT(i.id) AS total_interviews,
                       ROUND(AVG(i.overall_score)::numeric, 2) AS avg_score
                FROM users u
                LEFT JOIN interviews i ON i.user_id = u.id
                GROUP BY u.id, u.username, u.email, u.role, u.avatar_url, u.phone_number, u.created_at
                ORDER BY u.created_at DESC
                LIMIT $1 OFFSET $2
                """,
                limit, offset,
            )
            total = await conn.fetchval("SELECT COUNT(*) FROM users")

    return {
        "status": "success",
        "total": total,
        "users": [_serialize(r) for r in rows],
    }


@router.get("/users/{user_id}")
async def get_user_detail(user_id: str, admin: dict = Depends(get_admin_user)):
    """Chi tiết một người dùng kèm lịch sử phỏng vấn gần đây."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            """
            SELECT id::text, username, email, role::text,
                   avatar_url, phone_number, created_at, updated_at
            FROM users WHERE id = $1
            """,
            user_id,
        )
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")

        interviews = await conn.fetch(
            """
            SELECT id::text, topic, level, status, overall_score, started_at, completed_at,
                   (SELECT COUNT(*) FROM interview_questions WHERE interview_id = i.id) AS total_questions
            FROM interviews i
            WHERE user_id = $1
            ORDER BY started_at DESC
            LIMIT 10
            """,
            user_id,
        )

    result = _serialize(user)
    result["interviews"] = [_serialize(r) for r in interviews]
    return {"status": "success", "user": result}


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: UpdateRoleBody,
    admin: dict = Depends(get_admin_user),
):
    """Thay đổi quyền hạn của người dùng."""
    if body.role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role không hợp lệ. Chỉ chấp nhận 'user' hoặc 'admin'.")

    # Không cho phép admin tự thay đổi role của chính mình
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Không thể thay đổi role của chính mình.")

    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE users SET role = $2::user_role, updated_at = NOW()
            WHERE id = $1
            RETURNING id::text, username, email, role::text
            """,
            user_id, body.role,
        )
    if not row:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
    return {"status": "success", "user": _serialize(row)}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    """Xóa người dùng khỏi hệ thống (cascade xóa interviews)."""
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Không thể xóa tài khoản admin đang đăng nhập.")
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM users WHERE id = $1", user_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")


@router.get("/interviews")
async def list_all_interviews(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    admin: dict = Depends(get_admin_user),
):
    """Danh sách tất cả phiên phỏng vấn của mọi người dùng."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        where_clause = ""
        params = [limit, offset]

        if status_filter and status_filter in ("in_progress", "completed", "cancelled"):
            where_clause = "WHERE i.status = $3"
            params.append(status_filter)

        rows = await conn.fetch(
            f"""
            SELECT i.id::text, i.topic, i.level, i.language, i.status,
                   i.overall_score, i.started_at, i.completed_at,
                   u.username, u.email,
                   COUNT(iq.id) AS total_questions,
                   COUNT(iq.id) FILTER (WHERE iq.user_answer IS NOT NULL AND iq.user_answer != '') AS answered_questions
            FROM interviews i
            JOIN users u ON u.id = i.user_id
            LEFT JOIN interview_questions iq ON iq.interview_id = i.id
            {where_clause}
            GROUP BY i.id, i.topic, i.level, i.language, i.status,
                     i.overall_score, i.started_at, i.completed_at,
                     u.username, u.email
            ORDER BY i.started_at DESC
            LIMIT $1 OFFSET $2
            """,
            *params,
        )

        count_query = "SELECT COUNT(*) FROM interviews"
        if status_filter and status_filter in ("in_progress", "completed", "cancelled"):
            total = await conn.fetchval(f"{count_query} WHERE status = $1", status_filter)
        else:
            total = await conn.fetchval(count_query)

    return {
        "status": "success",
        "total": total,
        "interviews": [_serialize(r) for r in rows],
    }


@router.get("/top-candidates")
async def get_top_candidates(
    limit: int = Query(default=10, ge=1, le=50),
    admin: dict = Depends(get_admin_user),
):
    """Top ứng viên dựa trên điểm trung bình phỏng vấn."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                u.id::text,
                u.username,
                u.email,
                u.avatar_url,
                COUNT(i.id) AS total_interviews,
                COUNT(i.id) FILTER (WHERE i.status = 'completed') AS completed_interviews,
                ROUND(AVG(i.overall_score) FILTER (WHERE i.status = 'completed')::numeric, 2) AS avg_score,
                MAX(i.overall_score) AS best_score,
                MAX(i.started_at) AS last_interview
            FROM users u
            JOIN interviews i ON i.user_id = u.id
            WHERE u.role = 'user'
            GROUP BY u.id, u.username, u.email, u.avatar_url
            HAVING COUNT(i.id) FILTER (WHERE i.status = 'completed') > 0
            ORDER BY avg_score DESC NULLS LAST, total_interviews DESC
            LIMIT $1
            """,
            limit,
        )
    return {
        "status": "success",
        "candidates": [_serialize(r) for r in rows],
    }


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = Query(default=15, ge=1, le=50),
    admin: dict = Depends(get_admin_user),
):
    """Hoạt động phỏng vấn gần đây trên toàn hệ thống."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                i.id::text, i.topic, i.level, i.status, i.overall_score,
                i.started_at, i.completed_at,
                u.username, u.email, u.avatar_url
            FROM interviews i
            JOIN users u ON u.id = i.user_id
            ORDER BY COALESCE(i.completed_at, i.started_at) DESC
            LIMIT $1
            """,
            limit,
        )
    return {
        "status": "success",
        "activities": [_serialize(r) for r in rows],
    }


@router.get("/stats/chart")
async def get_chart_data(
    days: int = Query(default=30, ge=7, le=90),
    admin: dict = Depends(get_admin_user),
):
    """Dữ liệu biểu đồ: số phỏng vấn và điểm TB theo ngày."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                DATE(started_at AT TIME ZONE 'Asia/Ho_Chi_Minh') AS date,
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed,
                ROUND(AVG(overall_score) FILTER (WHERE status = 'completed')::numeric, 2) AS avg_score
            FROM interviews
            WHERE started_at >= NOW() - ($1 || ' days')::INTERVAL
            GROUP BY DATE(started_at AT TIME ZONE 'Asia/Ho_Chi_Minh')
            ORDER BY date ASC
            """,
            str(days),
        )
    return {
        "status": "success",
        "chart": [_serialize(r) for r in rows],
    }
