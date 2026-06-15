"""
Utils File – xử lý upload/download file.

Bao gồm: parse PDF, validate file type.
"""
import io
import pypdf

from app.core.logging import get_logger

logger = get_logger(__name__)


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Trích xuất toàn bộ văn bản từ PDF dạng bytes."""
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)
        return "\n".join(pages_text).strip()
    except Exception as e:
        logger.warning("Failed to parse PDF bytes: %s", e)
        return ""


def is_pdf_file(filename: str, content_type: str) -> bool:
    """Kiểm tra file có phải PDF dựa trên MIME type và đuôi file."""
    is_pdf_mime = content_type in ("application/pdf", "application/x-pdf")
    is_pdf_ext  = (filename or "").lower().endswith(".pdf")
    return is_pdf_mime or is_pdf_ext
