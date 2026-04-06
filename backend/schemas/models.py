from pydantic import BaseModel

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
