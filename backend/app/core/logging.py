"""
Core Logging – cấu hình logging system cho toàn bộ ứng dụng.

Sử dụng Python logging module với format chuẩn.
"""
import logging
import sys

# Format chuẩn cho log
LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(level: int = logging.INFO) -> None:
    """
    Cấu hình logging toàn cục cho ứng dụng.
    Nên gọi một lần duy nhất khi khởi động app.
    """
    # Fix encoding UTF-8 trên Windows
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except Exception:
            pass

    logging.basicConfig(
        level=level,
        format=LOG_FORMAT,
        datefmt=DATE_FORMAT,
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )

    # Giảm noise từ thư viện ngoài
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("google_genai").setLevel(logging.WARNING)
    logging.getLogger("google_genai.models").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Lấy logger đã được cấu hình cho module cụ thể."""
    return logging.getLogger(name)
