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

    # Thang diem uu ai: khuyen khich nguoi hoc, cong nhan no luc
    scoring_guide = (
        "HUONG DAN CHAM DIEM (THANG UU AI - KHUYEN KHICH NGUOI HOC):\n"
        "- Neu tra loi co noi dung lien quan, du khong day du: tu 5.0 tro len.\n"
        "- Neu tra loi dung huong, du chua sau: tu 6.0 den 7.0.\n"
        "- Neu tra loi day du, co vi du thuc te: tu 7.0 den 8.5.\n"
        "- Neu tra loi xuat sac, sau sac, chinh xac hoan toan: tu 8.5 den 10.0.\n"
        "- Chi cho diem duoi 5.0 khi tra loi hoan toan sai hoac bo trong.\n"
        "- CONG DIEM THIEN CHI: Neu ung vien the hien su co gang, tu duy dung, "
        "hay kinh nghiem thuc te (du thieu chi tiet ky thuat): cong them 0.5 den 1.0 diem.\n"
        "- KHONG BAT BUOC phai dung het chi tiet trong dap an tham khao de duoc diem cao.\n"
        "- MUC TIEU: Cho ung vien cam giac duoc cong nhan no luc, "
        "khong de ho nan long khi luyen tap.\n"
    )

    prompt = (
        f'Ban la nguoi phong van ky thuat than thien cho vi tri "{level}".\n'
        f"CAU HOI: {question}\n"
        f"DAP AN THAM KHAO: {reference}\n"
        f"CAU TRA LOI CUA UNG VIEN: {user_answer if user_answer.strip() else '(Bo qua)'}\n\n"
        f"{vinglish_note}\n\n"
        f"{scoring_guide}\n"
        f'Nhan xet bang ngon ngu "{lang_name}" theo cap do "{level}". '
        "Tuy nhien, BAT BUOC cac tieu de cua form tra ve phai GIU NGUYEN DINH DANG y chang nhu sau "
        "(KHONG DUNG ky tu markdown nhu in dam vao tieu de):\n"
        "DIEM: [X/10]\n"
        "DIEM MANH: [nhan xet diem manh - cu the, chi tiet, mang tinh dong vien]\n"
        "DIEM YEU: [nhan xet diem yeu - nhe nhang, xay dung, tap trung vao noi dung thieu]\n"
        "GOI Y BO SUNG: [goi y cu the bo sung kien thuc, kem vi du hoac tai lieu neu can]"
    ).strip()

    raw = client.generate(prompt)
    return _parse_evaluation(raw)


def _parse_evaluation(raw: str) -> EvaluationResult:
    """Parse output text LLM thanh EvaluationResult – luu day du noi dung multi-line."""
    score = 0.0
    score_str = "0/10"
    strengths = ""
    weaknesses = ""
    suggestions = ""

    lines = raw.split("\n")
    current_field = None
    buffer: list[str] = []

    def flush_buffer() -> str:
        return " ".join(buffer).strip()

    for line in lines:
        stripped = line.strip().replace("*", "")

        # QUAN TRONG: phai check DIEM MANH / DIEM YEU / GOI Y TRUOC
        # vi "DIEM MANH:".startswith("DIEM:") == True → parse sai diem
        if (
            stripped.startswith("DIEM MANH:")
            or stripped.startswith("DIEM MANH :")
            or stripped.startswith("\u0110I\u1ec2M M\u1ea0NH:")
        ):
            if current_field == "strengths":
                strengths = flush_buffer()
            elif current_field == "weaknesses":
                weaknesses = flush_buffer()
            elif current_field == "suggestions":
                suggestions = flush_buffer()
            buffer = [stripped.split(":", 1)[1].strip()]
            current_field = "strengths"

        elif (
            stripped.startswith("DIEM YEU:")
            or stripped.startswith("DIEM YEU :")
            or stripped.startswith("\u0110I\u1ec2M Y\u1ebeU:")
        ):
            if current_field == "strengths":
                strengths = flush_buffer()
            elif current_field == "weaknesses":
                weaknesses = flush_buffer()
            elif current_field == "suggestions":
                suggestions = flush_buffer()
            buffer = [stripped.split(":", 1)[1].strip()]
            current_field = "weaknesses"

        elif (
            stripped.startswith("GOI Y BO SUNG:")
            or stripped.startswith("GOI Y:")
            or stripped.startswith("G\u1ee2I \u00dd B\u1ed4 SUNG:")
            or stripped.startswith("G\u1ee2I \u00dd:")
        ):
            if current_field == "strengths":
                strengths = flush_buffer()
            elif current_field == "weaknesses":
                weaknesses = flush_buffer()
            elif current_field == "suggestions":
                suggestions = flush_buffer()
            buffer = [stripped.split(":", 1)[1].strip()]
            current_field = "suggestions"

        elif (
            stripped.startswith("DIEM:")
            or stripped.startswith("DIEM :")
            or stripped.startswith("\u0110I\u1ec2M:")
            or stripped.startswith("\u0110I\u1ec2M :")
        ):
            if current_field == "strengths":
                strengths = flush_buffer()
            elif current_field == "weaknesses":
                weaknesses = flush_buffer()
            elif current_field == "suggestions":
                suggestions = flush_buffer()
            buffer = []
            current_field = None

            val = stripped.split(":", 1)[1].strip()
            score_str = val
            try:
                score = float(val.split("/")[0].strip())
            except ValueError:
                pass

        elif current_field and stripped:
            buffer.append(stripped)

    # Flush cuoi
    if current_field == "strengths":
        strengths = flush_buffer()
    elif current_field == "weaknesses":
        weaknesses = flush_buffer()
    elif current_field == "suggestions":
        suggestions = flush_buffer()

    # Fallback neu parse that bai
    if not strengths and not weaknesses:
        suggestions = "Da co loi phan tich tu AI. Vui long thu lai."
        strengths = raw[:300]

    return EvaluationResult(
        score=score,
        score_str=score_str,
        strengths=strengths,
        weaknesses=weaknesses,
        suggestions=suggestions,
    )
