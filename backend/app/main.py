"""
FastAPI application factory – đăng ký middleware và routers.
"""
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.routers import interview, evaluate, audio, auth
from app.database.connection import get_pool, close_pool

# Fix lỗi in Tiếng Việt trên Windows (charmap codec can't encode character)
if sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# Các origin được phép (thêm origin production khi deploy)
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]


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
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global exception handler – đảm bảo mọi lỗi 500 đều có CORS header ───────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[Error] Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Lỗi máy chủ nội bộ, vui lòng thử lại."},
    )


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def read_root():
    return {"status": "ok", "message": "Backend FastAPI is running"}


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(interview.router)
app.include_router(evaluate.router)
app.include_router(audio.router)
