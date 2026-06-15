"""
FastAPI application factory â€“ Ä‘Äƒng kÃ½ middleware, routers vÃ  exception handlers.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

from app.routers import interview, evaluate, audio, auth, history, admin, community, upload, practice
from app.database.connection import get_pool, close_pool
from app.middlewares.cors import register_cors
from app.exceptions.handlers import register_exception_handlers
from app.core.logging import setup_logging, get_logger

# Cáº¥u hÃ¬nh logging khi khá»Ÿi Ä‘á»™ng
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Thá»­ káº¿t ná»‘i DB pool khi start. KhÃ´ng crash náº¿u DB chÆ°a sáºµn sÃ ng."""
    try:
        await get_pool()
        logger.info("PostgreSQL connection ready.")
    except Exception as exc:
        logger.warning("PostgreSQL connection failed on startup: %s", exc)
        logger.warning("Auth-related features will be unavailable until the database is ready.")
    yield
    logger.info("Closing database pool.")
    await close_pool()


app = FastAPI(
    title="AI Interviewer API",
    description="Backend API cho há»‡ thá»‘ng phá»ng váº¥n AI tÃ­ch há»£p RAG + Gemini.",
    version="1.0.0",
    lifespan=lifespan,
)

# â”€â”€ CORS pháº£i Ä‘Æ°á»£c Ä‘Äƒng kÃ½ TRÆ¯á»šC má»i thá»© khÃ¡c â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
register_cors(app)

# â”€â”€ Exception handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
register_exception_handlers(app)

# â”€â”€ Static Files â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../uploads"))
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")


# â”€â”€ Health check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@app.get("/", tags=["Health"])
def read_root():
    return {"status": "ok", "message": "Backend FastAPI is running"}


# â”€â”€ Routers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.include_router(auth.router)
app.include_router(interview.router)
app.include_router(evaluate.router)
app.include_router(audio.router)
app.include_router(history.router)
app.include_router(admin.router)
app.include_router(community.router)
app.include_router(upload.router)
app.include_router(practice.router)
