"""
Admin Service – business logic cho các chức năng quản trị hệ thống.

Bao gồm: thống kê, quản lý người dùng, quản lý phiên phỏng vấn.
"""
from typing import Optional

from app.database.connection import get_pool
from app.utils.common import serialize_record


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

async def get_system_stats() -> dict:
    """Lấy thống kê tổng quan hệ thống."""
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
        new_users_week = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days'"
        )
        interviews_week = await conn.fetchval(
            "SELECT COUNT(*) FROM interviews WHERE started_at >= NOW() - INTERVAL '7 days'"
        )
        completion_rate = round(
            (float(completed_interviews) / float(total_interviews) * 100)
            if total_interviews and total_interviews > 0 else 0,
            1
        )

    return {
        "total_users": total_users,
        "total_interviews": total_interviews,
        "completed_interviews": completed_interviews,
        "avg_score": float(avg_score) if avg_score else 0,
        "total_questions": total_questions,
        "new_users_week": new_users_week,
        "interviews_week": interviews_week,
        "completion_rate": completion_rate,
    }


async def get_chart_data(days: int = 30) -> list[dict]:
    """Lấy dữ liệu biểu đồ: số phỏng vấn và điểm TB theo ngày."""
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
    return [serialize_record(r) for r in rows]


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

async def list_users(limit: int, offset: int, search: Optional[str]) -> tuple[int, list[dict]]:
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

    return total, [serialize_record(r) for r in rows]


async def get_user_detail(user_id: str) -> Optional[dict]:
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
            return None

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

    result = serialize_record(user)
    result["interviews"] = [serialize_record(r) for r in interviews]
    return result


async def update_user_role(user_id: str, role: str) -> Optional[dict]:
    """Thay đổi quyền hạn của người dùng. Trả về None nếu không tìm thấy."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE users SET role = $2::user_role, updated_at = NOW()
            WHERE id = $1
            RETURNING id::text, username, email, role::text
            """,
            user_id, role,
        )
    return serialize_record(row) if row else None


async def delete_user(user_id: str) -> bool:
    """Xóa người dùng. Trả về True nếu đã xóa, False nếu không tìm thấy."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM users WHERE id = $1", user_id)
    return result != "DELETE 0"


# ---------------------------------------------------------------------------
# Interviews (admin view)
# ---------------------------------------------------------------------------

async def list_all_interviews(
    limit: int, offset: int, status_filter: Optional[str]
) -> tuple[int, list[dict]]:
    """Danh sách tất cả phiên phỏng vấn của mọi người dùng."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        where_clause = ""
        params: list = [limit, offset]

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

    return total, [serialize_record(r) for r in rows]


async def get_top_candidates(limit: int) -> list[dict]:
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
    return [serialize_record(r) for r in rows]


async def get_recent_activity(limit: int) -> list[dict]:
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
    return [serialize_record(r) for r in rows]
