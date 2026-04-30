"""
RAG Service – Facade / backward-compatibility layer.

File này KHÔNG chứa logic nữa. Nó re-export các public function
từ các module chuyên biệt để các module cũ import không bị vỡ.

Kiến trúc mới:
  rag_generator.py  → generate_questions_from_cv_jd()  (orchestrate R→A→G)
  rag_retriever.py  → retrieve_raw_docs()               (Bước R)
  rag_augmentor.py  → extract_cv_jd_context(),
                       augment_questions()              (Bước A)
  evaluate_service.py → evaluate_answer()               (chấm điểm)
  llm_client.py     → GeminiClient, parse_json_safely  (helper chung)
"""

# Re-export để backward compat (các import cũ không cần sửa)
from app.services.rag_generator import generate_questions_from_cv_jd  # noqa: F401
from app.services.evaluate_service import evaluate_answer              # noqa: F401

# Alias để giữ API cũ (evaluate_controller.py gọi evaluate_rag_answer)
evaluate_rag_answer = evaluate_answer

__all__ = [
    "generate_questions_from_cv_jd",
    "evaluate_answer",
    "evaluate_rag_answer",
]
