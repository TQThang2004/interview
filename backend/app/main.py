"""
FastAPI application factory – đăng ký middleware và routers.
"""
import sys
from fastapi import FastAPI

from app.middleware.cors import register_cors
from app.routers import interview, evaluate, audio

# Fix lỗi in Tiếng Việt trên Windows (charmap codec can't encode character)
if sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

app = FastAPI(
    title="AI Interviewer API",
    description="Backend API cho hệ thống phỏng vấn AI tích hợp RAG + Gemini.",
    version="1.0.0",
)

# Middleware
register_cors(app)

# Health check
@app.get("/", tags=["Health"])
def read_root():
    return {"status": "ok", "message": "Backend FastAPI is running"}

# Routers
app.include_router(interview.router)
app.include_router(evaluate.router)
app.include_router(audio.router)
