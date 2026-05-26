"""
Community Schemas – Pydantic schemas cho các API cộng đồng.
"""
from typing import List, Optional
from pydantic import BaseModel


class CreatePostBody(BaseModel):
    title: str
    content: str
    category: str = "Thảo luận"   # Kinh nghiệm | Câu hỏi | Tài nguyên | Thảo luận
    tags: List[str] = []
    image_url: Optional[str] = None


class CreateCommentBody(BaseModel):
    content: str
