"""
Evaluate Service – chấm điểm và nhận xét câu trả lời của ứng viên.

Tách ra khỏi rag_service.py để:
- Mỗi service có 1 trách nhiệm rõ ràng (SRP).
- Dễ test độc lập.
- Dễ thay thế model/prompt sau này.
"""
from __future__ import annotations

from app.config import GOOGLE_API_KEY_EVALUATE
from app.services.llm_client import GeminiClient


# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------

class EvaluationResult:
    def __init__(
        self,
        score: float,
        score_str: str,
        strengths: str,
        weaknesses: str,
        suggestions: str,
    ):
        self.score = score
        self.score_str = score_str
        self.strengths = strengths
        self.weaknesses = weaknesses
        self.suggestions = suggestions

    def to_dict(self) -> dict:
        return {
            "score": self.score,
            "score_str": self.score_str,
            "strengths": self.strengths,
            "weaknesses": self.weaknesses,
            "suggestions": self.suggestions,
        }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def evaluate_answer(
    question: str,
    user_answer: str,
    reference: str,
    level: str,
    language: str = "vi",
) -> EvaluationResult:
    """
    Dùng LLM chấm điểm và nhận xét câu trả lời ứng viên.

    Args:
        question:    Câu hỏi đã được đặt ra.
        user_answer: Câu trả lời của ứng viên (có thể rỗng nếu bỏ qua).
        reference:   Câu trả lời tham khảo từ knowledge base.
        level:       Cấp độ phỏng vấn để điều chỉnh tiêu chuẩn chấm.
        language:    "vi" hoặc "en".

    Returns:
        EvaluationResult với score, strengths, weaknesses, suggestions.
    """
    client = GeminiClient(api_key=GOOGLE_API_KEY_EVALUATE)

    vinglish_note = ""
    if language == "vi":
        vinglish_note = (
            "CHU Y DAC BIET TRAM TRONG: Ung vien dang tra loi bang giong noi va dung Tieng Viet pha "
            "Tieng Anh IT (Vinglish). Google speech to text co the viet sai chinh ta cac tu tieng anh "
            "(vd: ri ac, not di et, da ta day, pho ram guoc, code, push). "
            "BAN TUYET DOI KHONG DUOC tru diem loi danh van/ngon ngu neu tu do nghe hop ly theo dung ngu canh ky thuat."
        )

    lang_name = "Tieng Viet" if language == "vi" else "English"
    prompt = (
        f'Ban la nguoi phong van ky thuat cho vi tri "{level}".\n'
        f"CAU HOI: {question}\n"
        f"DAP AN THAM KHAO: {reference}\n"
        f"CAU TRA LOI CUA UNG VIEN: {user_answer if user_answer.strip() else '(Bo qua)'}\n\n"
        f"{vinglish_note}\n\n"
        f'Nhan xet bang ngon ngu "{lang_name}" theo cap do "{level}". '
        "Tuy nhien, BAT BUOC cac tieu de cua form tra ve phai GIU NGUYEN DINH DANG y chang nhu sau "
        "(KHONG DUNG ky tu markdown nhu in dam vao tieu de):\n"
        "DIEM: [X/10]\n"
        "DIEM MANH: [nhan xet diem manh]\n"
        "DIEM YEU: [nhan xet diem yeu]\n"
        "GOI Y BO SUNG: [goi y ngan gon bo sung kien thuc]"
    ).strip()

    raw = client.generate(prompt)
    return _parse_evaluation(raw)


def _parse_evaluation(raw: str) -> EvaluationResult:
    """Parse output text LLM thành EvaluationResult."""
    score = 0.0
    score_str = "0/10"
    strengths = ""
    weaknesses = ""
    suggestions = ""

    for line in raw.split("\n"):
        line = line.strip().replace("*", "")
        if line.startswith("DIEM:") or line.startswith("ĐIỂM:"):
            score_str = line.split(":", 1)[1].strip()
            try:
                score = float(score_str.split("/")[0])
            except ValueError:
                pass
        elif line.startswith("DIEM MANH:") or line.startswith("ĐIỂM MẠNH:"):
            strengths = line.split(":", 1)[1].strip()
        elif line.startswith("DIEM YEU:") or line.startswith("ĐIỂM YẾU:"):
            weaknesses = line.split(":", 1)[1].strip()
        elif line.startswith("GOI Y BO SUNG:") or line.startswith("GỢI Ý BỔ SUNG:"):
            suggestions = line.split(":", 1)[1].strip()

    # Fallback nếu parse thất bại
    if not strengths and not weaknesses:
        suggestions = "Đã có lỗi phân tích từ AI. Vui lòng thử lại."
        strengths = raw[:200]

    return EvaluationResult(
        score=score,
        score_str=score_str,
        strengths=strengths,
        weaknesses=weaknesses,
        suggestions=suggestions,
    )
