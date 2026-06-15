"""
CV Evaluation Controller â€“ xá»­ lÃ½ upload Cloudinary vÃ  CRUD lá»‹ch sá»­ Ä‘Ã¡nh giÃ¡ CV.

Luá»“ng lÆ°u:
  1. Nháº­n file PDF + káº¿t quáº£ Ä‘Ã¡nh giÃ¡ tá»« frontend
  2. Kiá»ƒm tra giá»›i háº¡n 2 báº£n/user (qua service)
  3. Upload PDF lÃªn Cloudinary vá»›i resource_type="image" (theo yÃªu cáº§u)
  4. LÆ°u record vÃ o PostgreSQL
  5. Tráº£ vá» response kÃ¨m cloudinary_url Ä‘á»ƒ frontend embed

Luá»“ng xÃ³a:
  1. XÃ³a record DB (service tráº£ vá» cloudinary_public_id)
  2. Gá»i cloudinary.uploader.destroy(public_id, resource_type="image") Ä‘á»ƒ xÃ³a file
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

# Khá»Ÿi táº¡o Cloudinary má»™t láº§n
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
    Upload CV lÃªn Cloudinary rá»“i lÆ°u káº¿t quáº£ Ä‘Ã¡nh giÃ¡ vÃ o DB.

    Raises:
        HTTPException 409: Khi Ä‘Ã£ Ä‘áº¡t giá»›i háº¡n 2 báº£n.
        HTTPException 500: Khi upload Cloudinary tháº¥t báº¡i.
    """
    # 1. Kiá»ƒm tra giá»›i háº¡n trÆ°á»›c Ä‘á»ƒ trÃ¡nh upload dÆ° thá»«a
    count = await cv_evaluation_service.count_user_evaluations(user_id)
    if count >= MAX_CV_EVALUATIONS:
        raise HTTPException(
            status_code=409,
            detail=f"ÄÃ£ Ä‘áº¡t giá»›i háº¡n {MAX_CV_EVALUATIONS} báº£n Ä‘Ã¡nh giÃ¡. Vui lÃ²ng xÃ³a báº£n cÅ© trÆ°á»›c.",
        )

    # 2. Äá»c bytes file
    cv_bytes = await cv_file.read()
    original_filename = cv_file.filename or "cv.pdf"
    file_size = len(cv_bytes)

    # 3. Upload lÃªn Cloudinary vá»›i resource_type="image"
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
        raise HTTPException(status_code=500, detail=f"KhÃ´ng thá»ƒ upload CV lÃªn Cloudinary: {exc}")

    # 4. Láº¥y overall_score tá»« evaluation_result
    overall_score = None
    try:
        overall_score = float(evaluation_result.get("overall", 0))
    except (TypeError, ValueError):
        pass

    # 5. LÆ°u vÃ o DB
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
        # Race condition: giá»›i háº¡n bá»‹ vÆ°á»£t giá»¯a lÃºc check vÃ  insert
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
    """Láº¥y danh sÃ¡ch báº£n Ä‘Ã¡nh giÃ¡ CV cá»§a user."""
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
    """Chi tiáº¿t 1 báº£n Ä‘Ã¡nh giÃ¡ (kÃ¨m cv_text)."""
    detail = await cv_evaluation_service.get_cv_evaluation_detail(evaluation_id, user_id)
    if not detail:
        raise HTTPException(status_code=404, detail="KhÃ´ng tÃ¬m tháº¥y báº£n Ä‘Ã¡nh giÃ¡.")
    return {"status": "success", "evaluation": detail}


async def handle_delete_cv_evaluation(
    evaluation_id: str,
    user_id: str,
) -> dict:
    """XÃ³a báº£n Ä‘Ã¡nh giÃ¡ khá»i DB vÃ  Cloudinary."""
    public_id = await cv_evaluation_service.delete_cv_evaluation(evaluation_id, user_id)
    if public_id is None:
        raise HTTPException(status_code=404, detail="KhÃ´ng tÃ¬m tháº¥y báº£n Ä‘Ã¡nh giÃ¡ hoáº·c khÃ´ng cÃ³ quyá»n xÃ³a.")

    # XÃ³a file trÃªn Cloudinary (resource_type="image" khá»›p vá»›i lÃºc upload)
    try:
        cloudinary.uploader.destroy(public_id, resource_type="image")
        logger.info("Deleted Cloudinary CV asset.")
    except Exception as exc:
        # Log lá»—i nhÆ°ng khÃ´ng fail request â€“ record DB Ä‘Ã£ xÃ³a rá»“i
        logger.warning("Failed to delete Cloudinary CV asset: %s", exc)

    return {"status": "success", "deleted_id": evaluation_id}


async def handle_count_cv_evaluations(user_id: str) -> dict:
    """Tráº£ vá» sá»‘ báº£n Ä‘Ã¡nh giÃ¡ hiá»‡n cÃ³ vÃ  giá»›i háº¡n."""
    count = await cv_evaluation_service.count_user_evaluations(user_id)
    return {
        "status": "success",
        "count": count,
        "limit": MAX_CV_EVALUATIONS,
        "can_save": count < MAX_CV_EVALUATIONS,
    }
