"""
Core Constants – hằng số và biến toàn cục của ứng dụng.

Tách biệt với config.py (config đọc từ ENV, constants là giá trị cố định).
"""

# ---------------------------------------------------------------------------
# Interview
# ---------------------------------------------------------------------------

# Trạng thái phiên phỏng vấn
INTERVIEW_STATUS_IN_PROGRESS = "in_progress"
INTERVIEW_STATUS_COMPLETED   = "completed"
INTERVIEW_STATUS_CANCELLED   = "cancelled"

VALID_INTERVIEW_STATUSES = (
    INTERVIEW_STATUS_IN_PROGRESS,
    INTERVIEW_STATUS_COMPLETED,
    INTERVIEW_STATUS_CANCELLED,
)

# Cấp độ phỏng vấn
INTERVIEW_LEVELS = ("Junior", "Mid", "Senior")

# Ngôn ngữ hỗ trợ
SUPPORTED_LANGUAGES = ("vi", "en")

# ---------------------------------------------------------------------------
# Community
# ---------------------------------------------------------------------------

# Danh mục bài viết cộng đồng
COMMUNITY_CATEGORIES = ("Kinh nghiệm", "Câu hỏi", "Tài nguyên", "Thảo luận")

# ---------------------------------------------------------------------------
# User Roles
# ---------------------------------------------------------------------------

ROLE_USER  = "user"
ROLE_ADMIN = "admin"

VALID_ROLES = (ROLE_USER, ROLE_ADMIN)

# ---------------------------------------------------------------------------
# Media / File
# ---------------------------------------------------------------------------

ALLOWED_CV_MIME_TYPES = ("application/pdf", "application/x-pdf")
ALLOWED_CV_EXTENSIONS = (".pdf",)
