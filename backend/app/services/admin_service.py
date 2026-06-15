"""
Admin Service – business logic cho các chức năng quản trị hệ thống.

Bao gồm: thống kê, quản lý người dùng, quản lý phiên phỏng vấn.
"""
from typing import Optional
import json

from app.database.connection import get_pool
from app.utils.common import serialize_record
from app.core.security import hash_password
from app.services.practice_service import get_rag_status as get_practice_rag_status


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


async def create_audit_log(
    actor_id: str,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    metadata: dict | None = None,
) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
            VALUES ($1, $2, $3, $4::uuid, $5::jsonb)
            """,
            actor_id,
            action,
            entity_type,
            entity_id,
            json.dumps(metadata or {}),
        )


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


async def create_user(username: str, email: str, password: str, role: str) -> dict:
    """Tạo người dùng mới (được gọi bởi admin)."""
    password_hash = hash_password(password)
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Kiểm tra trùng email
        existing = await conn.fetchval("SELECT id FROM users WHERE email = $1", email)
        if existing:
            raise ValueError(f"Email {email} đã tồn tại.")
        
        row = await conn.fetchrow(
            """
            INSERT INTO users (username, email, password_hash, role)
            VALUES ($1, $2, $3, $4::user_role)
            RETURNING id::text, username, email, role::text, created_at
            """,
            username, email, password_hash, role
        )
    return serialize_record(row)

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


async def admin_get_interview_detail(interview_id: str) -> Optional[dict]:
    """Lấy chi tiết 1 phiên phỏng vấn kèm tất cả câu hỏi và đánh giá (không check user_id)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        interview = await conn.fetchrow(
            """
            SELECT i.id::text, i.topic, i.level, i.language, i.status, i.overall_score, i.overall_feedback,
                   i.started_at, i.completed_at, u.username, u.email
            FROM interviews i
            JOIN users u ON u.id = i.user_id
            WHERE i.id = $1
            """,
            interview_id,
        )
        if not interview:
            return None

        questions = await conn.fetch(
            """
            SELECT id::text, question_text, user_answer, ai_evaluation, score,
                   question_order, asked_at, answered_at
            FROM interview_questions
            WHERE interview_id = $1
            ORDER BY question_order ASC
            """,
            interview_id,
        )
    result = serialize_record(interview)
    result["questions"] = [serialize_record(q) for q in questions]
    return result


async def admin_delete_interview(interview_id: str) -> bool:
    """Admin xóa thẳng cuộc phỏng vấn (cascade sẽ xóa cả câu hỏi)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM interviews WHERE id = $1", interview_id)
    return result != "DELETE 0"

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


async def get_rag_status() -> dict:
    return get_practice_rag_status()


async def get_user_email(user_id: str) -> Optional[str]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        return await conn.fetchval("SELECT email FROM users WHERE id = $1", user_id)


# ---------------------------------------------------------------------------
# Community Posts (admin view)
# ---------------------------------------------------------------------------

async def list_community_posts_admin(
    limit: int,
    offset: int,
    status_filter: Optional[str],
    search: Optional[str] = None,
) -> tuple[int, list[dict]]:
    """Danh sách tất cả bài viết community kèm filter status/search."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        conditions = []
        params: list = []
        idx = 1

        if status_filter and status_filter in ("pending", "approved", "rejected"):
            conditions.append(f"p.status = ${idx}")
            params.append(status_filter)
            idx += 1

        if search:
            conditions.append(
                f"(p.title ILIKE ${idx} OR p.content ILIKE ${idx} OR u.username ILIKE ${idx})"
            )
            params.append(f"%{search}%")
            idx += 1

        where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

        rows = await conn.fetch(
            f"""
            SELECT
                p.id::text, p.title, p.content, p.category, p.tags,
                p.image_url, p.status, p.created_at,
                u.id::text AS author_id,
                u.username AS author_name,
                u.email AS author_email,
                u.avatar_url AS author_avatar,
                (SELECT COUNT(*) FROM community_likes l WHERE l.post_id = p.id) AS likes_count,
                (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id) AS comments_count
            FROM community_posts p
            JOIN users u ON u.id = p.author_id
            {where}
            ORDER BY
                CASE p.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
                p.created_at DESC
            LIMIT ${idx} OFFSET ${idx+1}
            """,
            *params, limit, offset,
        )

        count_query = (
            f"SELECT COUNT(*) FROM community_posts p "
            f"JOIN users u ON u.id = p.author_id {where}"
        )
        total = await conn.fetchval(count_query, *params)

    return total, [serialize_record(r) for r in rows]


async def approve_community_post(post_id: str) -> Optional[dict]:
    """Duyệt bài viết. Trả về dict bao gồm author_id để gửi notification."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE community_posts SET status = 'approved'
            WHERE id = $1 AND status = 'pending'
            RETURNING id::text, title, author_id::text, status
            """,
            post_id,
        )
    return serialize_record(row) if row else None


async def reject_community_post(post_id: str) -> Optional[tuple]:
    """
    Từ chối và XÓA bài viết.
    Trả về (author_id, title) để gửi notification, None nếu không tìm thấy.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT author_id::text, title FROM community_posts WHERE id = $1", post_id
        )
        if not row:
            return None
        await conn.execute("DELETE FROM community_posts WHERE id = $1", post_id)
    return row["author_id"], row["title"]


async def admin_delete_community_post(post_id: str) -> bool:
    """Admin xóa thẳng bài viết. Trả về True nếu thành công."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM community_posts WHERE id = $1", post_id
        )
    return result != "DELETE 0"


# ---------------------------------------------------------------------------
# CV Evaluations (admin view)
# ---------------------------------------------------------------------------

async def list_all_cv_evaluations(
    limit: int,
    offset: int,
    search: Optional[str] = None,
) -> tuple[int, list[dict]]:
    """Danh sách tất cả CV evaluations của mọi user (admin)."""
    import json

    pool = await get_pool()
    async with pool.acquire() as conn:
        if search:
            rows = await conn.fetch(
                """
                SELECT
                    e.id::text, e.user_id::text,
                    u.username, u.email, u.avatar_url,
                    e.original_filename, e.cloudinary_url, e.cloudinary_public_id,
                    e.file_size_bytes, e.overall_score,
                    e.evaluation_result::text, e.evaluated_at
                FROM cv_evaluations e
                JOIN users u ON u.id = e.user_id
                WHERE u.username ILIKE $1 OR u.email ILIKE $1 OR e.original_filename ILIKE $1
                ORDER BY e.evaluated_at DESC
                LIMIT $2 OFFSET $3
                """,
                f"%{search}%", limit, offset,
            )
            total = await conn.fetchval(
                """
                SELECT COUNT(*) FROM cv_evaluations e
                JOIN users u ON u.id = e.user_id
                WHERE u.username ILIKE $1 OR u.email ILIKE $1 OR e.original_filename ILIKE $1
                """,
                f"%{search}%",
            )
        else:
            rows = await conn.fetch(
                """
                SELECT
                    e.id::text, e.user_id::text,
                    u.username, u.email, u.avatar_url,
                    e.original_filename, e.cloudinary_url, e.cloudinary_public_id,
                    e.file_size_bytes, e.overall_score,
                    e.evaluation_result::text, e.evaluated_at
                FROM cv_evaluations e
                JOIN users u ON u.id = e.user_id
                ORDER BY e.evaluated_at DESC
                LIMIT $1 OFFSET $2
                """,
                limit, offset,
            )
            total = await conn.fetchval("SELECT COUNT(*) FROM cv_evaluations")

    results = []
    for r in rows:
        d = dict(r)
        if isinstance(d.get("evaluation_result"), str):
            try:
                d["evaluation_result"] = json.loads(d["evaluation_result"])
            except Exception:
                pass
        for k in ("id", "user_id"):
            if k in d and d[k]:
                d[k] = str(d[k])
        if d.get("evaluated_at"):
            d["evaluated_at"] = d["evaluated_at"].isoformat()
        results.append(d)

    return total, results


async def admin_delete_cv_evaluation(eval_id: str) -> Optional[str]:
    """Admin xóa CV evaluation. Trả về cloudinary_public_id để xóa file, None nếu không tìm thấy."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "DELETE FROM cv_evaluations WHERE id = $1 RETURNING cloudinary_public_id",
            eval_id,
        )
    return row["cloudinary_public_id"] if row else None
