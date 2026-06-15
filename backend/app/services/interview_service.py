"""
Interview Service â€“ CRUD lá»‹ch sá»­ phá»ng váº¥n vÃ o PostgreSQL.

Äáº£m báº£o Ä‘Ãºng schema:
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
    Táº¡o má»™t phiÃªn phá»ng váº¥n má»›i vá»›i status='in_progress'.
    Tráº£ vá» dict chá»©a id vÃ  cÃ¡c trÆ°á»ng cÆ¡ báº£n.
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
    ÄÃ¡nh dáº¥u phiÃªn phá»ng váº¥n lÃ  'completed', cáº­p nháº­t Ä‘iá»ƒm & nháº­n xÃ©t tá»•ng.
    Chá»‰ cho phÃ©p owner cáº­p nháº­t (kiá»ƒm tra user_id).
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
    ÄÃ¡nh dáº¥u phiÃªn phá»ng váº¥n lÃ  'cancelled' (ngÆ°á»i dÃ¹ng thoÃ¡t giá»¯a chá»«ng).
    Náº¿u chÆ°a cÃ³ cÃ¢u há»i nÃ o Ä‘Æ°á»£c tráº£ lá»i â†’ xoÃ¡ luÃ´n Ä‘á»ƒ trÃ¡nh rÃ¡c.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Äáº¿m sá»‘ cÃ¢u Ä‘Ã£ tráº£ lá»i
        answered_count = await conn.fetchval(
            """
            SELECT COUNT(*) FROM interview_questions
            WHERE interview_id = $1 AND user_answer IS NOT NULL AND user_answer != ''
            """,
            interview_id,
        )
        if answered_count == 0:
            # ChÆ°a tráº£ lá»i cÃ¢u nÃ o â†’ xoÃ¡ khá»i DB Ä‘á»ƒ khÃ´ng rÃ¡c lá»‹ch sá»­
            await conn.execute(
                "DELETE FROM interviews WHERE id = $1 AND user_id = $2",
                interview_id, user_id,
            )
            return False  # False = Ä‘Ã£ xoÃ¡
        else:
            # ÄÃ£ tráº£ lá»i Ã­t nháº¥t 1 cÃ¢u â†’ giá»¯ láº¡i vá»›i tráº¡ng thÃ¡i cancelled
            # TÃ­nh Ä‘iá»ƒm trung bÃ¬nh cá»§a cÃ¡c cÃ¢u Ä‘Ã£ cháº¥m
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
            return True  # True = Ä‘Ã£ cáº­p nháº­t cancelled


async def delete_interview(interview_id: str, user_id: str) -> bool:
    """
    XÃ³a hoÃ n toÃ n má»™t phiÃªn phá»ng váº¥n khá»i DB (chá»‰ owner).
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
    Láº¥y danh sÃ¡ch cÃ¡c phiÃªn phá»ng váº¥n cá»§a user (kÃ¨m sá»‘ cÃ¢u há»i).
    Sáº¯p xáº¿p theo thá»i gian báº¯t Ä‘áº§u má»›i nháº¥t.
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
    Láº¥y chi tiáº¿t 1 phiÃªn phá»ng váº¥n kÃ¨m táº¥t cáº£ cÃ¢u há»i vÃ  Ä‘Ã¡nh giÃ¡.
    Chá»‰ tráº£ vá» náº¿u Ä‘Ãºng owner.
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
    LÆ°u má»™t cÃ¢u há»i vÃ o DB khi báº¯t Ä‘áº§u há»i. Tráº£ vá» id cá»§a record.
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
    Cáº­p nháº­t cÃ¢u tráº£ lá»i + Ä‘Ã¡nh giÃ¡ cho má»™t cÃ¢u há»i sau khi ngÆ°á»i dÃ¹ng tráº£ lá»i.
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
