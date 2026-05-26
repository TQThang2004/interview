"""
RAG Augmentor – Bước A (Augmented Generation) trong pipeline RAG.

Chức năng:
1. extract_cv_jd_context(): phân tích sâu CV + JD bằng Matching + Gap Analysis
   → trả về CVJDContext (matching_skills, gap_areas, topics riêng cho từng loại).
2. augment_questions(): đưa tài liệu retrieved + context vào LLM
   → LLM tổng hợp, sinh câu hỏi theo tỷ lệ 60% matching / 40% gap.

Flow (được gọi từ rag_generator.py):
  CVJDContext ← extract_cv_jd_context(cv, jd)      [1 LLM call]
  RawDocs     ← rag_retriever.retrieve_raw_docs()   [embedding + ChromaDB]
  Questions   ← augment_questions(RawDocs, context) [1 LLM call]
"""
from __future__ import annotations

import json
import math
from dataclasses import dataclass, field

from app.core.config import (
    GOOGLE_API_KEY_EXTRACT_TOPIC,
    GOOGLE_API_KEY_GENERATE_Q,
    NUM_QUESTIONS,
)
from app.utils.llm_client import GeminiClient
from app.services.rag_retriever import RawDoc


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class CVJDContext:
    """Kết quả phân tích CV + JD – đầu vào cho Retriever và Augmentor."""
    topics: list[str]               # ALL query strings cho ChromaDB (backward compat)
    tech_stack: list[str]           # các công nghệ chính
    matching_skills: list[str]      # Kỹ năng JD cần MÀ CV đã có (60%)
    gap_areas: list[str]            # Kỹ năng JD cần nhưng CV chưa thể hiện (40%)
    matching_topics: list[str]      # Query ChromaDB cho matching skills
    gap_topics: list[str]           # Query ChromaDB cho gap areas
    candidate_summary: str          # tóm tắt ngắn về ứng viên
    position_summary: str           # tóm tắt vị trí ứng tuyển


@dataclass
class Question:
    """Câu hỏi phỏng vấn đã augment – đầu ra của toàn bộ pipeline."""
    id: int
    question: str
    reference: str
    source: str = "rag_augmented"   # "rag_augmented" | "gap_generated"


# ---------------------------------------------------------------------------
# JSON Schema dùng cho prompt
# ---------------------------------------------------------------------------

_CONTEXT_SCHEMA = """{
  "matching_skills": ["React hooks", "REST API design", "PostgreSQL"],
  "gap_areas": ["Thiếu kinh nghiệm Docker/CI-CD theo JD", "Chưa đề cập System Design"],
  "matching_topics": ["ReactJS hooks useState useEffect performance interview questions", "REST API design best practices interview"],
  "gap_topics": ["Docker containerization CI CD pipeline interview questions", "System design scalability interview"],
  "tech_stack": ["React", "Node.js", "PostgreSQL"],
  "candidate_summary": "3 năm FE React, có dự án thương mại điện tử, chưa có BE rõ ràng",
  "position_summary": "Fullstack vị trí mid-level tại startup fintech, cần Node.js + React"
}"""

_QUESTION_SCHEMA = """[
  {
    "question": "Câu hỏi kỹ thuật cụ thể (dựa vào CV/JD/gap)",
    "reference": "Gợi ý câu trả lời tốt",
    "source": "rag_augmented"
  }
]"""


# ---------------------------------------------------------------------------
# Step 1: Extract CV/JD Context
# ---------------------------------------------------------------------------

def extract_cv_jd_context(cv_text: str, jd_text: str) -> CVJDContext:
    """
    Phân tích CV và JD bằng Matching + Gap Analysis để lấy:
    - matching_skills: Kỹ năng JD yêu cầu MÀ CV ứng viên đã có (ưu tiên hỏi sâu)
    - gap_areas: Kỹ năng JD yêu cầu nhưng CV chưa thể hiện
    - matching_topics / gap_topics: query riêng cho ChromaDB
    - Tóm tắt ứng viên và vị trí.

    Chi phí: 1 LLM call.
    """
    client = GeminiClient(api_key=GOOGLE_API_KEY_EXTRACT_TOPIC)

    prompt = f"""Bạn là chuyên gia tuyển dụng kỹ thuật. Phân tích CV và JD sau đây.

CV:
{cv_text[:4000]}

Job Description:
{jd_text[:3000]}

NHIỆM VỤ – thực hiện Matching + Gap Analysis và trả về JSON theo schema sau (KHÔNG có markdown, KHÔNG giải thích):

Schema:
{_CONTEXT_SCHEMA}

Hướng dẫn chi tiết:
- "matching_skills": Liệt kê các kỹ năng/công nghệ mà JD yêu cầu VÀ CV ứng viên đã thể hiện có kinh nghiệm. Đây là điểm mạnh cần hỏi sâu để đánh giá năng lực thực tế. Tối đa 5 kỹ năng.
- "gap_areas": Tối đa 3 điểm – kỹ năng/công nghệ JD yêu cầu nhưng CV chưa thể hiện hoặc còn yếu. Đây là điểm cần đánh giá tiềm năng.
- "matching_topics": 2–3 chuỗi query tìm kiếm vector (tiếng Anh, chi tiết, có tên công nghệ + từ khoá technical interview) cho CÁC KỸ NĂNG KHỚP. Ví dụ: "ReactJS hooks useState useEffect performance interview questions".
- "gap_topics": 1–2 chuỗi query tìm kiếm vector cho CÁC KỸ NĂNG THIẾU. Ví dụ: "Docker containerization CI CD pipeline interview questions".
- "tech_stack": liệt kê ngắn gọn các công nghệ chính từ cả CV và JD.
- "candidate_summary": 1–2 câu tóm tắt profile ứng viên.
- "position_summary": 1–2 câu mô tả vị trí ứng tuyển.

Nếu CV hoặc JD trống, hãy tự suy luận hợp lý từ phần còn lại.
CHỈ trả về JSON object, tuyệt đối không có text thừa."""

    print("\n" + "=" * 60)
    print(">>> [Augmentor] Bắt đầu Extract CV/JD Context (Matching + Gap Analysis)...")

    result = client.generate_json(prompt)

    if not isinstance(result, dict):
        print("[Augmentor] Lỗi parse context, dùng fallback.")
        return CVJDContext(
            topics=["software engineering technical interview questions"],
            tech_stack=[],
            matching_skills=[],
            gap_areas=[],
            matching_topics=["software engineering technical interview questions"],
            gap_topics=[],
            candidate_summary="Không rõ thông tin ứng viên.",
            position_summary="Vị trí kỹ thuật phần mềm.",
        )

    matching_topics = result.get("matching_topics", [])[:3]
    gap_topics = result.get("gap_topics", [])[:2]
    # topics = matching_topics + gap_topics (backward compat)
    all_topics = matching_topics + gap_topics
    if not all_topics:
        all_topics = ["software engineering interview questions"]

    print(f">>> [Augmentor] Context extracted:")
    print(f"    matching_skills={result.get('matching_skills', [])}")
    print(f"    gap_areas={result.get('gap_areas', [])}")
    print(f"    matching_topics={matching_topics}")
    print(f"    gap_topics={gap_topics}")

    return CVJDContext(
        topics=all_topics,
        tech_stack=result.get("tech_stack", []),
        matching_skills=result.get("matching_skills", []),
        gap_areas=result.get("gap_areas", []),
        matching_topics=matching_topics,
        gap_topics=gap_topics,
        candidate_summary=result.get("candidate_summary", ""),
        position_summary=result.get("position_summary", ""),
    )


# ---------------------------------------------------------------------------
# Internal: extract question & reference từ document thô
# ---------------------------------------------------------------------------

def _extract_question(document: str) -> str:
    for line in document.split("\n"):
        if line.startswith("Cau hoi:") or line.startswith("Câu hỏi:"):
            return line.split(":", 1)[1].strip()
    lines = [l.strip() for l in document.split("\n") if l.strip()]
    return lines[1] if len(lines) > 1 else document[:200]


def _extract_reference(document: str) -> str:
    for line in document.split("\n"):
        if line.startswith("Tra loi:") or line.startswith("Trả lời:"):
            return line.split(":", 1)[1].strip()
    return ""


# ---------------------------------------------------------------------------
# Step 2: Augment – LLM tổng hợp retrieved docs + context → câu hỏi mới
# ---------------------------------------------------------------------------

def augment_questions(
    raw_docs: list[RawDoc],
    context: CVJDContext,
    level: str,
    language: str = "vi",
    num_q: int = NUM_QUESTIONS,
) -> list[Question]:
    """
    Đưa tài liệu retrieved + CVJDContext vào LLM để:
    - Sinh câu hỏi theo tỷ lệ 60% matching / 40% gap.
    - Câu hỏi ngắn gọn, tập trung, chỉ hỏi 1 ý.
    - Điều chỉnh độ khó theo level.

    Chi phí: 1 LLM call.
    """
    if not raw_docs:
        print("[Augmentor] Không có tài liệu retrieved, trả về list rỗng.")
        return []

    client = GeminiClient(api_key=GOOGLE_API_KEY_GENERATE_Q)

    # ── Tính toán phân bổ 60/40 ──────────────────────────────────────────────
    num_matching = math.ceil(num_q * 0.6)   # 60% matching (làm tròn lên)
    num_gap = num_q - num_matching            # 40% gap

    # ── Chuẩn bị retrieved docs dưới dạng text ngắn gọn ─────────────────────
    retrieved_excerpts = []
    for i, doc in enumerate(raw_docs):
        q = _extract_question(doc.document)
        ref = _extract_reference(doc.document)
        retrieved_excerpts.append(
            f"[Doc {i+1}] Q: {q}\n        A: {ref[:200] if ref else '(không có)'}"
        )
    retrieved_block = "\n\n".join(retrieved_excerpts)

    # ── Chuẩn bị matching + gap context ──────────────────────────────────────
    matching_block = ""
    if context.matching_skills:
        matching_items = "\n".join(f"  - {s}" for s in context.matching_skills)
        matching_block = (
            f"\nKỸ NĂNG KHỚP (CV có + JD cần) – hỏi SÂU để đánh giá năng lực thực tế:\n{matching_items}\n"
        )

    gap_block = ""
    if context.gap_areas:
        gap_items = "\n".join(f"  - {g}" for g in context.gap_areas)
        gap_block = (
            f"\nKỸ NĂNG THIẾU (JD cần nhưng CV chưa thể hiện) – hỏi để đánh giá tiềm năng:\n{gap_items}\n"
        )

    lang_instruction = (
        "Tiếng Việt (giữ nguyên thuật ngữ kỹ thuật IT bằng tiếng Anh)"
        if language == "vi"
        else "English"
    )
    stack_hint = ", ".join(context.tech_stack) if context.tech_stack else "general software engineering"

    prompt = f"""Bạn là kỹ sư cấp cao đang phỏng vấn một ứng viên vị trí {level}.

=== THÔNG TIN ỨNG VIÊN ===
Profile: {context.candidate_summary}
Vị trí ứng tuyển: {context.position_summary}
Tech stack chính: {stack_hint}
{matching_block}
{gap_block}
=== TÀI LIỆU CÂU HỎI RETRIEVED (từ knowledge base) ===
{retrieved_block}

=== PHÂN BỔ CÂU HỎI BẮT BUỘC ===
- {num_matching} câu (60%) từ KỸ NĂNG KHỚP: Hỏi sâu kỹ năng ứng viên ĐÃ CÓ theo JD → đánh giá năng lực thực tế. Dùng source="rag_augmented".
- {num_gap} câu (40%) từ KỸ NĂNG THIẾU: Hỏi về kỹ năng ứng viên CÒN THIẾU theo JD → đánh giá tiềm năng. Dùng source="gap_generated".

=== QUY TẮC CHẤT LƯỢNG CÂU HỎI (BẮT BUỘC TUÂN THỦ) ===
1. MỖI CÂU CHỈ HỎI MỘT VẤN ĐỀ DUY NHẤT – tuyệt đối không gộp 2-3 ý vào 1 câu.
2. ĐI THẲNG VÀO VẤN ĐỀ – không mở đầu bằng ngữ cảnh hay giới thiệu dài dòng.
3. CÂU HỎI NGẮN GỌN – tối đa 2 câu, dưới 50 từ.
4. CỤ THỂ VÀ KỸ THUẬT – hỏi về kỹ thuật/công nghệ cụ thể, tránh hỏi chung chung.
5. KHÔNG lặp lại ý nghĩa giữa các câu hỏi.

VÍ DỤ TỐT:
✅ "Giải thích sự khác biệt giữa useMemo và useCallback trong React."
✅ "Bạn xử lý N+1 query problem trong ORM như thế nào?"
✅ "Khi nào nên dùng index trong PostgreSQL và khi nào không nên?"

VÍ DỤ XẤU (TUYỆT ĐỐI KHÔNG TẠO KIỂU NÀY):
❌ "Trong dự án thương mại điện tử, khi cần xử lý giỏ hàng, bạn đã dùng React hooks nào, tại sao chọn hooks đó, và xử lý performance ra sao?"
❌ "Hãy cho biết kinh nghiệm của bạn với Docker, bạn đã triển khai CI/CD chưa, và bạn dùng orchestration tool nào?"

=== NHIỆM VỤ ===
Dựa vào tài liệu retrieved và thông tin ứng viên:
1. Chọn lọc và ĐIỀU CHỈNH câu hỏi phù hợp với profile và vị trí.
2. Điều chỉnh độ khó phù hợp với cấp độ "{level}".
3. Tuân thủ ĐÚNG tỷ lệ {num_matching} câu matching + {num_gap} câu gap.
4. Tuân thủ ĐÚNG quy tắc chất lượng câu hỏi ở trên.

YÊU CẦU OUTPUT:
- Ngôn ngữ: {lang_instruction}
- Số lượng: đúng {num_q} câu hỏi
- Format: JSON array theo schema sau, KHÔNG có markdown, KHÔNG có text thừa:

Schema:
{_QUESTION_SCHEMA}

CHỈ trả về JSON array, tuyệt đối không có text thừa."""

    print(f"\n>>> [Augmentor] Gọi LLM augment {len(raw_docs)} docs → {num_q} câu hỏi ({num_matching} matching + {num_gap} gap)...")

    result = client.generate_json(prompt)

    if not isinstance(result, list) or len(result) == 0:
        print("[Augmentor] Lỗi parse, fallback về câu hỏi thô từ retrieved docs.")
        return _fallback_from_raw_docs(raw_docs, num_q)

    questions: list[Question] = []
    for i, item in enumerate(result[:num_q]):
        if not isinstance(item, dict):
            continue
        questions.append(Question(
            id=i,
            question=item.get("question", "").strip(),
            reference=item.get("reference", "").strip(),
            source=item.get("source", "rag_augmented"),
        ))

    # Thống kê phân bổ thực tế
    n_match = sum(1 for q in questions if q.source == "rag_augmented")
    n_gap = sum(1 for q in questions if q.source == "gap_generated")
    print(f">>> [Augmentor] Sinh được {len(questions)} câu hỏi: {n_match} matching + {n_gap} gap.")
    for q in questions:
        print(f"  [{q.source}] {q.question[:100]}...")

    return questions


def _fallback_from_raw_docs(raw_docs: list[RawDoc], num_q: int) -> list[Question]:
    """Fallback: trích xuất câu hỏi thô từ tài liệu nếu LLM augment thất bại."""
    questions = []
    for i, doc in enumerate(raw_docs[:num_q]):
        questions.append(Question(
            id=i,
            question=_extract_question(doc.document),
            reference=_extract_reference(doc.document),
            source="rag_augmented",
        ))
    return questions
