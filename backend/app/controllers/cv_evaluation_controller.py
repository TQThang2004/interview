"""
CV Evaluation Controller – xử lý upload Cloudinary và CRUD lịch sử đánh giá CV.

Luồng lưu:
  1. Nhận file PDF + kết quả đánh giá từ frontend
  2. Kiểm tra giới hạn 2 bản/user (qua service)
  3. Upload PDF lên Cloudinary với resource_type="image" (theo yêu cầu)
  4. Lưu record vào PostgreSQL
  5. Trả về response kèm cloudinary_url để frontend embed

Luồng xóa:
  1. Xóa record DB (service trả về cloudinary_public_id)
  2. Gọi cloudinary.uploader.destroy(public_id, resource_type="image") để xóa file
"""
from __future__ import annotations

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException

from app.core.logging import get_logger
from app.core.config import (
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
)
from app.services import cv_evaluation_service
from app.services.cv_evaluation_service import MAX_CV_EVALUATIONS

logger = get_logger(__name__)

# Khởi tạo Cloudinary một lần
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)


# ---------------------------------------------------------------------------
# Handlers
# ---------------------------------------------------------------------------

async def handle_save_cv_evaluation(
    user_id: str,
    cv_file: UploadFile,
    evaluation_result: dict,
    cv_text: str,
) -> dict:
    """
    Upload CV lên Cloudinary rồi lưu kết quả đánh giá vào DB.

    Raises:
        HTTPException 409: Khi đã đạt giới hạn 2 bản.
        HTTPException 500: Khi upload Cloudinary thất bại.
    """
    # 1. Kiểm tra giới hạn trước để tránh upload dư thừa
    count = await cv_evaluation_service.count_user_evaluations(user_id)
    if count >= MAX_CV_EVALUATIONS:
        raise HTTPException(
            status_code=409,
            detail=f"Đã đạt giới hạn {MAX_CV_EVALUATIONS} bản đánh giá. Vui lòng xóa bản cũ trước.",
        )

    # 2. Đọc bytes file
    cv_bytes = await cv_file.read()
    original_filename = cv_file.filename or "cv.pdf"
    file_size = len(cv_bytes)

    # 3. Upload lên Cloudinary với resource_type="image"
    try:
        upload_result = cloudinary.uploader.upload(
            cv_bytes,
            folder="cv_evaluations",
            resource_type="image",
            format="pdf",
            use_filename=True,
            unique_filename=True,
        )
        cloudinary_url = upload_result.get("secure_url", "")
        cloudinary_public_id = upload_result.get("public_id", "")
    except Exception as exc:
        logger.exception("Failed to upload CV to Cloudinary")
        raise HTTPException(status_code=500, detail=f"Không thể upload CV lên Cloudinary: {exc}")

    # 4. Lấy overall_score từ evaluation_result
    overall_score = None
    try:
        overall_score = float(evaluation_result.get("overall", 0))
    except (TypeError, ValueError):
        pass

    # 5. Lưu vào DB
    try:
        record = await cv_evaluation_service.save_cv_evaluation(
            user_id=user_id,
            original_filename=original_filename,
            cloudinary_url=cloudinary_url,
            cloudinary_public_id=cloudinary_public_id,
            file_size_bytes=file_size,
            cv_text=cv_text,
            overall_score=overall_score,
            evaluation_result=evaluation_result,
        )
    except ValueError as e:
        # Race condition: giới hạn bị vượt giữa lúc check và insert
        raise HTTPException(status_code=409, detail=str(e))

    return {
        "status": "success",
        "record": record,
    }


async def handle_list_cv_evaluations(
    user_id: str,
    limit: int = 10,
    offset: int = 0,
) -> dict:
    """Lấy danh sách bản đánh giá CV của user."""
    items = await cv_evaluation_service.get_user_cv_evaluations(user_id, limit, offset)
    count = await cv_evaluation_service.count_user_evaluations(user_id)
    return {
        "status": "success",
        "evaluations": items,
        "count": count,
        "limit": MAX_CV_EVALUATIONS,
    }


async def handle_get_cv_evaluation(
    evaluation_id: str,
    user_id: str,
) -> dict:
    """Chi tiết 1 bản đánh giá (kèm cv_text)."""
    detail = await cv_evaluation_service.get_cv_evaluation_detail(evaluation_id, user_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản đánh giá.")
    return {"status": "success", "evaluation": detail}


async def handle_delete_cv_evaluation(
    evaluation_id: str,
    user_id: str,
) -> dict:
    """Xóa bản đánh giá khỏi DB và Cloudinary."""
    public_id = await cv_evaluation_service.delete_cv_evaluation(evaluation_id, user_id)
    if public_id is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản đánh giá hoặc không có quyền xóa.")

    # Xóa file trên Cloudinary (resource_type="image" khớp với lúc upload)
    try:
        cloudinary.uploader.destroy(public_id, resource_type="image")
        logger.info("Deleted Cloudinary CV asset.")
    except Exception as exc:
        # Log lỗi nhưng không fail request – record DB đã xóa rồi
        logger.warning("Failed to delete Cloudinary CV asset: %s", exc)

    return {"status": "success", "deleted_id": evaluation_id}


async def handle_count_cv_evaluations(user_id: str) -> dict:
    """Trả về số bản đánh giá hiện có và giới hạn."""
    count = await cv_evaluation_service.count_user_evaluations(user_id)
    return {
        "status": "success",
        "count": count,
        "limit": MAX_CV_EVALUATIONS,
        "can_save": count < MAX_CV_EVALUATIONS,
    }
