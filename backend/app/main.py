"""
FastAPI application factory – đăng ký middleware, routers và exception handlers.
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

# Cấu hình logging khi khởi động
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Thử kết nối DB pool khi start. Không crash nếu DB chưa sẵn sàng."""
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
    description="Backend API cho hệ thống phỏng vấn AI tích hợp RAG + Gemini.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS phải được đăng ký TRƯỚC mọi thứ khác ────────────────────────────────
register_cors(app)

# ── Exception handlers ────────────────────────────────────────────────────────
register_exception_handlers(app)

# ── Static Files ──────────────────────────────────────────────────────────────
upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../uploads"))
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def read_root():
    return {"status": "ok", "message": "Backend FastAPI is running"}


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(interview.router)
app.include_router(evaluate.router)
app.include_router(audio.router)
app.include_router(history.router)
app.include_router(admin.router)
app.include_router(community.router)
app.include_router(upload.router)
app.include_router(practice.router)
