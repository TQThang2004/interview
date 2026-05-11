"""
Utils Datetime – các hàm tiện ích xử lý datetime.
"""
from datetime import datetime, timezone


def now_utc() -> datetime:
    """Trả về thời điểm hiện tại theo UTC (timezone-aware)."""
    return datetime.now(timezone.utc)


def to_isoformat(dt: datetime | None) -> str | None:
    """Chuyển datetime → chuỗi ISO 8601 hoặc None nếu dt là None."""
    if dt is None:
        return None
    return dt.isoformat()
