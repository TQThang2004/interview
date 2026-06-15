"""
History Controller â€“ nháº­n request, gá»i interview_service, format response.

Xá»­ lÃ½ CRUD lá»‹ch sá»­ phá»ng váº¥n.
"""
from typing import Optional

from app.services import interview_service


async def handle_create_interview(user_id: str, topic: str, level: str, language: str) -> dict:
    interview = await interview_service.create_interview(user_id, topic, level, language)
    return {"status": "success", "interview": interview}


async def handle_list_interviews(user_id: str, limit: int, offset: int) -> dict:
    interviews = await interview_service.get_user_interviews(user_id, limit, offset)
    return {"status": "success", "interviews": interviews}


async def handle_get_interview(interview_id: str, user_id: str) -> dict | None:
    detail = await interview_service.get_interview_detail(interview_id, user_id)
    if not detail:
        return None
    return {"status": "success", "interview": detail}


async def handle_complete_interview(
    interview_id: str,
    user_id: str,
    overall_score: Optional[float],
    overall_feedback: Optional[str],
) -> dict | None:
    updated = await interview_service.complete_interview(
        interview_id, user_id, overall_score, overall_feedback
    )
    if not updated:
        return None
    return {"status": "success", "interview": updated}


async def handle_abandon_interview(interview_id: str, user_id: str) -> dict:
    kept = await interview_service.abandon_interview(interview_id, user_id)
    return {"status": "success", "kept": kept}


async def handle_delete_interview(interview_id: str, user_id: str) -> bool:
    return await interview_service.delete_interview(interview_id, user_id)


async def handle_save_question(
    interview_id: str, user_id: str, question_text: str, question_order: int
) -> dict:
    q_id = await interview_service.save_question(interview_id, user_id, question_text, question_order)
    if not q_id:
        return {"status": "not_found"}
    return {"status": "success", "question_id": q_id}


async def handle_update_answer(
    interview_id: str, question_id: str, user_id: str, user_answer: str, ai_evaluation: str, score: float
) -> bool:
    return await interview_service.update_question_answer(
        interview_id, question_id, user_id, user_answer, ai_evaluation, score
    )
