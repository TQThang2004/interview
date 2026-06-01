"""
Admin Schemas – Pydantic schemas cho các API quản trị.
"""
from pydantic import BaseModel


class UpdateRoleBody(BaseModel):
    role: str  # 'user' | 'admin'

class CreateUserBody(BaseModel):
    username: str
    email: str
    password: str
    role: str  # 'user' | 'admin'
