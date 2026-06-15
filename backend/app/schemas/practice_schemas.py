"""
Practice Schemas – Pydantic schemas cho API luyện tập theo chủ đề (quiz).
"""
from typing import Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request bodies
# ---------------------------------------------------------------------------

class StartPracticeBody(BaseModel):
    topic: str
    level: str = "Junior"
    language: str = "vi"
    num_questions: int = Field(default=5, ge=5, le=15)


class SubmitQuizBody(BaseModel):
    """
    Body khi ứng viên nộp toàn bộ bài kiểm tra (Phương án B).
    answers: list của {answer_id: str, user_answer: str}
    """
    answers: list[dict]   # [{answer_id, user_answer}, ...]


# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------

class PracticeQuestionItem(BaseModel):
    answer_id: str    # ID trong bảng practice_answers (để submit)
    order: int
    question: str
    # KHÔNG trả về reference ở đây – chỉ trả về sau khi nộp


class PracticeSessionInfo(BaseModel):
    session_id: str
    topic: str
    level: str
    language: str
    num_questions: int
    questions: list[PracticeQuestionItem]
