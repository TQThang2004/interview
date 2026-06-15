"""
Practice Controller – Xử lý logic request cho Quiz luyện tập.
"""
from __future__ import annotations

from app.services import practice_service


async def handle_get_topics() -> dict:
    """Trả về danh sách chủ đề luyện tập."""
    return {"topics": practice_service.PRACTICE_TOPICS}


async def handle_start_practice(
    user_id: str,
    topic: str,
    level: str,
    language: str,
    num_q: int,
) -> dict:
    """
    Bắt đầu bài kiểm tra:
    1. Lấy câu hỏi từ ChromaDB
    2. Tạo session trong DB
    3. Lưu tất cả câu hỏi vào practice_answers
    4. Trả về {session_id, questions[]} – KHÔNG trả reference
    """
    if topic not in practice_service.TOPIC_IDS:
        return {"error": f"Chủ đề '{topic}' không hợp lệ."}

    # Lấy câu hỏi từ ChromaDB
    questions = practice_service.get_practice_questions(topic, level, num_q)
    if not questions:
        return {"error": "Không tìm thấy câu hỏi cho chủ đề này. Vui lòng thử chủ đề khác."}

    # Tạo session
    session = await practice_service.create_session(user_id, topic, level, language, len(questions))
    session_id = session["id"]

    # Lưu từng câu hỏi
    question_items = []
    for i, q in enumerate(questions):
        answer_id = await practice_service.save_answer(
            session_id, q["question"], q["reference"], i
        )
        question_items.append({
            "answer_id": answer_id,
            "order": i,
            "question": q["question"],
            # reference KHÔNG trả về client
        })

    return {
        "session_id": session_id,
        "topic": topic,
        "level": level,
        "language": language,
        "num_questions": len(question_items),
        "questions": question_items,
    }


async def handle_submit_quiz(
    session_id: str,
    user_id: str,
    answers_input: list[dict],
    level: str,
    language: str,
) -> dict:
    """
    Phương án B: nộp toàn bộ bài 1 lần.
    Chấm điểm tất cả câu, trả về kết quả tổng hợp + chi tiết.
    """
    result = await practice_service.grade_quiz(
        session_id, user_id, answers_input, level, language
    )
    return result


async def handle_abandon_session(session_id: str, user_id: str) -> dict:
    ok = await practice_service.abandon_session(session_id, user_id)
    return {"status": "cancelled" if ok else "not_found"}


async def handle_get_sessions(user_id: str, limit: int, offset: int) -> dict:
    sessions = await practice_service.get_user_sessions(user_id, limit, offset)
    return {"sessions": sessions, "total": len(sessions)}


async def handle_get_detail(session_id: str, user_id: str) -> dict | None:
    return await practice_service.get_session_detail(session_id, user_id)


async def handle_get_stats(user_id: str) -> dict:
    stats = await practice_service.get_practice_stats(user_id)
    return {"stats": stats}


async def handle_delete_session(session_id: str, user_id: str) -> bool:
    return await practice_service.delete_session(session_id, user_id)
