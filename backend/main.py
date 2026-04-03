from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import rag_services

app = FastAPI(title="AI Interviewer API")

# Cau hinh CORS cho phep React gọi API 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Cho phep tat ca domain trong qua trinh phat trien POC
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend FastAPI is running"}

@app.post("/api/start-interview")
def start_interview(req: StartInterviewRequest):
    try:
        # Lay cau hoi tu DB thong qua RAG + GenAI + Translate if vi
        questions = rag_services.retrieve_rag_questions(req.topic, req.level, req.language)
        return {"status": "success", "questions": questions}
    except Exception as e:
        print(f"Error starting interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/evaluate")
def evaluate_answer(req: EvaluateAnswerRequest):
    try:
        # Truyen len AI danh gia
        result = rag_services.evaluate_rag_answer(
            req.question, req.answer, req.reference, req.level, req.language
        )
        return {"status": "success", "evaluation": result}
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        text = rag_services.transcribe_audio_gemini(audio_bytes)
        return {"status": "success", "text": text}
    except Exception as e:
        print(f"Error transcribe audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tts")
def generate_tts(req: TTSRequest):
    try:
        audio_bytes = rag_services.generate_tts(req.text, req.language)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        print(f"Error TTS audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))
