"""
Community Router – Quản lý bài viết cộng đồng.

Endpoints:
  GET    /api/community/posts              - Danh sách bài viết (phân trang + tìm kiếm)
  POST   /api/community/posts              - Tạo bài viết mới
  GET    /api/community/posts/{post_id}    - Chi tiết bài viết + comments
  DELETE /api/community/posts/{post_id}    - Xóa bài viết (owner hoặc admin)
  POST   /api/community/posts/{post_id}/like    - Toggle like
  POST   /api/community/posts/{post_id}/save    - Toggle save
  GET    /api/community/posts/{post_id}/comments - Lấy comments
  POST   /api/community/posts/{post_id}/comments - Thêm comment
  DELETE /api/community/comments/{comment_id}    - Xóa comment
  GET    /api/community/tags               - Danh sách tags phổ biến
  GET    /api/community/my-saves           - Bài viết đã lưu của user
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.dependencies import get_current_user
from app.core.constants import COMMUNITY_CATEGORIES
from app.schemas.community_schemas import CreatePostBody, CreateCommentBody
from app.controllers import community_controller

router = APIRouter(prefix="/api/community", tags=["Community"])


@router.get("/posts")
async def list_posts(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    tag: Optional[str] = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    """Lấy danh sách bài viết với phân trang và tìm kiếm."""
    return await community_controller.handle_list_posts(
        limit, offset, search, category, tag, current_user
    )


@router.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_post(
    body: CreatePostBody,
    current_user: dict = Depends(get_current_user),
):
    """Tạo bài viết mới."""
    if not body.title.strip():
        raise HTTPException(status_code=400, detail="Tiêu đề không được để trống.")
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Nội dung không được để trống.")
    if body.category not in COMMUNITY_CATEGORIES:
        raise HTTPException(status_code=400, detail="Danh mục không hợp lệ.")

    return await community_controller.handle_create_post(
        current_user["id"], current_user["username"], current_user.get("avatar_url"),
        body.title.strip(), body.content.strip(), body.category, body.tags, body.image_url
    )


@router.get("/posts/{post_id}")
async def get_post_detail(
    post_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Chi tiết bài viết kèm comments."""
    result = await community_controller.handle_get_post_detail(post_id, current_user["id"])
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết.")
    return result


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: str, current_user: dict = Depends(get_current_user)):
    """Xóa bài viết (chỉ owner hoặc admin)."""
    result = await community_controller.handle_delete_post(
        post_id, current_user["id"], current_user.get("role", "user")
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết.")
    if result == "forbidden":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa bài viết này.")


@router.post("/posts/{post_id}/like")
async def toggle_like(post_id: str, current_user: dict = Depends(get_current_user)):
    """Toggle like bài viết."""
    return await community_controller.handle_toggle_like(post_id, current_user["id"])


@router.post("/posts/{post_id}/save")
async def toggle_save(post_id: str, current_user: dict = Depends(get_current_user)):
    """Toggle save/bookmark bài viết."""
    return await community_controller.handle_toggle_save(post_id, current_user["id"])


@router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str, current_user: dict = Depends(get_current_user)):
    """Lấy danh sách comments của bài viết."""
    return await community_controller.handle_get_comments(post_id)


@router.post("/posts/{post_id}/comments", status_code=status.HTTP_201_CREATED)
async def add_comment(
    post_id: str,
    body: CreateCommentBody,
    current_user: dict = Depends(get_current_user),
):
    """Thêm comment vào bài viết."""
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Nội dung comment không được để trống.")

    result = await community_controller.handle_add_comment(
        post_id, current_user["id"], current_user["username"],
        current_user.get("avatar_url"), body.content.strip(),
    )
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết.")
    return result


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(comment_id: str, current_user: dict = Depends(get_current_user)):
    """Xóa comment (chỉ owner hoặc admin)."""
    result = await community_controller.handle_delete_comment(
        comment_id, current_user["id"], current_user.get("role", "user")
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy comment.")
    if result == "forbidden":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa comment này.")


@router.get("/tags")
async def get_popular_tags(
    limit: int = Query(default=20, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    """Lấy danh sách tags phổ biến nhất."""
    return await community_controller.handle_get_popular_tags(limit)


@router.get("/my-saves")
async def get_my_saves(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    """Lấy danh sách bài viết đã lưu của user hiện tại."""
    return await community_controller.handle_get_my_saves(current_user["id"], limit, offset)
