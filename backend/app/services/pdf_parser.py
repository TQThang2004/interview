"""
Service phân tích PDF: trích xuất văn bản thuần từ file PDF bytes.
"""
import io
import pypdf


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
        print(f"[PdfParser] Error parsing PDF: {e}")
        return ""
