"""
Admin Schemas – Pydantic schemas cho các API quản trị.
"""
from pydantic import BaseModel


class UpdateRoleBody(BaseModel):
    role: str  # 'user' | 'admin'
