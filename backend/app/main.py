"""
FastAPI application factory – đăng ký middleware, routers và exception handlers.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.routers import interview, evaluate, audio, auth, history, admin, community
from app.database.connection import get_pool, close_pool
from app.middlewares.cors import register_cors
from app.exceptions.handlers import register_exception_handlers
from app.core.logging import setup_logging

# Cấu hình logging khi khởi động
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Thử kết nối DB pool khi start. Không crash nếu DB chưa sẵn sàng."""
    try:
        await get_pool()
        print("[Startup] Kết nối PostgreSQL thành công.")
    except Exception as exc:
        print(f"[Startup WARNING] Không thể kết nối PostgreSQL: {exc}")
        print("[Startup WARNING] Các chức năng Auth sẽ không hoạt động cho đến khi DB sẵn sàng.")
    yield
    print("[Shutdown] Đang đóng kết nối DB...")
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
