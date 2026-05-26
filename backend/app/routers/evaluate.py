"""
Router: Evaluate – POST /api/evaluate
"""
from fastapi import APIRouter, HTTPException

from app.controllers import evaluate_controller
from app.schemas.interview_schemas import EvaluateAnswerRequest

router = APIRouter(prefix="/api", tags=["Evaluate"])


@router.post("/evaluate")
def evaluate_answer(req: EvaluateAnswerRequest):
    try:
        return evaluate_controller.handle_evaluate_answer(req)
    except Exception as e:
        print(f"[Router] Error /evaluate: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import File, UploadFile
from app.core.constants import ALLOWED_CV_MIME_TYPES, ALLOWED_CV_EXTENSIONS

@router.post("/evaluate/cv")
async def evaluate_cv(cv: UploadFile = File(...)):
    if cv is None or cv.filename == "":
        raise HTTPException(status_code=422, detail="CV là bắt buộc.")
    
    is_pdf_mime = cv.content_type in ALLOWED_CV_MIME_TYPES
    is_pdf_ext  = (cv.filename or "").lower().endswith(ALLOWED_CV_EXTENSIONS)
    if not (is_pdf_mime or is_pdf_ext):
        raise HTTPException(status_code=422, detail="Chỉ hỗ trợ file PDF.")
        
    try:
        return await evaluate_controller.handle_evaluate_cv_file(cv)
    except Exception as e:
        print(f"[Router] Error /evaluate/cv: {e}")
        raise HTTPException(status_code=500, detail=str(e))
