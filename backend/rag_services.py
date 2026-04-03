import sys
import chromadb
import google.generativeai as genai
import time
import os
import io
from gtts import gTTS
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY    = os.getenv("GOOGLE_API_KEY", "AIzaSyBVBK1SRaZoVntBdHf7EWPI8-caDNyH6OA")
CHROMA_DB_PATH    = "../chroma_db"
COLLECTION_NAME   = "interview_questions"
EMBED_MODEL       = "models/gemini-embedding-001"
LLM_MODEL         = "gemini-2.5-flash"   
TOP_K_RETRIEVE    = 15                    
LLM_RETRY_WAIT    = 45                    
NUM_QUESTIONS     = 5

genai.configure(api_key=GOOGLE_API_KEY)

# Khoi tao ket noi DB an toan
def get_collection():
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    return client.get_collection(COLLECTION_NAME)

def get_llm():
    return genai.GenerativeModel(LLM_MODEL)

def transcribe_audio_gemini(audio_bytes: bytes) -> str:
    """Sử dụng Gemini 1.5 Flash Multimodal để nghe file audio."""
    model = get_llm()
    prompt = "Lắng nghe và chép lời đoạn thu âm này. Người nói đang sử dụng Tiếng Việt và các thuật ngữ chuyên ngành IT (ví dụ: ReactJS, NodeJS, Database, Framework, Code, Bug, Vinglish). Ưu tiên chép chính xác từ chuyên môn. Trả về phần text nội dung, tuyệt đối không suy diễn thêm hay bình luận:"
    
    try:
        response = model.generate_content([
            prompt,
            {"mime_type": "audio/webm", "data": audio_bytes}
        ])
        return response.text.strip()
    except Exception as e:
        print(f"Error Gemini Speech to Text: {e}")
        return f"(Lỗi khi phân tích audio bằng Gemini: {e})"

def generate_tts(text: str, language: str = "vi") -> bytes:
    """Tạo file MP3 từ gTTS (Google Translate API) miễn phí"""
    try:
        lang_code = "vi" if language == "vi" else "en"
        tts = gTTS(text=text, lang=lang_code, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        return fp.getvalue()
    except Exception as e:
        print(f"Error gTTS: {e}")
        raise

def llm_call_with_retry(llm, prompt: str, max_retries: int = 3) -> str:
    """Goi LLM voi tu dong retry khi gap rate limit 429."""
    for attempt in range(1, max_retries + 1):
        try:
            response = llm.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err or "quota" in err.lower():
                wait = LLM_RETRY_WAIT * attempt
                print(f"[Rate limit] Cho {wait}s roi thu lai (lan {attempt}/{max_retries})...")
                time.sleep(wait)
            else:
                print(f"[Loi LLM]: {err[:120]}")
                return "(Loi he thong LLM. Khong the cham diem vao luc nay)"
    return "(Vuot qua so lan thu toi da cua LLM API)"


def extract_question(document: str) -> str:
    """Loc cau hoi tu raw text cua DB."""
    for line in document.split("\n"):
        if line.startswith("Cau hoi:") or line.startswith("Câu hỏi:"):
            return line.split(":", 1)[1].strip()
    lines = [l.strip() for l in document.split("\n") if l.strip()]
    return lines[1] if len(lines) > 1 else document[:200]


def extract_reference_answer(document: str) -> str:
    """Loc cau tra loi mau tu raw text."""
    for line in document.split("\n"):
        if line.startswith("Tra loi:") or line.startswith("Trả lời:"):
            return line.split(":", 1)[1].strip()
    return ""


def retrieve_rag_questions(topic: str, level: str, language: str = "vi") -> list[dict]:
    """
    RAG: Query tu DB nhung cau hoi phu hop voi Topic
    Sau do loc truc tiep theo Level bang Python va lay ngau nhien (Random Shuffle)
    de tang tinh da dang cho moi lan phong van.
    """
    import random
    collection = get_collection()

    # Nhieu lan embedding se cho ra cung 1 he so, nen minh thiet lap chi tra ve topic
    query_text = f"Interview questions about {topic.replace(' interview question', '')}"
    query_emb = genai.embed_content(
        model=EMBED_MODEL,
        content=query_text,
        task_type="retrieval_query"
    )["embedding"]

    # Lay so luong lon de random (50 cau)
    results = collection.query(
        query_embeddings=[query_emb],
        n_results=50,
        where={"instruction": topic},
        include=["documents", "metadatas", "distances"]
    )

    valid_candidates = []
    fallback_candidates = []
    
    for doc, meta, dist in zip(results["documents"][0], results["metadatas"][0], results["distances"][0]):
        # Filter chinh xac theo cap do Junior/Senior
        if level.lower() in meta.get("level", "").lower():
            valid_candidates.append({"document": doc})
        else:
            fallback_candidates.append({"document": doc})

    # Xao tron danh sach de user duoc phong van moi la moi lan
    random.shuffle(valid_candidates)
    random.shuffle(fallback_candidates)

    # Uu tien lay du NUM_QUESTIONS tu valid_candidates
    selected = valid_candidates[:NUM_QUESTIONS]
    if len(selected) < NUM_QUESTIONS:
        needed = NUM_QUESTIONS - len(selected)
        selected.extend(fallback_candidates[:needed])

    # Chuyen thanh data object API
    formatted_questions = []
    for i, c in enumerate(selected):
        formatted_questions.append({
            "id": i,
            "question": extract_question(c["document"]),
            "reference": extract_reference_answer(c["document"])
        })
        
    if language == "vi":
        # Dich tu dong json RAG questions qua tieng Viet
        import json
        llm = get_llm()
        translate_prompt = "Dich toan bo cau hoi va cau tra loi sau sang Tiếng Việt mot cach chuyen nghiep. GIU NGUYEN cac thuat ngu ky thuat IT (khong dich bừa). Ban PHAI tra ve DUNG DINH DANG JSON LIST cua nguyen ban, va tuyet doi KHONG DUNG ky tu markdown (```json).\n\n"
        translate_prompt += json.dumps(formatted_questions, ensure_ascii=False)
        
        raw_translated = llm_call_with_retry(llm, translate_prompt)
        try:
            # Clean thoi quen Markdown neu co cua Gemini
            cleaned = raw_translated.strip()
            if cleaned.startswith("```json"): cleaned = cleaned[7:]
            if cleaned.startswith("```"): cleaned = cleaned[3:]
            if cleaned.endswith("```"): cleaned = cleaned[:-3]
            translated_questions = json.loads(cleaned.strip())
            return translated_questions
        except Exception as e:
            print(f"Translation passed with error: {e}. using raw:")
            print(raw_translated)
            return formatted_questions

    return formatted_questions


def evaluate_rag_answer(question: str, user_answer: str, reference: str, level: str, language: str = "vi") -> dict:
    """Dung Gemini danh gia ket qua va phan tich tung diem."""
    llm = get_llm()
    
    vinglish_note = ""
    if language == "vi":
        vinglish_note = "CHU Y DAC BIET TRAM TRONG: Ung vien dang tra loi bang giong noi va dung Tieng Viet pha Tieng Anh IT (Vinglish). Google speech to text co the viet sai chinh ta cac tu tieng anh (vd: rì ắc, nốt di ét, đa ta đây, phờ ram guốc, code, push). BAN TUYET DOI KHONG DUOC tru diem loi danh van/ngon ngu neu tu do nghe hop ly theo dung ngu canh ky thuat."

    prompt = f"""
Ban la nguoi phong van ky thuat cho vi tri "{level}".

CAU HOI: {question}
DAP AN THAM KHAO: {reference}
CAU TRA LOI CUA UNG VIEN: {user_answer if user_answer.strip() else "(Bo qua)"}

{vinglish_note}

Nhan xet bang ngon ngu "{'Tieng Viet' if language == 'vi' else 'English'}" theo cap do "{level}". Tuy nhien, BAT BUOC cac tieu de cua form tra ve phai GIU NGUYEN DINH DANG y chang nhu sau (KHONG DUNG ky tu markdown nhu in dam vao tieu de):
DIEM: [X/10]
DIEM MANH: [nhan xet diem manh]
DIEM YEU: [nhan xet diem yeu]
GOI Y BO SUNG: [goi y ngan gon bo sung kien thuc]
""".strip()

    raw = llm_call_with_retry(llm, prompt)
    
    # Parse ket qua tra ve thanh Dict API
    res = {
        "score": 0.0,
        "score_str": "0/10",
        "strengths": "",
        "weaknesses": "",
        "suggestions": ""
    }
    
    # In ra console de de debug
    print("--- [RAW LLM RESPONSE] ---")
    print(raw)
    print("--------------------------")
    
    for line in raw.split("\n"):
        line = line.strip().replace("*", "") # Xoa ky tu in dam markdown (*) truoc khi parse
        if line.startswith("DIEM:") or line.startswith("ĐIỂM:"):
            res["score_str"] = line.split(":", 1)[1].strip()
            try:
                res["score"] = float(res["score_str"].split("/")[0])
            except:
                pass
        elif line.startswith("DIEM MANH:") or line.startswith("ĐIỂM MẠNH:"):
             res["strengths"] = line.split(":", 1)[1].strip()
        elif line.startswith("DIEM YEU:") or line.startswith("ĐIỂM YẾU:"):
             res["weaknesses"] = line.split(":", 1)[1].strip()
        elif line.startswith("GOI Y BO SUNG:") or line.startswith("GỢI Ý BỔ SUNG:"):
             res["suggestions"] = line.split(":", 1)[1].strip()

    # Neu form bi that bai/LLM tra ve khong dung cau truc
    if not res["strengths"] and not res["weaknesses"]:
        res["suggestions"] = "Đã có lỗi phân tích từ AI. Vui lòng xem dạng raw hoặc thử lại."
        res["strengths"] = raw[:200]


    return res
