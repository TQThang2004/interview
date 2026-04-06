from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware

from schemas.models import StartInterviewRequest, EvaluateAnswerRequest, TTSRequest
from services import audio_service, rag_service

app = FastAPI(title="AI Interviewer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend FastAPI is running"}

@app.post("/api/start-interview")
def start_interview(req: StartInterviewRequest):
    try:
        questions = rag_service.retrieve_rag_questions(req.topic, req.level, req.language)
        return {"status": "success", "questions": questions}
    except Exception as e:
        print(f"Error starting interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/evaluate")
def evaluate_answer(req: EvaluateAnswerRequest):
    try:
        result = rag_service.evaluate_rag_answer(
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
        text = audio_service.transcribe_audio_gemini(audio_bytes)
        return {"status": "success", "text": text}
    except Exception as e:
        print(f"Error transcribe audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tts")
def generate_tts(req: TTSRequest):
    try:
        audio_bytes = audio_service.generate_tts(req.text, req.language)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        print(f"Error TTS audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))
