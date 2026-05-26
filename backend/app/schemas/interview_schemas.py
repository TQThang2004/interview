"""
Interview Schemas – Pydantic schemas cho các API phỏng vấn và lịch sử.

Bao gồm: StartInterview, Evaluate, Audio, History CRUD.
"""
from typing import Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Interview Start
# ---------------------------------------------------------------------------

class StartInterviewRequest(BaseModel):
    topic: str
    level: str
    language: str = "vi"


# ---------------------------------------------------------------------------
# Evaluate
# ---------------------------------------------------------------------------

class EvaluateAnswerRequest(BaseModel):
    question: str
    reference: str
    answer: str
    level: str
    language: str = "vi"


# ---------------------------------------------------------------------------
# Audio / TTS
# ---------------------------------------------------------------------------

class TTSRequest(BaseModel):
    text: str
    language: str = "vi"


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class QuestionItem(BaseModel):
    id: int
    question: str
    reference: str


class EvaluationResult(BaseModel):
    score: float
    score_str: str
    strengths: str
    weaknesses: str
    suggestions: str


# ---------------------------------------------------------------------------
# History CRUD (dùng trong routers/history.py)
# ---------------------------------------------------------------------------

class CreateInterviewBody(BaseModel):
    topic: str
    level: str
    language: str = "vi"


class CompleteInterviewBody(BaseModel):
    overall_score: Optional[float] = None
    overall_feedback: Optional[str] = None


class SaveQuestionBody(BaseModel):
    question_text: str
    question_order: int


class UpdateAnswerBody(BaseModel):
    user_answer: str
    ai_evaluation: str
    score: float = 0.0  # Bắt buộc là float, default 0.0 (không dùng None để tránh bug ghi đè điểm)
