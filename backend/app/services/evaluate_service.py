"""
Evaluate Service â€“ cháº¥m Ä‘iá»ƒm vÃ  nháº­n xÃ©t cÃ¢u tráº£ lá»i cá»§a á»©ng viÃªn.

TÃ¡ch ra khá»i rag_service.py Ä‘á»ƒ:
- Má»—i service cÃ³ 1 trÃ¡ch nhiá»‡m rÃµ rÃ ng (SRP).
- Dá»… test Ä‘á»™c láº­p.
- Dá»… thay tháº¿ model/prompt sau nÃ y.
"""
from __future__ import annotations

from app.core.config import GOOGLE_API_KEY_EVALUATE
from app.core.config import GOOGLE_API_KEY_TRANSLATE
from app.core.logging import get_logger
from app.utils.llm_client import GeminiClient
import json
import re

logger = get_logger(__name__)


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
    """ÄÃ¡nh giÃ¡ CV vÃ  tráº£ vá» JSON cÃ³ cáº¥u trÃºc."""
    client = GeminiClient(api_key=GOOGLE_API_KEY_TRANSLATE)
    
    prompt = (
        "Báº¡n lÃ  má»™t chuyÃªn gia tuyá»ƒn dá»¥ng (Headhunter/HR Manager) giÃ u kinh nghiá»‡m. "
        "HÃ£y Ä‘Ã¡nh giÃ¡ ná»™i dung CV sau Ä‘Ã¢y vÃ  tráº£ vá» káº¿t quáº£ DÆ¯á»šI Dáº NG JSON. "
        "YÃªu cáº§u cáº¥u trÃºc JSON chÃ­nh xÃ¡c nhÆ° sau:\n"
        "{\n"
        '  "overall": <sá»‘ Ä‘iá»ƒm tá»« 1 Ä‘áº¿n 10>,\n'
        '  "sections": [\n'
        '    { "name": "<TÃªn pháº§n, VD: ThÃ´ng tin cÃ¡ nhÃ¢n>", "score": <sá»‘ Ä‘iá»ƒm 1-10>, "feedback": "<nháº­n xÃ©t chi tiáº¿t, chá»‰ ra Ä‘iá»ƒm lÃ m tá»‘t vÃ  chÆ°a tá»‘t>" }\n'
        "  ],\n"
        '  "suggestions": [\n'
        '    "<hÆ°á»›ng dáº«n cáº£i thiá»‡n cá»¥ thá»ƒ 1>",\n'
        '    "<hÆ°á»›ng dáº«n cáº£i thiá»‡n cá»¥ thá»ƒ 2>"\n'
        "  ]\n"
        "}\n\n"
        "Ná»˜I DUNG CV:\n"
        f"{cv_text}\n\n"
        "Chá»‰ tráº£ vá» chuá»—i JSON há»£p lá»‡, khÃ´ng kÃ¨m markdown, khÃ´ng kÃ¨m lá»i giáº£i thÃ­ch."
    )
    
    raw = client.generate(prompt)
    
    try:
        # XÃ³a markdown code block náº¿u cÃ³
        raw_clean = re.sub(r'```json|```', '', raw).strip()
        result = json.loads(raw_clean)
        return result
    except Exception as e:
        logger.warning("Failed to parse CV evaluation JSON: %s", e)
        return {
            "overall": 5.0,
            "sections": [
                { "name": "Ná»™i dung", "score": 5, "feedback": "KhÃ´ng thá»ƒ phÃ¢n tÃ­ch cáº¥u trÃºc CV." }
            ],
            "suggestions": ["Vui lÃ²ng Ä‘áº£m báº£o CV rÃµ rÃ ng vÃ  thá»­ láº¡i."]
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
    DÃ¹ng LLM cháº¥m Ä‘iá»ƒm vÃ  nháº­n xÃ©t cÃ¢u tráº£ lá»i á»©ng viÃªn.

    Args:
        question:    CÃ¢u há»i Ä‘Ã£ Ä‘Æ°á»£c Ä‘áº·t ra.
        user_answer: CÃ¢u tráº£ lá»i cá»§a á»©ng viÃªn (cÃ³ thá»ƒ rá»—ng náº¿u bá» qua).
        reference:   CÃ¢u tráº£ lá»i tham kháº£o tá»« knowledge base.
        level:       Cáº¥p Ä‘á»™ phá»ng váº¥n Ä‘á»ƒ Ä‘iá»u chá»‰nh tiÃªu chuáº©n cháº¥m.
        language:    "vi" hoáº·c "en".

    Returns:
        EvaluationResult vá»›i score, strengths, weaknesses, suggestions.
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
    """Parse output text LLM thanh EvaluationResult â€“ dung regex robust, khong phu thuoc format cung."""
    score = 0.0
    score_str = "0/10"
    strengths = ""
    weaknesses = ""
    suggestions = ""

    # â”€â”€ Regex patterns (case-insensitive) bat moi bien the LLM output â”€â”€â”€â”€â”€
    # Bat: "DIEM:", "Äiá»ƒm:", "Ä‘iá»ƒm:", "ÄIá»‚M:", "Diem:", "Score:", "DIEM :" ...
    # QUAN TRONG: phai check DIEM MANH/YEU truoc de tranh match nham
    re_strengths = re.compile(
        r'^[\s*]*(DIEM\s*MANH|ÄIá»‚M\s*Máº NH|Äiá»ƒm\s*máº¡nh|STRENGTHS?)\s*:\s*(.*)',
        re.IGNORECASE
    )
    re_weaknesses = re.compile(
        r'^[\s*]*(DIEM\s*YEU|ÄIá»‚M\s*Yáº¾U|Äiá»ƒm\s*yáº¿u|WEAKNESSES?)\s*:\s*(.*)',
        re.IGNORECASE
    )
    re_suggestions = re.compile(
        r'^[\s*]*(GOI\s*Y(\s*BO\s*SUNG)?|Gá»¢I\s*Ã(\s*Bá»”\s*SUNG)?|SUGGESTIONS?)\s*:\s*(.*)',
        re.IGNORECASE
    )
    re_score_line = re.compile(
        r'^[\s*]*(DIEM|ÄIá»‚M|Äiá»ƒm|Ä‘iá»ƒm|Score|SCORE)\s*:\s*(.*)',
        re.IGNORECASE
    )
    # Pattern trÃ­ch score dáº¡ng X/10 tá»« chuá»—i báº¥t ká»³
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
            # TrÃ­ch score tá»« pattern X/10
            score_match = re_score_value.search(val)
            if score_match:
                try:
                    score = float(score_match.group(1).replace(",", "."))
                except (ValueError, IndexError):
                    pass

        elif current_field and stripped:
            buffer.append(stripped)

    # Flush field cuá»‘i cÃ¹ng
    flush_current()

    # â”€â”€ Fallback 1: Náº¿u chÆ°a parse Ä‘Æ°á»£c score, tÃ¬m X/10 Báº¤T Ká»² ÄÃ‚U trong toÃ n bá»™ output â”€â”€
    if score == 0.0:
        fallback_match = re_score_value.search(raw)
        if fallback_match:
            try:
                score = float(fallback_match.group(1).replace(",", "."))
                score_str = fallback_match.group(0)
                logger.warning("Used fallback score parser for evaluation output")
            except (ValueError, IndexError):
                pass

    # â”€â”€ Cáº£nh bÃ¡o khi score=0 nhÆ°ng LLM cÃ³ tráº£ output â”€â”€
    if score == 0.0 and raw.strip():
        logger.warning("Evaluation parser produced score 0.0 from non-empty LLM output")

    # Clamp score vÃ o khoáº£ng há»£p lá»‡ [0, 10]
    score = max(0.0, min(10.0, score))

    # Fallback náº¿u parse hoÃ n toÃ n tháº¥t báº¡i
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
