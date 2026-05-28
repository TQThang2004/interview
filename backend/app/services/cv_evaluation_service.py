"""
CV Evaluation Service – CRUD lịch sử đánh giá CV vào PostgreSQL.

Quy tắc nghiệp vụ:
  - Mỗi user tối đa 2 bản đánh giá CV.
  - File CV được lưu trên Cloudinary (xem cloudinary_public_id để xóa sau).
  - Raise ValueError nếu vượt giới hạn khi gọi save_cv_evaluation.
"""
from __future__ import annotations

import json
from typing import Optional

from app.database.connection import get_pool

MAX_CV_EVALUATIONS = 2


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _row_to_dict(row) -> dict:
    """Chuyển asyncpg Record sang dict, serialize UUID và datetime."""
    d = dict(row)
    # evaluation_result là JSONB – asyncpg trả về str hoặc dict tuỳ phiên bản
    if isinstance(d.get("evaluation_result"), str):
        try:
            d["evaluation_result"] = json.loads(d["evaluation_result"])
        except Exception:
            pass
    # Chuyển UUID và datetime thành string để JSON-safe
    for key in ("id", "user_id"):
        if key in d and d[key] is not None:
            d[key] = str(d[key])
    for key in ("evaluated_at",):
        if key in d and d[key] is not None:
            d[key] = d[key].isoformat()
    return d


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def count_user_evaluations(user_id: str) -> int:
    """Đếm số bản đánh giá CV hiện có của user."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        count = await conn.fetchval(
            "SELECT COUNT(*) FROM cv_evaluations WHERE user_id = $1",
            user_id,
        )
    return int(count or 0)


async def save_cv_evaluation(
    user_id: str,
    original_filename: str,
    cloudinary_url: str,
    cloudinary_public_id: str,
    file_size_bytes: Optional[int],
    cv_text: str,
    overall_score: Optional[float],
    evaluation_result: dict,
) -> dict:
    """
    Lưu bản đánh giá CV mới vào DB.

    Raises:
        ValueError: Khi user đã có >= MAX_CV_EVALUATIONS bản.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Kiểm tra giới hạn trước khi INSERT
        count = await conn.fetchval(
            "SELECT COUNT(*) FROM cv_evaluations WHERE user_id = $1",
            user_id,
        )
        if int(count or 0) >= MAX_CV_EVALUATIONS:
            raise ValueError(
                f"Đã đạt giới hạn {MAX_CV_EVALUATIONS} bản đánh giá. "
                "Vui lòng xóa bản cũ trước khi lưu mới."
            )

        row = await conn.fetchrow(
            """
            INSERT INTO cv_evaluations (
                user_id, original_filename, cloudinary_url, cloudinary_public_id,
                file_size_bytes, cv_text, overall_score, evaluation_result
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
            RETURNING
                id::text, user_id::text, original_filename,
                cloudinary_url, cloudinary_public_id,
                file_size_bytes, overall_score,
                evaluation_result::text,
                evaluated_at
            """,
            user_id,
            original_filename,
            cloudinary_url,
            cloudinary_public_id,
            file_size_bytes,
            cv_text,
            overall_score,
            json.dumps(evaluation_result),
        )
    return _row_to_dict(row)


async def get_user_cv_evaluations(
    user_id: str,
    limit: int = 10,
    offset: int = 0,
) -> list[dict]:
    """Lấy danh sách bản đánh giá CV (mới nhất trước). Không trả cv_text để giảm payload."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                id::text,
                user_id::text,
                original_filename,
                cloudinary_url,
                cloudinary_public_id,
                file_size_bytes,
                overall_score,
                evaluation_result::text,
                evaluated_at
            FROM cv_evaluations
            WHERE user_id = $1
            ORDER BY evaluated_at DESC
            LIMIT $2 OFFSET $3
            """,
            user_id, limit, offset,
        )
    return [_row_to_dict(r) for r in rows]


async def get_cv_evaluation_detail(
    evaluation_id: str,
    user_id: str,
) -> Optional[dict]:
    """
    Lấy chi tiết 1 bản đánh giá kèm cv_text.
    Chỉ trả về nếu đúng owner.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT
                id::text,
                user_id::text,
                original_filename,
                cloudinary_url,
                cloudinary_public_id,
                file_size_bytes,
                cv_text,
                overall_score,
                evaluation_result::text,
                evaluated_at
            FROM cv_evaluations
            WHERE id = $1 AND user_id = $2
            """,
            evaluation_id, user_id,
        )
    return _row_to_dict(row) if row else None


async def delete_cv_evaluation(
    evaluation_id: str,
    user_id: str,
) -> Optional[str]:
    """
    Xóa bản đánh giá khỏi DB.

    Returns:
        cloudinary_public_id nếu xóa thành công, None nếu không tìm thấy/không quyền.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            DELETE FROM cv_evaluations
            WHERE id = $1 AND user_id = $2
            RETURNING cloudinary_public_id
            """,
            evaluation_id, user_id,
        )
    return row["cloudinary_public_id"] if row else None
