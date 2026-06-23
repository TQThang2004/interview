"""
Interview Service – CRUD lịch sử phỏng vấn vào PostgreSQL.

Đảm bảo đúng schema:
  interviews(id, user_id, topic, level, language, status, overall_score, overall_feedback, started_at, completed_at)
  interview_questions(id, interview_id, question_text, user_answer, ai_evaluation, score, question_order, asked_at, answered_at)
"""
from datetime import timezone, datetime
from typing import Optional

from app.database.connection import get_pool


# ---------------------------------------------------------------------------
# Interviews CRUD
# ---------------------------------------------------------------------------

async def create_interview(user_id: str, topic: str, level: str, language: str) -> dict:
    """
    Tạo một phiên phỏng vấn mới với status='in_progress'.
    Trả về dict chứa id và các trường cơ bản.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO interviews (user_id, topic, level, language, status)
            VALUES ($1, $2, $3, $4, 'in_progress')
            RETURNING id::text, user_id::text, topic, level, language, status,
                      started_at
            """,
            user_id, topic, level, language,
        )
    return dict(row)


async def complete_interview(
    interview_id: str,
    user_id: str,
    overall_score: Optional[float],
    overall_feedback: Optional[str],
) -> Optional[dict]:
    """
    Đánh dấu phiên phỏng vấn là 'completed', cập nhật điểm & nhận xét tổng.
    Chỉ cho phép owner cập nhật (kiểm tra user_id).
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE interviews
            SET status          = 'completed',
                overall_score   = $3,
                overall_feedback = $4,
                completed_at    = NOW()
            WHERE id = $1 AND user_id = $2
            RETURNING id::text, topic, level, overall_score, status, completed_at
            """,
            interview_id, user_id, overall_score, overall_feedback,
        )
    return dict(row) if row else None


async def abandon_interview(interview_id: str, user_id: str) -> bool:
    """
    Đánh dấu phiên phỏng vấn là 'cancelled' (người dùng thoát giữa chừng).
    Nếu chưa có câu hỏi nào được trả lời → xoá luôn để tránh rác.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Đếm số câu đã trả lời
        answered_count = await conn.fetchval(
            """
            SELECT COUNT(*) FROM interview_questions
            WHERE interview_id = $1 AND user_answer IS NOT NULL AND user_answer != ''
            """,
            interview_id,
        )
        if answered_count == 0:
            # Chưa trả lời câu nào → xoá khỏi DB để không rác lịch sử
            await conn.execute(
                "DELETE FROM interviews WHERE id = $1 AND user_id = $2",
                interview_id, user_id,
            )
            return False  # False = đã xoá
        else:
            # Đã trả lời ít nhất 1 câu → giữ lại với trạng thái cancelled
            # Tính điểm trung bình của các câu đã chấm
            avg_score = await conn.fetchval(
                """
                SELECT AVG(score) FROM interview_questions
                WHERE interview_id = $1 AND score IS NOT NULL
                """,
                interview_id,
            )
            await conn.execute(
                """
                UPDATE interviews
                SET status        = 'cancelled',
                    overall_score = $3,
                    completed_at  = NOW()
                WHERE id = $1 AND user_id = $2
                """,
                interview_id, user_id,
                float(avg_score) if avg_score is not None else None,
            )
            return True  # True = đã cập nhật cancelled


async def delete_interview(interview_id: str, user_id: str) -> bool:
    """
    Xóa hoàn toàn một phiên phỏng vấn khỏi DB (chỉ owner).
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM interviews WHERE id = $1 AND user_id = $2",
            interview_id, user_id
        )
    return result != "DELETE 0"


async def get_user_interviews(user_id: str, limit: int = 20, offset: int = 0) -> list[dict]:
    """
    Lấy danh sách các phiên phỏng vấn của user (kèm số câu hỏi).
    Sắp xếp theo thời gian bắt đầu mới nhất.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                i.id::text,
                i.topic,
                i.level,
                i.language,
                i.status,
                i.overall_score,
                i.overall_feedback,
                i.started_at,
                i.completed_at,
                COUNT(iq.id) AS total_questions,
                COUNT(iq.id) FILTER (WHERE iq.user_answer IS NOT NULL AND iq.user_answer != '') AS answered_questions
            FROM interviews i
            LEFT JOIN interview_questions iq ON iq.interview_id = i.id
            WHERE i.user_id = $1
            GROUP BY i.id, i.topic, i.level, i.language, i.status, i.overall_score, i.overall_feedback, i.started_at, i.completed_at
            ORDER BY i.started_at DESC
            LIMIT $2 OFFSET $3
            """,
            user_id, limit, offset,
        )
    return [dict(r) for r in rows]


async def get_interview_detail(interview_id: str, user_id: str) -> Optional[dict]:
    """
    Lấy chi tiết 1 phiên phỏng vấn kèm tất cả câu hỏi và đánh giá.
    Chỉ trả về nếu đúng owner.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        interview = await conn.fetchrow(
            """
            SELECT id::text, topic, level, language, status, overall_score, overall_feedback,
                   started_at, completed_at
            FROM interviews
            WHERE id = $1 AND user_id = $2
            """,
            interview_id, user_id,
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
    result = dict(interview)
    result["questions"] = [dict(q) for q in questions]
    return result


# ---------------------------------------------------------------------------
# Interview Questions CRUD
# ---------------------------------------------------------------------------

async def save_question(
    interview_id: str,
    user_id: str,
    question_text: str,
    question_order: int,
) -> str | None:
    """
    Lưu một câu hỏi vào DB khi bắt đầu hỏi. Trả về id của record.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        owner = await conn.fetchval(
            "SELECT 1 FROM interviews WHERE id = $1 AND user_id = $2",
            interview_id, user_id,
        )
        if not owner:
            return None
        row = await conn.fetchrow(
            """
            INSERT INTO interview_questions (interview_id, question_text, question_order)
            VALUES ($1, $2, $3)
            RETURNING id::text
            """,
            interview_id, question_text, question_order,
        )
    return row["id"]


async def update_question_answer(
    interview_id: str,
    question_db_id: str,
    user_id: str,
    user_answer: str,
    ai_evaluation: str,
    score: float,
) -> bool:
    """
    Cập nhật câu trả lời + đánh giá cho một câu hỏi sau khi người dùng trả lời.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            """
            UPDATE interview_questions
            SET user_answer  = $2,
                ai_evaluation = $3,
                score        = $4,
                answered_at  = NOW()
            WHERE id = $1
              AND interview_id = $5
              AND EXISTS (
                  SELECT 1 FROM interviews i
                  WHERE i.id = interview_questions.interview_id
                    AND i.user_id = $6
              )
            """,
            question_db_id, user_answer, ai_evaluation, score, interview_id, user_id,
        )
    return result == "UPDATE 1"
