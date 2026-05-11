"""
RAG Augmentor – Bước A (Augmented Generation) trong pipeline RAG.

Chức năng:
1. extract_cv_jd_context(): phân tích sâu CV + JD bằng Gap Analysis
   → trả về CVJDContext (topics, stack, gap_areas, candidate_summary).
2. augment_questions(): đưa tài liệu retrieved + context vào LLM
   → LLM tổng hợp, điều chỉnh, sinh câu hỏi phù hợp cụ thể với ứng viên.

Flow (được gọi từ rag_generator.py):
  CVJDContext ← extract_cv_jd_context(cv, jd)      [1 LLM call]
  RawDocs     ← rag_retriever.retrieve_raw_docs()   [embedding + ChromaDB]
  Questions   ← augment_questions(RawDocs, context) [1 LLM call]
"""
from __future__ import annotations

import json
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
    topics: list[str]               # query strings cho ChromaDB (topic chính trước)
    tech_stack: list[str]           # các công nghệ chính
    gap_areas: list[str]            # JD yêu cầu nhưng CV chưa thể hiện rõ
    candidate_summary: str          # tóm tắt ngắn về ứng viên để context cho LLM
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
  "topics": ["<query1 cho ChromaDB>", "<query2>", "<query3>", "<query4>"],
  "tech_stack": ["React", "Node.js", "PostgreSQL"],
  "gap_areas": ["Thiếu kinh nghiệm Docker/CI-CD theo JD", "Chưa đề cập System Design"],
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
    Phân tích CV và JD bằng Gap Analysis để lấy:
    - Topics cho ChromaDB query (có cấu trúc tốt hơn simple keyword).
    - Danh sách công nghệ cốt lõi.
    - Gap areas: JD đòi hỏi gì mà CV chưa thể hiện – để hỏi sâu hơn.
    - Tóm tắt ứng viên và vị trí.

    Chi phí: 1 LLM call.
    """
    client = GeminiClient(api_key=GOOGLE_API_KEY_EXTRACT_TOPIC)

    prompt = f"""Bạn là chuyên gia tuyển dụng kỹ thuật. Phân tích CV và JD sau đây.

CV (tối đa 2000 ký tự):
{cv_text[:2000]}

Job Description (tối đa 1500 ký tự):
{jd_text[:1500]}

NHIỆM VỤ – thực hiện Gap Analysis và trả về JSON theo schema sau (KHÔNG có markdown, KHÔNG giải thích):

Schema:
{_CONTEXT_SCHEMA}

Hướng dẫn chi tiết:
- "topics": 3–4 chuỗi query tìm kiếm vector (tiếng Anh, chi tiết, có tên công nghệ + từ khoá technical interview). Phần tử ĐẦU TIÊN là topic QUAN TRỌNG NHẤT (công nghệ chính nhất theo JD). Ví dụ: "ReactJS hooks useState useEffect performance interview questions".
- "tech_stack": liệt kê ngắn gọn các công nghệ chính.
- "gap_areas": tối đa 3 điểm – JD yêu cầu gì mà CV của ứng viên chưa thể hiện hoặc còn yếu. Đây là điểm cần hỏi sâu thêm.
- "candidate_summary": 1–2 câu tóm tắt profile ứng viên.
- "position_summary": 1–2 câu mô tả vị trí ứng tuyển.

Nếu CV hoặc JD trống, hãy tự suy luận hợp lý từ phần còn lại.
CHỈ trả về JSON object, tuyệt đối không có text thừa."""

    print("\n" + "=" * 60)
    print(">>> [Augmentor] Bắt đầu Extract CV/JD Context (Gap Analysis)...")

    result = client.generate_json(prompt)

    if not isinstance(result, dict):
        print("[Augmentor] Lỗi parse context, dùng fallback.")
        return CVJDContext(
            topics=["software engineering technical interview questions"],
            tech_stack=[],
            gap_areas=[],
            candidate_summary="Không rõ thông tin ứng viên.",
            position_summary="Vị trí kỹ thuật phần mềm.",
        )

    print(f">>> [Augmentor] Context extracted: topics={result.get('topics', [])}")
    print(f"    gap_areas={result.get('gap_areas', [])}")

    return CVJDContext(
        topics=result.get("topics", ["software engineering interview questions"])[:4],
        tech_stack=result.get("tech_stack", []),
        gap_areas=result.get("gap_areas", []),
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
    - Tổng hợp, tinh chỉnh câu hỏi phù hợp với ứng viên cụ thể.
    - Ưu tiên câu hỏi liên quan gap_areas (điểm yếu ứng viên).
    - Điều chỉnh độ khó theo level.
    - Sinh ra câu hỏi cuối cùng bằng ngôn ngữ phù hợp.

    Chi phí: 1 LLM call (thay vì 2 call cũ: translate + custom_q).

    Args:
        raw_docs: Tài liệu thô từ Retriever.
        context:  CVJDContext từ extract_cv_jd_context().
        level:    Cấp độ phỏng vấn.
        language: "vi" hoặc "en".
        num_q:    Số câu hỏi muốn sinh ra.

    Returns:
        list[Question] đã augment, sắp xếp theo độ ưu tiên.
    """
    if not raw_docs:
        print("[Augmentor] Không có tài liệu retrieved, trả về list rỗng.")
        return []

    client = GeminiClient(api_key=GOOGLE_API_KEY_GENERATE_Q)

    # ── Chuẩn bị retrieved docs dưới dạng text ngắn gọn ─────────────────────
    retrieved_excerpts = []
    for i, doc in enumerate(raw_docs):
        q = _extract_question(doc.document)
        ref = _extract_reference(doc.document)
        retrieved_excerpts.append(
            f"[Doc {i+1}] Q: {q}\n        A: {ref[:200] if ref else '(không có)'}"
        )
    retrieved_block = "\n\n".join(retrieved_excerpts)

    # ── Chuẩn bị gap context ─────────────────────────────────────────────────
    gap_block = ""
    if context.gap_areas:
        gap_items = "\n".join(f"  - {g}" for g in context.gap_areas)
        gap_block = (
            f"\nGap Analysis – Điểm JD yêu cầu mà CV chưa thể hiện:\n{gap_items}\n"
            f"→ Hãy ưu tiên tạo ít nhất {min(2, len(context.gap_areas))} câu hỏi "
            f"khai thác sâu các gap này.\n"
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
{gap_block}
=== TÀI LIỆU CÂU HỎI RETRIEVED (từ knowledge base) ===
{retrieved_block}

=== NHIỆM VỤ ===
Dựa vào tài liệu retrieved ở trên và thông tin ứng viên:
1. Chọn lọc và ĐIỀU CHỈNH các câu hỏi phù hợp nhất với profile và vị trí cụ thể này.
2. Cá nhân hoá câu hỏi: tham chiếu kinh nghiệm trong CV nếu có thể.
3. Điều chỉnh độ khó phù hợp với cấp độ "{level}".
4. Nếu có gap areas, thêm câu hỏi khai thác sâu các điểm đó.
5. Loại bỏ câu hỏi trùng ý nghĩa hoặc quá chung chung.

YÊU CẦU OUTPUT:
- Ngôn ngữ: {lang_instruction}
- Số lượng: đúng {num_q} câu hỏi
- Format: JSON array theo schema sau, KHÔNG có markdown, KHÔNG có text thừa:

Schema:
{_QUESTION_SCHEMA}

Với "source": dùng "rag_augmented" nếu dựa trên retrieved doc, "gap_generated" nếu sinh ra từ gap analysis.

CHỈ trả về JSON array, tuyệt đối không có text thừa."""

    print(f"\n>>> [Augmentor] Gọi LLM augment {len(raw_docs)} docs → {num_q} câu hỏi...")

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

    print(f">>> [Augmentor] Sinh được {len(questions)} câu hỏi augmented.")
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
