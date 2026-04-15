"""
Pydantic schemas – định nghĩa cấu trúc request/response cho toàn bộ API.
"""
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class StartInterviewRequest(BaseModel):
    topic: str
    level: str
    language: str = "vi"


class EvaluateAnswerRequest(BaseModel):
    question: str
    reference: str
    answer: str
    level: str
    language: str = "vi"


class TTSRequest(BaseModel):
    text: str
    language: str = "vi"


# ---------------------------------------------------------------------------
# Response schemas (tùy chọn – dùng khi muốn type-check chặt response)
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
