"""
Custom Exception Classes – định nghĩa các exception riêng của ứng dụng.

Sử dụng thay vì raise ValueError hoặc HTTPException trực tiếp trong service layer,
giúp tách biệt business logic khỏi HTTP concerns.
"""


class AppException(Exception):
    """Base exception cho toàn bộ ứng dụng."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class AuthException(AppException):
    """Exception liên quan đến xác thực / phân quyền."""
    def __init__(self, message: str = "Không có quyền truy cập.", status_code: int = 401):
        super().__init__(message, status_code)


class NotFoundException(AppException):
    """Exception khi không tìm thấy tài nguyên."""
    def __init__(self, message: str = "Không tìm thấy tài nguyên."):
        super().__init__(message, status_code=404)


class ValidationException(AppException):
    """Exception khi dữ liệu đầu vào không hợp lệ."""
    def __init__(self, message: str):
        super().__init__(message, status_code=422)


class ConflictException(AppException):
    """Exception khi có xung đột dữ liệu (vd: email đã tồn tại)."""
    def __init__(self, message: str):
        super().__init__(message, status_code=409)


class DatabaseException(AppException):
    """Exception khi có lỗi từ database."""
    def __init__(self, message: str = "Lỗi cơ sở dữ liệu."):
        super().__init__(message, status_code=503)
