from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
import cloudinary
import cloudinary.uploader
import os
import uuid
from app.core.dependencies import get_current_user
from app.core.config import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
from app.core.constants import MAX_IMAGE_UPLOAD_BYTES
from app.core.logging import get_logger

router = APIRouter(prefix="/api/upload", tags=["Upload"])
logger = get_logger(__name__)

# Cấu hình Cloudinary
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

@router.post("")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Uploads an image to Cloudinary and returns its URL."""
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file ảnh (JPEG, PNG, WEBP, GIF).")
    if file.size is not None and file.size > MAX_IMAGE_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Ảnh vượt quá giới hạn 5MB.")

    try:
        # Upload thẳng file-like object lên Cloudinary
        result = cloudinary.uploader.upload(file.file)
        url = result.get("secure_url")
    except Exception as e:
        logger.exception("Failed to upload image to Cloudinary")
        raise HTTPException(status_code=500, detail="Không thể lưu file ảnh lên Cloudinary.")

    return {"status": "success", "url": url}
