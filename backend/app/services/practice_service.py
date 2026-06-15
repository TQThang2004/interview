"""
Practice Service â€“ Logic nghiá»‡p vá»¥ cho chá»©c nÄƒng Luyá»‡n táº­p theo Chá»§ Ä‘á» (Quiz).

Flow PhÆ°Æ¡ng Ã¡n B:
  1. start_practice(): láº¥y cÃ¢u há»i tá»« ChromaDB â†’ táº¡o session + lÆ°u answers
  2. submit_quiz():    cháº¥m Ä‘iá»ƒm tá»«ng cÃ¢u (evaluate_service) â†’ cáº­p nháº­t DB â†’ tráº£ káº¿t quáº£
  3. get_practice_stats(): thá»‘ng kÃª cho Dashboard

KhÃ´ng dÃ¹ng LLM augment â€“ cÃ¢u há»i láº¥y tháº³ng tá»« ChromaDB document.
"""
from __future__ import annotations

import random
import json
from typing import Optional

import chromadb
import google.generativeai as genai

from app.core.logging import get_logger
from app.core.config import (
    GOOGLE_API_KEY_EMBEDDING,
    EMBED_MODEL,
    CHROMA_DB_PATH,
    COLLECTION_NAME,
)
from app.database.connection import get_pool
from app.services.evaluate_service import evaluate_answer

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Danh sÃ¡ch chá»§ Ä‘á» há»— trá»£ (13 topics tá»« dataset)
# ---------------------------------------------------------------------------

PRACTICE_TOPICS = [
    {"id": "React",          "label": "React",          "icon": "atom",       "color": "oklch(70% 0.18 210)"},
    {"id": "JavaScript",     "label": "JavaScript",     "icon": "file-code",  "color": "oklch(80% 0.17 80)"},
    {"id": "Python",         "label": "Python",         "icon": "terminal",   "color": "oklch(73% 0.15 250)"},
    {"id": "Java",           "label": "Java",           "icon": "coffee",     "color": "oklch(65% 0.18 30)"},
    {"id": "SQL",            "label": "SQL",            "icon": "database",   "color": "oklch(68% 0.16 220)"},
    {"id": "NodeJS",         "label": "NodeJS",         "icon": "server",     "color": "oklch(72% 0.18 145)"},
    {"id": "Docker",         "label": "Docker",         "icon": "box",        "color": "oklch(65% 0.16 215)"},
    {"id": "Git",            "label": "Git",            "icon": "git-branch", "color": "oklch(65% 0.2 25)"},
    {"id": "OOP",            "label": "OOP",            "icon": "boxes",      "color": "oklch(70% 0.15 300)"},
    {"id": "Machine Learning","label": "Machine Learning","icon": "brain",    "color": "oklch(72% 0.16 175)"},
    {"id": "System Design",  "label": "System Design",  "icon": "network",    "color": "oklch(68% 0.17 260)"},
    {"id": "Spring",         "label": "Spring",         "icon": "leaf",       "color": "oklch(70% 0.2 145)"},
    {"id": "Data Analysis",  "label": "Data Analysis",  "icon": "bar-chart-3","color": "oklch(72% 0.14 180)"},
]

TOPIC_IDS = {t["id"] for t in PRACTICE_TOPICS}


# ---------------------------------------------------------------------------
# Helpers â€“ ChromaDB
# ---------------------------------------------------------------------------

def _get_collection():
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    return client.get_collection(COLLECTION_NAME)


def _extract_question(document: str) -> str:
    """TrÃ­ch xuáº¥t cÃ¢u há»i tá»« page_content ChromaDB."""
    for line in document.split("\n"):
        stripped = line.strip()
        if stripped.startswith("CÃ¢u há»i:"):
            return stripped.split(":", 1)[1].strip()
    # fallback: dÃ²ng 2
    lines = [l.strip() for l in document.split("\n") if l.strip()]
    return lines[1] if len(lines) > 1 else document[:200]


def _extract_reference(document: str) -> str:
    """TrÃ­ch xuáº¥t cÃ¢u tráº£ lá»i tham kháº£o tá»« page_content ChromaDB."""
    lines = document.split("\n")
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("Tráº£ lá»i:"):
            # Láº¥y pháº§n cÃ²n láº¡i cá»§a dÃ²ng nÃ y + cÃ¡c dÃ²ng káº¿ tiáº¿p
            first_part = stripped.split(":", 1)[1].strip()
            rest = "\n".join(l.strip() for l in lines[i + 1:] if l.strip())
            return (first_part + "\n" + rest).strip()
    return ""


# ---------------------------------------------------------------------------
# Public: Láº¥y cÃ¢u há»i tá»« ChromaDB
# ---------------------------------------------------------------------------

def get_practice_questions(topic: str, level: str, num_q: int) -> list[dict]:
    """
    Truy váº¥n ChromaDB láº¥y cÃ¢u há»i theo chá»§ Ä‘á».
    DÃ¹ng where filter theo metadata.instruction == topic.
    Tráº£ vá» list[{question, reference}].
    """
    if topic not in TOPIC_IDS:
        return []

    collection = _get_collection()

    # Embed query
    query_text = f"{topic} technical interview questions"
    genai.configure(api_key=GOOGLE_API_KEY_EMBEDDING)
    try:
        embed_result = genai.embed_content(
            model=EMBED_MODEL,
            content=query_text,
            task_type="retrieval_query",
        )
        query_embedding = embed_result["embedding"]
        if isinstance(query_embedding[0], float):
            query_embeddings = [query_embedding]
        else:
            query_embeddings = query_embedding
    except Exception as e:
        logger.warning("Failed to embed practice query: %s", e)
        return []

    # Query vá»›i filter theo topic
    fetch_n = min(num_q * 4, 100)
    try:
        results = collection.query(
            query_embeddings=query_embeddings,
            n_results=fetch_n,
            where={"instruction": topic},
            include=["documents", "metadatas", "distances"],
        )
    except Exception as e:
        # Náº¿u where filter lá»—i, fallback khÃ´ng filter
        logger.warning("Practice query with topic filter failed, retrying without filter: %s", e)
        try:
            results = collection.query(
                query_embeddings=query_embeddings,
                n_results=fetch_n,
                include=["documents", "metadatas", "distances"],
            )
        except Exception as e2:
            logger.warning("Practice fallback query failed: %s", e2)
            return []

    docs = results["documents"][0] if results["documents"] else []
    metas = results["metadatas"][0] if results["metadatas"] else []

    questions = []
    seen_questions = set()

    for doc, meta in zip(docs, metas):
        # Æ¯u tiÃªn docs Ä‘Ãºng topic
        doc_topic = meta.get("instruction", "")
        if doc_topic != topic:
            continue
        q_text = _extract_question(doc)
        ref_text = _extract_reference(doc)
        if not q_text or q_text in seen_questions:
            continue
        seen_questions.add(q_text)
        questions.append({"question": q_text, "reference": ref_text})

    random.shuffle(questions)
    return questions[:num_q]


def get_rag_status() -> dict:
    expected_topics = sorted(TOPIC_IDS)
    try:
        collection = _get_collection()
        result = collection.get(include=["metadatas"])
        metadatas = result.get("metadatas", [])
    except Exception as exc:
        return {
            "status": "error",
            "error": str(exc),
            "total_vectors": 0,
            "topics": {},
            "missing_topics": expected_topics,
        }

    topics: dict[str, int] = {}
    for meta in metadatas:
        topic = meta.get("instruction", "") if meta else ""
        topics[topic] = topics.get(topic, 0) + 1

    missing = [topic for topic in expected_topics if topics.get(topic, 0) == 0]
    return {
        "status": "success",
        "total_vectors": len(metadatas),
        "topics": dict(sorted(topics.items())),
        "missing_topics": missing,
        "collection_name": COLLECTION_NAME,
        "chroma_path": CHROMA_DB_PATH,
    }


# ---------------------------------------------------------------------------
# CRUD â€“ practice_sessions
# ---------------------------------------------------------------------------

async def create_session(
    user_id: str, topic: str, level: str, language: str, num_q: int
) -> dict:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO practice_sessions
                (user_id, topic, level, language, num_questions, status)
            VALUES ($1, $2, $3, $4, $5, 'in_progress')
            RETURNING id::text, topic, level, language, num_questions, status, started_at
            """,
            user_id, topic, level, language, num_q,
        )
    return dict(row)


async def save_answer(
    session_id: str, question_text: str, reference_answer: str, order: int
) -> str:
    """LÆ°u cÃ¢u há»i vÃ o practice_answers. Tráº£ vá» answer_id."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO practice_answers
                (session_id, question_text, reference_answer, question_order)
            VALUES ($1, $2, $3, $4)
            RETURNING id::text
            """,
            session_id, question_text, reference_answer, order,
        )
    return row["id"]


async def update_answer(
    answer_id: str, user_answer: str, ai_evaluation: str, score: float
) -> bool:
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            """
            UPDATE practice_answers
            SET user_answer   = $2,
                ai_evaluation = $3,
                score         = $4,
                answered_at   = NOW()
            WHERE id = $1
            """,
            answer_id, user_answer, ai_evaluation, score,
        )
    return result == "UPDATE 1"


async def complete_session(
    session_id: str, user_id: str, overall_score: float, correct_count: int
) -> Optional[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE practice_sessions
            SET status        = 'completed',
                overall_score = $3,
                correct_count = $4,
                completed_at  = NOW()
            WHERE id = $1 AND user_id = $2
            RETURNING id::text, topic, level, overall_score, correct_count,
                      num_questions, status, completed_at
            """,
            session_id, user_id, overall_score, correct_count,
        )
    return dict(row) if row else None


async def abandon_session(session_id: str, user_id: str) -> bool:
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            """
            UPDATE practice_sessions
            SET status = 'cancelled', completed_at = NOW()
            WHERE id = $1 AND user_id = $2 AND status = 'in_progress'
            """,
            session_id, user_id,
        )
    return result != "UPDATE 0"


async def delete_session(session_id: str, user_id: str) -> bool:
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM practice_sessions WHERE id = $1 AND user_id = $2",
            session_id, user_id,
        )
    return result != "DELETE 0"


async def get_user_sessions(user_id: str, limit: int = 20, offset: int = 0) -> list[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id::text, topic, level, language, num_questions,
                   status, overall_score, correct_count, started_at, completed_at
            FROM practice_sessions
            WHERE user_id = $1
            ORDER BY started_at DESC
            LIMIT $2 OFFSET $3
            """,
            user_id, limit, offset,
        )
    return [dict(r) for r in rows]


async def get_session_detail(session_id: str, user_id: str) -> Optional[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        session = await conn.fetchrow(
            """
            SELECT id::text, topic, level, language, num_questions,
                   status, overall_score, correct_count, started_at, completed_at
            FROM practice_sessions
            WHERE id = $1 AND user_id = $2
            """,
            session_id, user_id,
        )
        if not session:
            return None
        answers = await conn.fetch(
            """
            SELECT id::text, question_text, reference_answer, user_answer,
                   ai_evaluation, score, question_order, asked_at, answered_at
            FROM practice_answers
            WHERE session_id = $1
            ORDER BY question_order ASC
            """,
            session_id,
        )
    result = dict(session)
    result["answers"] = [dict(a) for a in answers]
    return result


async def get_practice_stats(user_id: str) -> list[dict]:
    """Thá»‘ng kÃª luyá»‡n táº­p theo chá»§ Ä‘á» cho Dashboard."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                topic,
                COUNT(*) AS total_sessions,
                ROUND(AVG(overall_score)::numeric, 1) AS avg_score,
                MAX(overall_score) AS best_score,
                MAX(completed_at) AS last_practiced
            FROM practice_sessions
            WHERE user_id = $1 AND status = 'completed'
            GROUP BY topic
            ORDER BY last_practiced DESC NULLS LAST
            """,
            user_id,
        )
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Cháº¥m Ä‘iá»ƒm quiz (PhÆ°Æ¡ng Ã¡n B: ná»™p táº¥t cáº£ 1 láº§n)
# ---------------------------------------------------------------------------

async def grade_quiz(
    session_id: str,
    user_id: str,
    answers_input: list[dict],
    level: str,
    language: str,
) -> dict:
    """
    Cháº¥m Ä‘iá»ƒm táº¥t cáº£ cÃ¢u tráº£ lá»i, cáº­p nháº­t DB, hoÃ n thÃ nh session.

    answers_input: [{answer_id, user_answer}, ...]
    Tráº£ vá» káº¿t quáº£ tá»•ng há»£p vá»›i chi tiáº¿t tá»«ng cÃ¢u.
    """
    pool = await get_pool()

    # Láº¥y táº¥t cáº£ answers cá»§a session (Ä‘á»ƒ cÃ³ question_text + reference)
    async with pool.acquire() as conn:
        db_answers = await conn.fetch(
            """
            SELECT id::text, question_text, reference_answer, question_order
            FROM practice_answers
            WHERE session_id = $1
            ORDER BY question_order ASC
            """,
            session_id,
        )

    # Build map answer_id â†’ db record
    db_map = {row["id"]: dict(row) for row in db_answers}

    # XÃ¢y dict user_answer tá»« input
    user_map = {a["answer_id"]: a.get("user_answer", "").strip() for a in answers_input}

    graded_results = []
    all_scores = []

    for db_row in sorted(db_map.values(), key=lambda r: r["question_order"]):
        aid = db_row["id"]
        question_text = db_row["question_text"]
        reference = db_row["reference_answer"] or ""
        user_ans = user_map.get(aid, "").strip()

        # Cháº¥m Ä‘iá»ƒm báº±ng evaluate_service (tÃ¡i sá»­ dá»¥ng)
        try:
            eval_result = evaluate_answer(
                question=question_text,
                user_answer=user_ans if user_ans else "(Bá» qua)",
                reference=reference,
                level=level,
                language=language,
            )
            score = eval_result.score
            eval_dict = eval_result.to_dict()
        except Exception as e:
            logger.exception("Failed to grade practice answer")
            score = 0.0
            eval_dict = {"score": 0.0, "score_str": "0/10", "strengths": "", "weaknesses": "", "suggestions": ""}

        all_scores.append(score)
        eval_json = json.dumps(eval_dict, ensure_ascii=False)

        # Cáº­p nháº­t DB
        await update_answer(aid, user_ans or "(Bá» qua)", eval_json, score)

        graded_results.append({
            "answer_id": aid,
            "question": question_text,
            "user_answer": user_ans or "(Bá» qua)",
            "reference_answer": reference,
            "score": score,
            "score_str": eval_dict.get("score_str", f"{score}/10"),
            "strengths": eval_dict.get("strengths", ""),
            "weaknesses": eval_dict.get("weaknesses", ""),
            "suggestions": eval_dict.get("suggestions", ""),
            "order": db_row["question_order"],
        })

    # TÃ­nh Ä‘iá»ƒm tá»•ng
    overall = round(sum(all_scores) / len(all_scores), 2) if all_scores else 0.0
    correct_count = sum(1 for s in all_scores if s >= 6.0)

    # HoÃ n thÃ nh session
    await complete_session(session_id, user_id, overall, correct_count)

    return {
        "session_id": session_id,
        "overall_score": overall,
        "correct_count": correct_count,
        "total_questions": len(graded_results),
        "results": sorted(graded_results, key=lambda r: r["order"]),
    }
