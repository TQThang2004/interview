"""
RAG Service – tạo câu hỏi phỏng vấn và chấm điểm câu trả lời của ứng viên.

Flow:
  1. generate_questions_from_cv_jd()
       └─> retrieve_rag_questions()   # lấy câu hỏi từ ChromaDB
       └─> LLM custom questions       # sinh câu hỏi từ CV/JD
  2. evaluate_rag_answer()            # chấm điểm & nhận xét
"""
import json
import random
import time

import chromadb
import google.generativeai as genai

from app.config import (
    GOOGLE_API_KEY,
    LLM_MODEL,
    EMBED_MODEL,
    CHROMA_DB_PATH,
    COLLECTION_NAME,
    TOP_K_RETRIEVE,
    NUM_QUESTIONS,
    LLM_RETRY_WAIT,
)

genai.configure(api_key=GOOGLE_API_KEY)


# ---------------------------------------------------------------------------
# Helpers nội bộ
# ---------------------------------------------------------------------------

def _get_llm():
    return genai.GenerativeModel(LLM_MODEL)


def _get_collection():
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    return client.get_collection(COLLECTION_NAME)


def _llm_call_with_retry(llm, prompt: str, max_retries: int = 3) -> str:
    """Gọi LLM với cơ chế retry khi bị rate-limit (429)."""
    for attempt in range(1, max_retries + 1):
        try:
            response = llm.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err or "quota" in err.lower():
                wait = LLM_RETRY_WAIT * attempt
                print(f"[RagService] Rate limit – chờ {wait}s rồi thử lại (lần {attempt}/{max_retries})...")
                time.sleep(wait)
            else:
                print(f"[RagService] Lỗi LLM: {err[:120]}")
                return "(Lỗi hệ thống LLM. Không thể thực hiện vào lúc này.)"
    return "(Vượt quá số lần thử tối đa của LLM API.)"


def _extract_question(document: str) -> str:
    for line in document.split("\n"):
        if line.startswith("Cau hoi:") or line.startswith("Câu hỏi:"):
            return line.split(":", 1)[1].strip()
    lines = [l.strip() for l in document.split("\n") if l.strip()]
    return lines[1] if len(lines) > 1 else document[:200]


def _extract_reference_answer(document: str) -> str:
    for line in document.split("\n"):
        if line.startswith("Tra loi:") or line.startswith("Trả lời:"):
            return line.split(":", 1)[1].strip()
    return ""


def _parse_json_safely(raw: str) -> list | None:
    """Làm sạch và parse JSON từ output LLM (có thể có markdown block thừa)."""
    cleaned = raw.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    try:
        return json.loads(cleaned.strip())
    except Exception as e:
        print(f"[RagService] Lỗi parse JSON: {e}")
        return None


# ---------------------------------------------------------------------------
# Public functions
# ---------------------------------------------------------------------------

def retrieve_rag_questions(
    topic: str,
    level: str,
    language: str = "vi",
    num_q: int = NUM_QUESTIONS,
) -> list[dict]:
    """
    Truy vấn ChromaDB để lấy câu hỏi phỏng vấn liên quan đến topic/level.
    Ưu tiên câu hỏi đúng level, fallback sang các câu hỏi khác level nếu thiếu.
    """
    collection = _get_collection()
    query_text = f"Interview questions about {topic.replace(' interview question', '')}"
    query_emb = genai.embed_content(
        model=EMBED_MODEL,
        content=query_text,
        task_type="retrieval_query",
    )["embedding"]

    try:
        results = collection.query(
            query_embeddings=[query_emb],
            n_results=TOP_K_RETRIEVE,
            include=["documents", "metadatas", "distances"],
        )
    except Exception as e:
        print(f"[RagService] RAG Query error: {e}")
        return []

    valid_candidates: list[dict] = []
    fallback_candidates: list[dict] = []

    for doc, meta, _dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        entry = {"document": doc}
        if level.lower() in meta.get("level", "").lower():
            valid_candidates.append(entry)
        else:
            fallback_candidates.append(entry)

    random.shuffle(valid_candidates)
    random.shuffle(fallback_candidates)

    selected = valid_candidates[:num_q]
    if len(selected) < num_q:
        needed = num_q - len(selected)
        selected.extend(fallback_candidates[:needed])

    print("\n" + "-" * 50)
    print(f">>> [LOG] NỘI DUNG TÀI LIỆU LẤY ĐƯỢC TỪ RAG (TOP {len(selected)} TÀI LIỆU):")
    for i, c in enumerate(selected):
        preview = c["document"].replace("\n", " ")
        print(f"--- RAG Doc {i+1} ---\n{preview[:300]}...\n")

    formatted: list[dict] = [
        {
            "id": i,
            "question": _extract_question(c["document"]),
            "reference": _extract_reference_answer(c["document"]),
        }
        for i, c in enumerate(selected)
    ]

    print(">>> [LOG] CÁC CÂU HỎI CHỌN TỪ RAG:")
    for q in formatted:
        print(f"  - {q['question']}")

    if language == "vi":
        llm = _get_llm()
        translate_prompt = (
            "Dich toan bo cau hoi va cau tra loi sau sang Tiếng Việt mot cach chuyen nghiep. "
            "GIU NGUYEN cac thuat ngu ky thuat IT (khong dich bừa). "
            "Ban PHAI tra ve DUNG DINH DANG JSON LIST cua nguyen ban, "
            "va tuyet doi KHONG DUNG ky tu markdown (```json).\n\n"
            + json.dumps(formatted, ensure_ascii=False)
        )
        raw_translated = _llm_call_with_retry(llm, translate_prompt)
        parsed = _parse_json_safely(raw_translated)
        if parsed is not None:
            return parsed
        print("[RagService] Dùng câu hỏi chưa dịch vì lỗi parse JSON.")

    return formatted


def generate_questions_from_cv_jd(
    cv_text: str,
    jd_text: str,
    level: str,
    language: str = "vi",
) -> list[dict]:
    """
    Sinh danh sách câu hỏi phỏng vấn dựa trên CV và JD của ứng viên.
    Kết hợp: 5 câu hỏi từ RAG + 2 câu hỏi tùy chỉnh từ LLM.
    """
    llm = _get_llm()

    if not cv_text.strip() and not jd_text.strip():
        return retrieve_rag_questions(
            "software development core knowledge interview questions",
            level, language, num_q=NUM_QUESTIONS
        )

    # Bước 1: Trích xuất chủ đề kỹ năng từ CV/JD
    prompt_extract = (
        "Trích xuất tóm tắt ngắn gọn các kỹ năng công nghệ chính, framework hoặc domain "
        "mà ứng viên sử dụng (ví dụ: 'ReactJS, MongoDB, Fullstack', 'Python Data Analysis', "
        "'Java Spring Boot').\n"
        f"CV: {cv_text[:2000]}\n"
        f"JD: {jd_text[:1000]}\n\n"
        "Yêu cầu xuất ra MỘT cụm từ tiếng Anh ngắn gọn chứa các keyword đó KHÔNG GIẢI THÍCH:"
    )
    print("\n" + "=" * 60)
    print(">>> [LOG] 1. PROMPT TRÍCH XUẤT THÔNG TIN TỪ CV VÀ JD:")
    print(prompt_extract)

    topic_raw = _llm_call_with_retry(llm, prompt_extract)
    print("\n>>> [LOG] 2. THÔNG TIN TRÍCH XUẤT ĐƯỢC (CV/JD SKILLS):")
    print(topic_raw)

    topic = topic_raw.strip().replace("'", "").replace('"', "")
    if not topic:
        topic = "software engineering core skills"
    topic = f"Interview questions about {topic}"

    # Bước 2: Lấy 5 câu hỏi từ RAG
    rag_questions = retrieve_rag_questions(topic, level, language, num_q=NUM_QUESTIONS)

    # Bước 3: Sinh 2 câu hỏi tùy chỉnh từ LLM dựa vào CV/JD
    lang_req = "Tiếng Việt" if language == "vi" else "English"
    prompt_custom = (
        f"Bạn là một người phỏng vấn chuyên nghiệp. Ứng viên đang phỏng vấn cho vị trí '{level}'.\n"
        f"CV: {cv_text[:3000]}\n"
        f"JD: {jd_text[:1500]}\n\n"
        f"Dựa vào kinh nghiệm, công nghệ, hoặc các dự án trong CV/JD, hãy tạo 2 câu hỏi phỏng vấn "
        f"kỹ thuật thực tế bằng {lang_req}.\n"
        "BẮT BUỘC trả về CHÍNH XÁC một JSON array (không markdown, không text thừa):\n"
        '[\n'
        '  {"question": "Câu hỏi 1", "reference": "Gợi ý trả lời 1"},\n'
        '  {"question": "Câu hỏi 2", "reference": "Gợi ý trả lời 2"}\n'
        ']'
    )
    print("\n" + "=" * 60)
    print(">>> [LOG] 3. PROMPT TẠO CÂU HỎI TÙY CHỈNH TỪ CV/JD:")
    print(prompt_custom)

    custom_raw = _llm_call_with_retry(llm, prompt_custom)
    print("\n>>> [LOG] 4. KẾT QUẢ TỪ LLM (CÂU HỎI TẠO TỪ CV/JD):")
    print(custom_raw)

    custom_qs = _parse_json_safely(custom_raw)
    if custom_qs:
        for q in custom_qs:
            rag_questions.append({
                "id": len(rag_questions),
                "question": q["question"],
                "reference": q["reference"],
            })
    else:
        print("[RagService] Bỏ qua câu hỏi tùy chỉnh do lỗi parse JSON.")

    return rag_questions


def evaluate_rag_answer(
    question: str,
    user_answer: str,
    reference: str,
    level: str,
    language: str = "vi",
) -> dict:
    """
    Dùng LLM để chấm điểm và nhận xét câu trả lời của ứng viên.
    Trả về dict với: score, score_str, strengths, weaknesses, suggestions.
    """
    llm = _get_llm()
    vinglish_note = ""
    if language == "vi":
        vinglish_note = (
            "CHU Y DAC BIET TRAM TRONG: Ung vien dang tra loi bang giong noi va dung Tieng Viet pha "
            "Tieng Anh IT (Vinglish). Google speech to text co the viet sai chinh ta cac tu tieng anh "
            "(vd: ri ac, not di et, da ta day, pho ram guoc, code, push). "
            "BAN TUYET DOI KHONG DUOC tru diem loi danh van/ngon ngu neu tu do nghe hop ly theo dung ngu canh ky thuat."
        )

    lang_name = "Tieng Viet" if language == "vi" else "English"
    prompt = (
        f'Ban la nguoi phong van ky thuat cho vi tri "{level}".\n'
        f"CAU HOI: {question}\n"
        f"DAP AN THAM KHAO: {reference}\n"
        f"CAU TRA LOI CUA UNG VIEN: {user_answer if user_answer.strip() else '(Bo qua)'}\n\n"
        f"{vinglish_note}\n\n"
        f'Nhan xet bang ngon ngu "{lang_name}" theo cap do "{level}". '
        "Tuy nhien, BAT BUOC cac tieu de cua form tra ve phai GIU NGUYEN DINH DANG y chang nhu sau "
        "(KHONG DUNG ky tu markdown nhu in dam vao tieu de):\n"
        "DIEM: [X/10]\n"
        "DIEM MANH: [nhan xet diem manh]\n"
        "DIEM YEU: [nhan xet diem yeu]\n"
        "GOI Y BO SUNG: [goi y ngan gon bo sung kien thuc]"
    ).strip()

    print("\n" + "=" * 60)
    print(">>> [LOG] 5. PROMPT ĐÁNH GIÁ CÂU TRẢ LỜI:")
    print(prompt)

    raw = _llm_call_with_retry(llm, prompt)
    print("\n>>> [LOG] 6. KẾT QUẢ ĐÁNH GIÁ TỪ LLM:")
    print(raw)

    result = {
        "score": 0.0,
        "score_str": "0/10",
        "strengths": "",
        "weaknesses": "",
        "suggestions": "",
    }

    for line in raw.split("\n"):
        line = line.strip().replace("*", "")
        if line.startswith("DIEM:") or line.startswith("ĐIỂM:"):
            result["score_str"] = line.split(":", 1)[1].strip()
            try:
                result["score"] = float(result["score_str"].split("/")[0])
            except ValueError:
                pass
        elif line.startswith("DIEM MANH:") or line.startswith("ĐIỂM MẠNH:"):
            result["strengths"] = line.split(":", 1)[1].strip()
        elif line.startswith("DIEM YEU:") or line.startswith("ĐIỂM YẾU:"):
            result["weaknesses"] = line.split(":", 1)[1].strip()
        elif line.startswith("GOI Y BO SUNG:") or line.startswith("GỢI Ý BỔ SUNG:"):
            result["suggestions"] = line.split(":", 1)[1].strip()

    # Fallback: nếu parse thất bại thì đưa toàn bộ raw vào strengths
    if not result["strengths"] and not result["weaknesses"]:
        result["suggestions"] = "Đã có lỗi phân tích từ AI. Vui lòng thử lại."
        result["strengths"] = raw[:200]

    return result
