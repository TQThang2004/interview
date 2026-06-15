"""
RAG Augmentor â€“ BÆ°á»›c A (Augmented Generation) trong pipeline RAG.

Chá»©c nÄƒng:
1. extract_cv_jd_context(): phÃ¢n tÃ­ch sÃ¢u CV + JD báº±ng Matching + Gap Analysis
   â†’ tráº£ vá» CVJDContext (matching_skills, gap_areas, topics riÃªng cho tá»«ng loáº¡i).
2. augment_questions(): Ä‘Æ°a tÃ i liá»‡u retrieved + context vÃ o LLM
   â†’ LLM tá»•ng há»£p, sinh cÃ¢u há»i theo tá»· lá»‡ 60% matching / 40% gap.

Flow (Ä‘Æ°á»£c gá»i tá»« rag_generator.py):
  CVJDContext â† extract_cv_jd_context(cv, jd)      [1 LLM call]
  RawDocs     â† rag_retriever.retrieve_raw_docs()   [embedding + ChromaDB]
  Questions   â† augment_questions(RawDocs, context) [1 LLM call]
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
    """Káº¿t quáº£ phÃ¢n tÃ­ch CV + JD â€“ Ä‘áº§u vÃ o cho Retriever vÃ  Augmentor."""
    topics: list[str]               # ALL query strings cho ChromaDB (backward compat)
    tech_stack: list[str]           # cÃ¡c cÃ´ng nghá»‡ chÃ­nh
    matching_skills: list[str]      # Ká»¹ nÄƒng JD cáº§n MÃ€ CV Ä‘Ã£ cÃ³ (60%)
    gap_areas: list[str]            # Ká»¹ nÄƒng JD cáº§n nhÆ°ng CV chÆ°a thá»ƒ hiá»‡n (40%)
    matching_topics: list[str]      # Query ChromaDB cho matching skills
    gap_topics: list[str]           # Query ChromaDB cho gap areas
    candidate_summary: str          # tÃ³m táº¯t ngáº¯n vá» á»©ng viÃªn
    position_summary: str           # tÃ³m táº¯t vá»‹ trÃ­ á»©ng tuyá»ƒn


@dataclass
class Question:
    """CÃ¢u há»i phá»ng váº¥n Ä‘Ã£ augment â€“ Ä‘áº§u ra cá»§a toÃ n bá»™ pipeline."""
    id: int
    question: str
    reference: str
    source: str = "rag_augmented"   # "rag_augmented" | "gap_generated"


# ---------------------------------------------------------------------------
# JSON Schema dÃ¹ng cho prompt
# ---------------------------------------------------------------------------

_CONTEXT_SCHEMA = """{
  "matching_skills": ["React hooks", "REST API design", "PostgreSQL"],
  "gap_areas": ["Thiáº¿u kinh nghiá»‡m Docker/CI-CD theo JD", "ChÆ°a Ä‘á» cáº­p System Design"],
  "matching_topics": ["ReactJS hooks useState useEffect performance interview questions", "REST API design best practices interview"],
  "gap_topics": ["Docker containerization CI CD pipeline interview questions", "System design scalability interview"],
  "tech_stack": ["React", "Node.js", "PostgreSQL"],
  "candidate_summary": "3 nÄƒm FE React, cÃ³ dá»± Ã¡n thÆ°Æ¡ng máº¡i Ä‘iá»‡n tá»­, chÆ°a cÃ³ BE rÃµ rÃ ng",
  "position_summary": "Fullstack vá»‹ trÃ­ mid-level táº¡i startup fintech, cáº§n Node.js + React"
}"""

_QUESTION_SCHEMA = """[
  {
    "question": "CÃ¢u há»i ká»¹ thuáº­t cá»¥ thá»ƒ (dá»±a vÃ o CV/JD/gap)",
    "reference": "Gá»£i Ã½ cÃ¢u tráº£ lá»i tá»‘t",
    "source": "rag_augmented"
  }
]"""


# ---------------------------------------------------------------------------
# Step 1: Extract CV/JD Context
# ---------------------------------------------------------------------------

def extract_cv_jd_context(cv_text: str, jd_text: str) -> CVJDContext:
    """
    PhÃ¢n tÃ­ch CV vÃ  JD báº±ng Matching + Gap Analysis Ä‘á»ƒ láº¥y:
    - matching_skills: Ká»¹ nÄƒng JD yÃªu cáº§u MÃ€ CV á»©ng viÃªn Ä‘Ã£ cÃ³ (Æ°u tiÃªn há»i sÃ¢u)
    - gap_areas: Ká»¹ nÄƒng JD yÃªu cáº§u nhÆ°ng CV chÆ°a thá»ƒ hiá»‡n
    - matching_topics / gap_topics: query riÃªng cho ChromaDB
    - TÃ³m táº¯t á»©ng viÃªn vÃ  vá»‹ trÃ­.

    Chi phÃ­: 1 LLM call.
    """
    client = GeminiClient(api_key=GOOGLE_API_KEY_EXTRACT_TOPIC)

    prompt = f"""Báº¡n lÃ  chuyÃªn gia tuyá»ƒn dá»¥ng ká»¹ thuáº­t. PhÃ¢n tÃ­ch CV vÃ  JD sau Ä‘Ã¢y.

CV:
{cv_text[:4000]}

Job Description:
{jd_text[:3000]}

NHIá»†M Vá»¤ â€“ thá»±c hiá»‡n Matching + Gap Analysis vÃ  tráº£ vá» JSON theo schema sau (KHÃ”NG cÃ³ markdown, KHÃ”NG giáº£i thÃ­ch):

Schema:
{_CONTEXT_SCHEMA}

HÆ°á»›ng dáº«n chi tiáº¿t:
- "matching_skills": Liá»‡t kÃª cÃ¡c ká»¹ nÄƒng/cÃ´ng nghá»‡ mÃ  JD yÃªu cáº§u VÃ€ CV á»©ng viÃªn Ä‘Ã£ thá»ƒ hiá»‡n cÃ³ kinh nghiá»‡m. ÄÃ¢y lÃ  Ä‘iá»ƒm máº¡nh cáº§n há»i sÃ¢u Ä‘á»ƒ Ä‘Ã¡nh giÃ¡ nÄƒng lá»±c thá»±c táº¿. Tá»‘i Ä‘a 5 ká»¹ nÄƒng.
- "gap_areas": Tá»‘i Ä‘a 3 Ä‘iá»ƒm â€“ ká»¹ nÄƒng/cÃ´ng nghá»‡ JD yÃªu cáº§u nhÆ°ng CV chÆ°a thá»ƒ hiá»‡n hoáº·c cÃ²n yáº¿u. ÄÃ¢y lÃ  Ä‘iá»ƒm cáº§n Ä‘Ã¡nh giÃ¡ tiá»m nÄƒng.
- "matching_topics": 2â€“3 chuá»—i query tÃ¬m kiáº¿m vector (tiáº¿ng Anh, chi tiáº¿t, cÃ³ tÃªn cÃ´ng nghá»‡ + tá»« khoÃ¡ technical interview) cho CÃC Ká»¸ NÄ‚NG KHá»šP. VÃ­ dá»¥: "ReactJS hooks useState useEffect performance interview questions".
- "gap_topics": 1â€“2 chuá»—i query tÃ¬m kiáº¿m vector cho CÃC Ká»¸ NÄ‚NG THIáº¾U. VÃ­ dá»¥: "Docker containerization CI CD pipeline interview questions".
- "tech_stack": liá»‡t kÃª ngáº¯n gá»n cÃ¡c cÃ´ng nghá»‡ chÃ­nh tá»« cáº£ CV vÃ  JD.
- "candidate_summary": 1â€“2 cÃ¢u tÃ³m táº¯t profile á»©ng viÃªn.
- "position_summary": 1â€“2 cÃ¢u mÃ´ táº£ vá»‹ trÃ­ á»©ng tuyá»ƒn.

Náº¿u CV hoáº·c JD trá»‘ng, hÃ£y tá»± suy luáº­n há»£p lÃ½ tá»« pháº§n cÃ²n láº¡i.
CHá»ˆ tráº£ vá» JSON object, tuyá»‡t Ä‘á»‘i khÃ´ng cÃ³ text thá»«a."""


    result = client.generate_json(prompt)

    if not isinstance(result, dict):
        return CVJDContext(
            topics=["software engineering technical interview questions"],
            tech_stack=[],
            matching_skills=[],
            gap_areas=[],
            matching_topics=["software engineering technical interview questions"],
            gap_topics=[],
            candidate_summary="KhÃ´ng rÃµ thÃ´ng tin á»©ng viÃªn.",
            position_summary="Vá»‹ trÃ­ ká»¹ thuáº­t pháº§n má»m.",
        )

    matching_topics = result.get("matching_topics", [])[:3]
    gap_topics = result.get("gap_topics", [])[:2]
    # topics = matching_topics + gap_topics (backward compat)
    all_topics = matching_topics + gap_topics
    if not all_topics:
        all_topics = ["software engineering interview questions"]


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
# Internal: extract question & reference tá»« document thÃ´
# ---------------------------------------------------------------------------

def _extract_question(document: str) -> str:
    for line in document.split("\n"):
        if line.startswith("Cau hoi:") or line.startswith("CÃ¢u há»i:"):
            return line.split(":", 1)[1].strip()
    lines = [l.strip() for l in document.split("\n") if l.strip()]
    return lines[1] if len(lines) > 1 else document[:200]


def _extract_reference(document: str) -> str:
    for line in document.split("\n"):
        if line.startswith("Tra loi:") or line.startswith("Tráº£ lá»i:"):
            return line.split(":", 1)[1].strip()
    return ""


# ---------------------------------------------------------------------------
# Step 2: Augment â€“ LLM tá»•ng há»£p retrieved docs + context â†’ cÃ¢u há»i má»›i
# ---------------------------------------------------------------------------

def augment_questions(
    raw_docs: list[RawDoc],
    context: CVJDContext,
    level: str,
    language: str = "vi",
    num_q: int = NUM_QUESTIONS,
) -> list[Question]:
    """
    ÄÆ°a tÃ i liá»‡u retrieved + CVJDContext vÃ o LLM Ä‘á»ƒ:
    - Sinh cÃ¢u há»i theo tá»· lá»‡ 60% matching / 40% gap.
    - CÃ¢u há»i ngáº¯n gá»n, táº­p trung, chá»‰ há»i 1 Ã½.
    - Äiá»u chá»‰nh Ä‘á»™ khÃ³ theo level.

    Chi phÃ­: 1 LLM call.
    """
    if not raw_docs:
        return []

    client = GeminiClient(api_key=GOOGLE_API_KEY_GENERATE_Q)

    # â”€â”€ TÃ­nh toÃ¡n phÃ¢n bá»• 60/40 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    num_matching = math.ceil(num_q * 0.6)   # 60% matching (lÃ m trÃ²n lÃªn)
    num_gap = num_q - num_matching            # 40% gap

    # â”€â”€ Chuáº©n bá»‹ retrieved docs dÆ°á»›i dáº¡ng text ngáº¯n gá»n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    retrieved_excerpts = []
    for i, doc in enumerate(raw_docs):
        q = _extract_question(doc.document)
        ref = _extract_reference(doc.document)
        retrieved_excerpts.append(
            f"[Doc {i+1}] Q: {q}\n        A: {ref[:200] if ref else '(khÃ´ng cÃ³)'}"
        )
    retrieved_block = "\n\n".join(retrieved_excerpts)

    # â”€â”€ Chuáº©n bá»‹ matching + gap context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    matching_block = ""
    if context.matching_skills:
        matching_items = "\n".join(f"  - {s}" for s in context.matching_skills)
        matching_block = (
            f"\nKá»¸ NÄ‚NG KHá»šP (CV cÃ³ + JD cáº§n) â€“ há»i SÃ‚U Ä‘á»ƒ Ä‘Ã¡nh giÃ¡ nÄƒng lá»±c thá»±c táº¿:\n{matching_items}\n"
        )

    gap_block = ""
    if context.gap_areas:
        gap_items = "\n".join(f"  - {g}" for g in context.gap_areas)
        gap_block = (
            f"\nKá»¸ NÄ‚NG THIáº¾U (JD cáº§n nhÆ°ng CV chÆ°a thá»ƒ hiá»‡n) â€“ há»i Ä‘á»ƒ Ä‘Ã¡nh giÃ¡ tiá»m nÄƒng:\n{gap_items}\n"
        )

    lang_instruction = (
        "Tiáº¿ng Viá»‡t (giá»¯ nguyÃªn thuáº­t ngá»¯ ká»¹ thuáº­t IT báº±ng tiáº¿ng Anh)"
        if language == "vi"
        else "English"
    )
    stack_hint = ", ".join(context.tech_stack) if context.tech_stack else "general software engineering"

    prompt = f"""Báº¡n lÃ  ká»¹ sÆ° cáº¥p cao Ä‘ang phá»ng váº¥n má»™t á»©ng viÃªn vá»‹ trÃ­ {level}.

=== THÃ”NG TIN á»¨NG VIÃŠN ===
Profile: {context.candidate_summary}
Vá»‹ trÃ­ á»©ng tuyá»ƒn: {context.position_summary}
Tech stack chÃ­nh: {stack_hint}
{matching_block}
{gap_block}
=== TÃ€I LIá»†U CÃ‚U Há»ŽI RETRIEVED (tá»« knowledge base) ===
{retrieved_block}

=== PHÃ‚N Bá»” CÃ‚U Há»ŽI Báº®T BUá»˜C ===
- {num_matching} cÃ¢u (60%) tá»« Ká»¸ NÄ‚NG KHá»šP: Há»i sÃ¢u ká»¹ nÄƒng á»©ng viÃªn ÄÃƒ CÃ“ theo JD â†’ Ä‘Ã¡nh giÃ¡ nÄƒng lá»±c thá»±c táº¿. DÃ¹ng source="rag_augmented".
- {num_gap} cÃ¢u (40%) tá»« Ká»¸ NÄ‚NG THIáº¾U: Há»i vá» ká»¹ nÄƒng á»©ng viÃªn CÃ’N THIáº¾U theo JD â†’ Ä‘Ã¡nh giÃ¡ tiá»m nÄƒng. DÃ¹ng source="gap_generated".

=== QUY Táº®C CHáº¤T LÆ¯á»¢NG CÃ‚U Há»ŽI (Báº®T BUá»˜C TUÃ‚N THá»¦) ===
1. Má»–I CÃ‚U CHá»ˆ Há»ŽI Má»˜T Váº¤N Äá»€ DUY NHáº¤T â€“ tuyá»‡t Ä‘á»‘i khÃ´ng gá»™p 2-3 Ã½ vÃ o 1 cÃ¢u.
2. ÄI THáº²NG VÃ€O Váº¤N Äá»€ â€“ khÃ´ng má»Ÿ Ä‘áº§u báº±ng ngá»¯ cáº£nh hay giá»›i thiá»‡u dÃ i dÃ²ng.
3. CÃ‚U Há»ŽI NGáº®N Gá»ŒN â€“ tá»‘i Ä‘a 2 cÃ¢u, dÆ°á»›i 50 tá»«.
4. Cá»¤ THá»‚ VÃ€ Ká»¸ THUáº¬T â€“ há»i vá» ká»¹ thuáº­t/cÃ´ng nghá»‡ cá»¥ thá»ƒ, trÃ¡nh há»i chung chung.
5. KHÃ”NG láº·p láº¡i Ã½ nghÄ©a giá»¯a cÃ¡c cÃ¢u há»i.

VÃ Dá»¤ Tá»T:
âœ… "Giáº£i thÃ­ch sá»± khÃ¡c biá»‡t giá»¯a useMemo vÃ  useCallback trong React."
âœ… "Báº¡n xá»­ lÃ½ N+1 query problem trong ORM nhÆ° tháº¿ nÃ o?"
âœ… "Khi nÃ o nÃªn dÃ¹ng index trong PostgreSQL vÃ  khi nÃ o khÃ´ng nÃªn?"

VÃ Dá»¤ Xáº¤U (TUYá»†T Äá»I KHÃ”NG Táº O KIá»‚U NÃ€Y):
âŒ "Trong dá»± Ã¡n thÆ°Æ¡ng máº¡i Ä‘iá»‡n tá»­, khi cáº§n xá»­ lÃ½ giá» hÃ ng, báº¡n Ä‘Ã£ dÃ¹ng React hooks nÃ o, táº¡i sao chá»n hooks Ä‘Ã³, vÃ  xá»­ lÃ½ performance ra sao?"
âŒ "HÃ£y cho biáº¿t kinh nghiá»‡m cá»§a báº¡n vá»›i Docker, báº¡n Ä‘Ã£ triá»ƒn khai CI/CD chÆ°a, vÃ  báº¡n dÃ¹ng orchestration tool nÃ o?"

=== NHIá»†M Vá»¤ ===
Dá»±a vÃ o tÃ i liá»‡u retrieved vÃ  thÃ´ng tin á»©ng viÃªn:
1. Chá»n lá»c vÃ  ÄIá»€U CHá»ˆNH cÃ¢u há»i phÃ¹ há»£p vá»›i profile vÃ  vá»‹ trÃ­.
2. Äiá»u chá»‰nh Ä‘á»™ khÃ³ phÃ¹ há»£p vá»›i cáº¥p Ä‘á»™ "{level}".
3. TuÃ¢n thá»§ ÄÃšNG tá»· lá»‡ {num_matching} cÃ¢u matching + {num_gap} cÃ¢u gap.
4. TuÃ¢n thá»§ ÄÃšNG quy táº¯c cháº¥t lÆ°á»£ng cÃ¢u há»i á»Ÿ trÃªn.

YÃŠU Cáº¦U OUTPUT:
- NgÃ´n ngá»¯: {lang_instruction}
- Sá»‘ lÆ°á»£ng: Ä‘Ãºng {num_q} cÃ¢u há»i
- Format: JSON array theo schema sau, KHÃ”NG cÃ³ markdown, KHÃ”NG cÃ³ text thá»«a:

Schema:
{_QUESTION_SCHEMA}

CHá»ˆ tráº£ vá» JSON array, tuyá»‡t Ä‘á»‘i khÃ´ng cÃ³ text thá»«a."""


    result = client.generate_json(prompt)

    if not isinstance(result, list) or len(result) == 0:
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

    return questions


def _fallback_from_raw_docs(raw_docs: list[RawDoc], num_q: int) -> list[Question]:
    """Fallback: trÃ­ch xuáº¥t cÃ¢u há»i thÃ´ tá»« tÃ i liá»‡u náº¿u LLM augment tháº¥t báº¡i."""
    questions = []
    for i, doc in enumerate(raw_docs[:num_q]):
        questions.append(Question(
            id=i,
            question=_extract_question(doc.document),
            reference=_extract_reference(doc.document),
            source="rag_augmented",
        ))
    return questions
