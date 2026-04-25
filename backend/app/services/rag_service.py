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
    GOOGLE_API_KEY_EMBEDDING,
    GOOGLE_API_KEY_EXTRACT_TOPIC,
    GOOGLE_API_KEY_GENERATE_Q,
    GOOGLE_API_KEY_EVALUATE,
    GOOGLE_API_KEY_TRANSLATE,
    LLM_MODEL,
    EMBED_MODEL,
    CHROMA_DB_PATH,
    COLLECTION_NAME,
    TOP_K_RETRIEVE,
    NUM_QUESTIONS,
    LLM_RETRY_WAIT,
)

# Chú ý: Vì luồng có thể đa luồng, ta sẽ apply key ngay trước mỗi module thực thi.
if GOOGLE_API_KEY:
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
    topics: str | list[str],
    level: str,
    language: str = "vi",
    num_q: int = NUM_QUESTIONS,
) -> list[dict]:
    """
    Truy vấn ChromaDB để lấy câu hỏi phỏng vấn liên quan đến topic/level.

    Cải tiến so với v1:
    - Topic đầu tiên trong list được coi là CHỦ ĐỀ CHÍNH → ưu tiên lấy nhiều hơn
      (chiếm ~60% lượng câu hỏi valid, 40% còn lại chia đều cho các topic phụ).
    - Sắp xếp theo distance (nhỏ = gần) thay vì shuffle mù quáng, sau đó xáo nhẹ
      trong nhóm cùng distance-band để tránh lặp.
    - Fallback vẫn giữ khi không đủ câu valid.
    - KHÔNG dịch nếu ngôn ngữ không phải 'vi' → tiết kiệm 1 LLM call.
    """
    collection = _get_collection()

    if isinstance(topics, str):
        topics_list = [topics]
    else:
        topics_list = list(topics)  # copy để không ảnh hưởng caller

    valid_per_topic: dict[str, list[dict]] = {t: [] for t in topics_list}
    fallback_candidates: list[dict] = []
    seen_docs: set[str] = set()

    try:
        genai.configure(api_key=GOOGLE_API_KEY_EMBEDDING)

        # Batch Embeddings – 1 API call cho tất cả topics
        embed_result = genai.embed_content(
            model=EMBED_MODEL,
            content=topics_list,
            task_type="retrieval_query",
        )
        query_embeddings = embed_result["embedding"]
        if isinstance(query_embeddings[0], float):
            query_embeddings = [query_embeddings]

        # ChromaDB batch query
        results = collection.query(
            query_embeddings=query_embeddings,
            n_results=TOP_K_RETRIEVE,
            include=["documents", "metadatas", "distances"],
        )

        for i, topic in enumerate(topics_list):
            for doc, meta, dist in zip(
                results["documents"][i],
                results["metadatas"][i],
                results["distances"][i],
            ):
                if doc in seen_docs:
                    continue
                seen_docs.add(doc)

                entry = {"document": doc, "distance": dist, "topic": topic}
                if level.lower() in meta.get("level", "").lower():
                    valid_per_topic[topic].append(entry)
                else:
                    fallback_candidates.append(entry)

    except Exception as e:
        print(f"[RagService] RAG Batch Query error: {e}")

    # ── Phân bổ slot theo chủ đề ──────────────────────────────────────────
    # Topic đầu tiên = chủ đề chính → chiếm 60% slot (tối thiểu 3 câu nếu num_q >= 5)
    primary_topic = topics_list[0]
    secondary_topics = topics_list[1:]

    if secondary_topics:
        primary_slots = max(3, round(num_q * 0.6))
        secondary_slots = num_q - primary_slots
    else:
        primary_slots = num_q
        secondary_slots = 0

    # Sắp theo distance ASC (nhỏ = tương đồng cao), shuffle nhẹ trong band 0.05
    def _sorted_stable(candidates: list[dict]) -> list[dict]:
        """Sắp xếp theo distance, xáo nhẹ bên trong mỗi band 0.05 để đa dạng."""
        bands: dict[int, list[dict]] = {}
        for c in candidates:
            band = int(c["distance"] / 0.05)  # nhóm mỗi 0.05
            bands.setdefault(band, []).append(c)
        result = []
        for key in sorted(bands):
            group = bands[key]
            random.shuffle(group)  # xáo trong band
            result.extend(group)
        return result

    primary_sorted = _sorted_stable(valid_per_topic[primary_topic])
    selected = primary_sorted[:primary_slots]

    # Lấy từ các topic phụ nếu còn slot
    if secondary_slots > 0 and secondary_topics:
        per_secondary = max(1, secondary_slots // len(secondary_topics))
        for t in secondary_topics:
            candidates = _sorted_stable(valid_per_topic[t])
            selected.extend(candidates[:per_secondary])

    # Fallback nếu vẫn thiếu
    if len(selected) < num_q:
        fallback_candidates.sort(key=lambda c: c["distance"])
        needed = num_q - len(selected)
        selected.extend(fallback_candidates[:needed])

    print("\n" + "-" * 50)
    print(f">>> [LOG] CÁC CÂU HỎI LẤY ĐƯỢC TỪ RAG (TOP {len(selected)} KẾT QUẢ):")
    for i, c in enumerate(selected):
        preview = c["document"].replace("\n", " ")
        dist = c.get("distance", "N/A")
        print(f"--- RAG Doc {i+1} (topic={c['topic']}, dist={dist:.4f}) ---\n{preview[:300]}...\n")

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
        genai.configure(api_key=GOOGLE_API_KEY_TRANSLATE)
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
    Kết hợp: NUM_QUESTIONS câu từ RAG (ưu tiên topic chính) + 2 câu tuỳ chỉnh từ LLM.

    Tối ưu LLM calls:
    - Bước 1: extract_topic  → 1 call
    - Bước 2: RAG query      → 1 embedding call + ChromaDB (không phải LLM)
    - Bước 3: translate      → 1 call (chỉ khi language='vi')
    - Bước 4: custom_q       → 1 call
    Tổng: tối đa 4 calls (giảm từ 5 do prompt extract topic đã được tối ưu
    để trả về thông tin chi tiết hơn ngay từ đầu).
    """
    if not cv_text.strip() and not jd_text.strip():
        return retrieve_rag_questions(
            "software development core knowledge interview questions",
            level, language, num_q=NUM_QUESTIONS
        )

    # ── Bước 1: Trích xuất topic + sinh query string chi tiết cho RAG ────────
    genai.configure(api_key=GOOGLE_API_KEY_EXTRACT_TOPIC)
    llm = _get_llm()
    prompt_extract = (
        "Dựa vào CV và Job Description (JD) dưới đây:\n"
        f"CV: {cv_text[:2000]}\n"
        f"JD: {jd_text[:1000]}\n\n"
        "Hãy trích xuất và sắp xếp theo thứ tự ưu tiên giảm dần (quan trọng nhất trước) "
        "3-4 công nghệ/framework CỐT LÕI mà ứng viên cần thành thạo nhất cho vị trí này.\n\n"
        "YÊU CẦU QUAN TRỌNG:\n"
        "- PHẦN TỬ ĐẦU TIÊN trong mảng phải là công nghệ CHÍNH NHẤT (VD: nếu JD là Frontend React thì phần tử đầu là về React).\n"
        "- Mỗi phần tử là một cụm từ tìm kiếm chi tiết dùng để vector search câu hỏi phỏng vấn kỹ thuật.\n"
        "- Bỏ qua kỹ năng mềm, chỉ lấy kỹ thuật.\n"
        "- KHÔNG bao gồm markdown, KHÔNG giải thích, CHỈ trả về JSON array.\n"
        "Ví dụ chuẩn: [\"ReactJS hooks useState useEffect interview technical questions\", "
        "\"Node.js Express REST API backend interview questions\", "
        "\"PostgreSQL SQL query optimization database interview\"]"
    )
    topic_raw = _llm_call_with_retry(llm, prompt_extract)
    print("\n" + "=" * 60)
    print(">>> [LOG] CÁC TỪ KHÓA TRÍCH XUẤT TỪ CV/JD (DÙNG ĐỂ RAG QUERY):")
    print(topic_raw)

    topics_list = _parse_json_safely(topic_raw)
    if not isinstance(topics_list, list) or len(topics_list) == 0:
        topics_list = ["software engineering core skills interview questions"]
    else:
        # Giới hạn tối đa 4 topic để tránh quá tải embedding
        topics_list = topics_list[:4]

    # ── Bước 2: Lấy câu hỏi từ RAG (topic đầu = chủ đề chính, được ưu tiên) ─
    rag_questions = retrieve_rag_questions(topics_list, level, language, num_q=NUM_QUESTIONS)

    # ── Bước 3: Sinh 2 câu hỏi tùy chỉnh từ LLM dựa vào CV/JD ──────────────
    genai.configure(api_key=GOOGLE_API_KEY_GENERATE_Q)
    llm = _get_llm()
    lang_req = "Tiếng Việt" if language == "vi" else "English"
    # Lấy tên topic chính để nhắc nhở LLM focus
    main_topic_hint = topics_list[0] if topics_list else ""
    prompt_custom = (
        f"Bạn là người phỏng vấn chuyên nghiệp cho vị trí '{level}'.\n"
        f"Chủ đề chính cần hỏi sâu: {main_topic_hint}\n"
        f"CV ứng viên: {cv_text[:3000]}\n"
        f"JD yêu cầu: {jd_text[:1500]}\n\n"
        f"Tạo 2 câu hỏi kỹ thuật THỰC TẾ bằng {lang_req}, tập trung vào chủ đề chính ở trên.\n"
        "Hỏi về kinh nghiệm cụ thể hoặc tình huống từ CV/JD, KHÔNG hỏi câu lý thuyết chung chung.\n"
        "BẮT BUỘC trả về CHÍNH XÁC một JSON array (không markdown, không text thừa):\n"
        '[\n'
        '  {"question": "Câu hỏi 1", "reference": "Gợi ý trả lời 1"},\n'
        '  {"question": "Câu hỏi 2", "reference": "Gợi ý trả lời 2"}\n'
        ']'
    )
    custom_raw = _llm_call_with_retry(llm, prompt_custom)

    custom_qs = _parse_json_safely(custom_raw)
    if custom_qs:
        for q in custom_qs:
            rag_questions.append({
                "id": len(rag_questions),
                "question": q.get("question", ""),
                "reference": q.get("reference", ""),
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
    genai.configure(api_key=GOOGLE_API_KEY_EVALUATE)
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

    raw = _llm_call_with_retry(llm, prompt)

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
