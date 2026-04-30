"""
Admin dependency: chỉ cho phép user có role='admin' truy cập.
"""
from fastapi import Depends, HTTPException, status
from app.auth.dependencies import get_current_user


async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency: yêu cầu user hiện tại phải có role='admin'.
    Nếu không → 403 Forbidden.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập trang này.",
        )
    return current_user
