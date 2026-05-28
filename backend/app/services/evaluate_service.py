"""
Evaluate Service – chấm điểm và nhận xét câu trả lời của ứng viên.

Tách ra khỏi rag_service.py để:
- Mỗi service có 1 trách nhiệm rõ ràng (SRP).
- Dễ test độc lập.
- Dễ thay thế model/prompt sau này.
"""
from __future__ import annotations

from app.core.config import GOOGLE_API_KEY_EVALUATE
from app.core.config import GOOGLE_API_KEY_TRANSLATE
from app.utils.llm_client import GeminiClient
import json
import re


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

def evaluate_cv(cv_text: str) -> dict:
    """Đánh giá CV và trả về JSON có cấu trúc."""
    client = GeminiClient(api_key=GOOGLE_API_KEY_TRANSLATE)
    
    prompt = (
        "Bạn là một chuyên gia tuyển dụng (Headhunter/HR Manager) giàu kinh nghiệm. "
        "Hãy đánh giá nội dung CV sau đây và trả về kết quả DƯỚI DẠNG JSON. "
        "Yêu cầu cấu trúc JSON chính xác như sau:\n"
        "{\n"
        '  "overall": <số điểm từ 1 đến 10>,\n'
        '  "sections": [\n'
        '    { "name": "<Tên phần, VD: Thông tin cá nhân>", "score": <số điểm 1-10>, "feedback": "<nhận xét chi tiết, chỉ ra điểm làm tốt và chưa tốt>" }\n'
        "  ],\n"
        '  "suggestions": [\n'
        '    "<hướng dẫn cải thiện cụ thể 1>",\n'
        '    "<hướng dẫn cải thiện cụ thể 2>"\n'
        "  ]\n"
        "}\n\n"
        "NỘI DUNG CV:\n"
        f"{cv_text}\n\n"
        "Chỉ trả về chuỗi JSON hợp lệ, không kèm markdown, không kèm lời giải thích."
    )
    
    raw = client.generate(prompt)
    
    try:
        # Xóa markdown code block nếu có
        raw_clean = re.sub(r'```json|```', '', raw).strip()
        result = json.loads(raw_clean)
        return result
    except Exception as e:
        print(f"Error parsing CV evaluation JSON: {e}")
        return {
            "overall": 5.0,
            "sections": [
                { "name": "Nội dung", "score": 5, "feedback": "Không thể phân tích cấu trúc CV." }
            ],
            "suggestions": ["Vui lòng đảm bảo CV rõ ràng và thử lại."]
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
        "PHAN HOI PHAI NGAN GON, SUC TICH (moi muc toi da 2 cau). "
        "Tuyet doi khong giai thich dai dong, khong liet ke nhieu y. "
        "Tap trung vao diem quan trong nhat.\n"
        "BAT BUOC giu nguyen dinh dang sau (KHONG dung markdown/in dam vao tieu de):\n"
        "DIEM: [X/10]\n"
        "DIEM MANH: [1-2 cau ngan, dong vien cu the]\n"
        "DIEM YEU: [1-2 cau ngan, nhe nhang, chi vao diem thieu chinh]\n"
        "GOI Y BO SUNG: [1-2 cau ngan, goi y thiet thuc nhat]"
    ).strip()

    raw = client.generate(prompt)
    return _parse_evaluation(raw)


def _parse_evaluation(raw: str) -> EvaluationResult:
    """Parse output text LLM thanh EvaluationResult – dung regex robust, khong phu thuoc format cung."""
    score = 0.0
    score_str = "0/10"
    strengths = ""
    weaknesses = ""
    suggestions = ""

    # ── Regex patterns (case-insensitive) bat moi bien the LLM output ─────
    # Bat: "DIEM:", "Điểm:", "điểm:", "ĐIỂM:", "Diem:", "Score:", "DIEM :" ...
    # QUAN TRONG: phai check DIEM MANH/YEU truoc de tranh match nham
    re_strengths = re.compile(
        r'^[\s*]*(DIEM\s*MANH|ĐIỂM\s*MẠNH|Điểm\s*mạnh|STRENGTHS?)\s*:\s*(.*)',
        re.IGNORECASE
    )
    re_weaknesses = re.compile(
        r'^[\s*]*(DIEM\s*YEU|ĐIỂM\s*YẾU|Điểm\s*yếu|WEAKNESSES?)\s*:\s*(.*)',
        re.IGNORECASE
    )
    re_suggestions = re.compile(
        r'^[\s*]*(GOI\s*Y(\s*BO\s*SUNG)?|GỢI\s*Ý(\s*BỔ\s*SUNG)?|SUGGESTIONS?)\s*:\s*(.*)',
        re.IGNORECASE
    )
    re_score_line = re.compile(
        r'^[\s*]*(DIEM|ĐIỂM|Điểm|điểm|Score|SCORE)\s*:\s*(.*)',
        re.IGNORECASE
    )
    # Pattern trích score dạng X/10 từ chuỗi bất kỳ
    re_score_value = re.compile(r'(\d+[.,]?\d*)\s*/\s*10')

    lines = raw.split("\n")
    current_field = None
    buffer: list[str] = []

    def flush_buffer() -> str:
        return " ".join(buffer).strip()

    def flush_current():
        nonlocal strengths, weaknesses, suggestions
        if current_field == "strengths":
            strengths = flush_buffer()
        elif current_field == "weaknesses":
            weaknesses = flush_buffer()
        elif current_field == "suggestions":
            suggestions = flush_buffer()

    for line in lines:
        stripped = line.strip().replace("*", "")

        # QUAN TRONG: check DIEM MANH / DIEM YEU / GOI Y TRUOC "DIEM:"
        m_str = re_strengths.match(stripped)
        m_weak = re_weaknesses.match(stripped)
        m_sug = re_suggestions.match(stripped)
        m_score = re_score_line.match(stripped)

        if m_str:
            flush_current()
            buffer = [m_str.group(2).strip()]
            current_field = "strengths"

        elif m_weak:
            flush_current()
            buffer = [m_weak.group(2).strip()]
            current_field = "weaknesses"

        elif m_sug:
            flush_current()
            # group(4) la noi dung sau dau ":"
            content = m_sug.group(4) if m_sug.group(4) else m_sug.group(2)
            buffer = [content.strip() if content else ""]
            current_field = "suggestions"

        elif m_score:
            flush_current()
            buffer = []
            current_field = None

            val = m_score.group(2).strip()
            score_str = val
            # Trích score từ pattern X/10
            score_match = re_score_value.search(val)
            if score_match:
                try:
                    score = float(score_match.group(1).replace(",", "."))
                except (ValueError, IndexError):
                    pass

        elif current_field and stripped:
            buffer.append(stripped)

    # Flush field cuối cùng
    flush_current()

    # ── Fallback 1: Nếu chưa parse được score, tìm X/10 BẤT KỲ ĐÂU trong toàn bộ output ──
    if score == 0.0:
        fallback_match = re_score_value.search(raw)
        if fallback_match:
            try:
                score = float(fallback_match.group(1).replace(",", "."))
                score_str = fallback_match.group(0)
                print(f"[_parse_evaluation] [WARNING] Dung fallback regex: tim thay score={score} tu '{score_str}'")
            except (ValueError, IndexError):
                pass

    # ── Cảnh báo khi score=0 nhưng LLM có trả output ──
    if score == 0.0 and raw.strip():
        print(f"[_parse_evaluation] [WARNING] Score=0.0 nhung LLM co output ({len(raw)} chars)")
        print(f"[_parse_evaluation] Raw output (200 chars dau): {raw[:200]}")

    # Clamp score vào khoảng hợp lệ [0, 10]
    score = max(0.0, min(10.0, score))

    # Fallback nếu parse hoàn toàn thất bại
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
