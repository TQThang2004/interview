"""
==========================================================
  RAG INTERVIEW SYSTEM - Hệ thống luyện phỏng vấn kỹ thuật
  Luồng: Chọn chủ đề/level -> RAG lấy câu hỏi -> Gemini hỏi
         -> Người dùng trả lời -> Gemini chấm điểm & nhận xét
==========================================================
"""

import sys
import os
import chromadb
import google.generativeai as genai
from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(dotenv_path=env_path, override=True)

# ============================================================
# CẤU HÌNH
# ============================================================
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Lỗi: Không tìm thấy GOOGLE_API_KEY trong file .env")
CHROMA_DB_PATH    = os.path.join(os.path.dirname(__file__), "../../chroma_db")
COLLECTION_NAME   = "interview_questions"
EMBED_MODEL       = "models/gemini-embedding-001"
LLM_MODEL         = "gemini-1.5-flash"   # Model LLM de hoi va cham diem
NUM_QUESTIONS     = 5                     # Số câu hỏi mỗi phiên phỏng vấn
TOP_K_RETRIEVE    = 15                    # Lay bao nhieu ket qua tu ChromaDB
LLM_RETRY_WAIT    = 45                    # Cho (giay) khi gap rate limit LLM
# ============================================================

TOPICS = {
    "1": "machine learning interview question",
    "2": "software development interview question",
    "3": "Web development interview question",
    "4": "data analysis interview question",
    "5": "Application development interview question",
    "6": "SQL interview question",
}

LEVELS = {
    "1": "Intern",
    "2": "Junior",
    "3": "Middle",
    "4": "Senior",
}


def llm_call_with_retry(llm, prompt: str, max_retries: int = 3) -> str:
    """Goi LLM voi tu dong retry khi gap rate limit."""
    import time
    for attempt in range(1, max_retries + 1):
        try:
            response = llm.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err or "quota" in err.lower():
                wait = LLM_RETRY_WAIT * attempt
                print(f"\n  [Rate limit] Cho {wait}s roi thu lai (lan {attempt}/{max_retries})...")
                time.sleep(wait)
            else:
                print(f"\n  [Loi LLM]: {err[:120]}")
                return "(Khong the tao phan hoi do loi he thong)"
    return "(Vuot qua so lan thu toi da)"


def setup():
    genai.configure(api_key=GOOGLE_API_KEY)
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    collection = client.get_collection(COLLECTION_NAME)
    llm = genai.GenerativeModel(LLM_MODEL)
    return collection, llm


def choose_topic_and_level():
    print("\n" + "=" * 56)
    print("  HE THONG LUYEN PHONG VAN KY THUAT PHAN MEM")
    print("=" * 56)

    print("\nChon chu de phong van:")
    for k, v in TOPICS.items():
        label = v.replace(" interview question", "").title()
        print(f"  [{k}] {label}")

    while True:
        choice = input("\nNhap so (1-6): ").strip()
        if choice in TOPICS:
            topic = TOPICS[choice]
            break
        print("  Lua chon khong hop le, thu lai.")

    print("\nChon cap do kinh nghiem:")
    for k, v in LEVELS.items():
        print(f"  [{k}] {v}")

    while True:
        choice = input("\nNhap so (1-4): ").strip()
        if choice in LEVELS:
            level = LEVELS[choice]
            break
        print("  Lua chon khong hop le, thu lai.")

    return topic, level


def retrieve_questions(collection, topic: str, level: str, llm) -> list[dict]:
    """
    RAG Step 1: Tao query embedding tu chu de + level,
    truy van ChromaDB, loc theo level, de LLM chon cau hoi phu hop.
    """
    # Tao query tu nhien cho embedding
    query_text = (
        f"Interview question about {topic.replace(' interview question', '')} "
        f"for {level} level software engineering candidate"
    )

    # Embed query
    query_emb = genai.embed_content(
        model=EMBED_MODEL,
        content=query_text,
        task_type="retrieval_query"
    )["embedding"]

    # Truy van ChromaDB - lay TOP_K_RETRIEVE ket qua
    results = collection.query(
        query_embeddings=[query_emb],
        n_results=TOP_K_RETRIEVE,
        where={"instruction": topic},          # loc theo chu de
        include=["documents", "metadatas", "distances"]
    )

    # Build danh sach candidates
    candidates = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ):
        similarity = round((1 - dist) * 100, 1)
        # Uu tien cau hoi dung level
        level_match = level.lower() in meta.get("level", "").lower()
        candidates.append({
            "document":     doc,
            "metadata":     meta,
            "similarity":   similarity,
            "level_match":  level_match,
        })

    # RAG Step 2: Dung LLM chon NUM_QUESTIONS cau hoi phu hop nhat
    candidate_list = "\n\n".join([
        f"[Cau {i+1}] (Do tuong dong: {c['similarity']}% | "
        f"Level: {c['metadata'].get('level','?')} | "
        f"Level match: {c['level_match']})\n{c['document']}"
        for i, c in enumerate(candidates)
    ])

    selection_prompt = f"""
Ban la mot he thong tuyen chon cau hoi phong van cho ung vien cap do "{level}"
ve chu de "{topic.replace(' interview question', '')}".

Duoi day la {len(candidates)} cau hoi duoc truy xuat tu co so du lieu:

{candidate_list}

Nhiem vu: Chon ra DUNG {NUM_QUESTIONS} cau hoi TOT NHAT de phong van mot ung vien "{level}".
Tieu chi chon:
1. Cau hoi phai phu hop voi cap do "{level}" (uu tien cau co "Level match: True")
2. Cau hoi phai da dang, khong trung lap chu de
3. Cau hoi phai thuc te, kiem tra duoc kien thuc ky thuat that su
4. Uu tien cau co do tuong dong cao

Tra loi CHINH XAC theo dinh dang sau (chi tra ve so thu tu, khong them gi khac):
SELECTED: 1,3,5,7,9
(thay bang so thu tu cau hoi ban chon)
""".strip()

    raw = llm_call_with_retry(llm, selection_prompt)

    # Parse ket qua tu LLM
    selected_indices = []
    for line in raw.split("\n"):
        if line.startswith("SELECTED:"):
            parts = line.replace("SELECTED:", "").strip().split(",")
            for p in parts:
                try:
                    idx = int(p.strip()) - 1  # ve 0-indexed
                    if 0 <= idx < len(candidates):
                        selected_indices.append(idx)
                except ValueError:
                    continue
            break

    # Fallback: neu parse loi, lay top NUM_QUESTIONS theo similarity
    if len(selected_indices) < NUM_QUESTIONS:
        selected_indices = list(range(min(NUM_QUESTIONS, len(candidates))))

    selected = [candidates[i] for i in selected_indices[:NUM_QUESTIONS]]

    print(f"\n[RAG] Da truy xuat {len(candidates)} candidates tu ChromaDB")
    print(f"[LLM] Da chon {len(selected)} cau hoi phu hop nhat cho cap do {level}")
    return selected


def extract_question(document: str) -> str:
    """Lay phan 'Cau hoi' tu document chunk."""
    for line in document.split("\n"):
        if line.startswith("Cau hoi:") or line.startswith("Câu hỏi:"):
            return line.split(":", 1)[1].strip()
    # Fallback: tra ve dong 2
    lines = [l.strip() for l in document.split("\n") if l.strip()]
    return lines[1] if len(lines) > 1 else document[:200]


def extract_reference_answer(document: str) -> str:
    """Lay phan 'Tra loi goi y' tu document chunk."""
    for line in document.split("\n"):
        if line.startswith("Tra loi:") or line.startswith("Trả lời:"):
            return line.split(":", 1)[1].strip()
    return ""


def evaluate_answer(llm, question: str, user_answer: str, reference: str, level: str) -> str:
    """
    RAG Step 3: Dung Gemini LLM cham diem va nhan xet cau tra loi.
    """
    prompt = f"""
Ban la mot nguoi phong van ky thuat chuyen nghiep cho vi tri "{level}".

CAU HOI DA DAT: {question}

CAU TRA LOI THAM KHAO (dung de so sanh, khong tiet lo cho ung vien):
{reference}

CAU TRA LOI CUA UNG VIEN:
{user_answer if user_answer.strip() else "(Ung vien bo qua)"}

Nhiem vu: Danh gia cau tra loi theo tieu chi cap do "{level}". 
Tra loi bang tieng Viet, theo dung dinh dang sau:

DIEM: [X/10]

NHAN XET:
- Diem manh: [neu nhung gi ung vien tra loi dung/tot]
- Diem yeu / Con thieu: [neu nhung kien thuc con thieu hoac sai]

GOI Y BO SUNG:
[Tom tat ngan gon nhung y chinh can biet, khong tiet lo toan bo dap an]
""".strip()

    return llm_call_with_retry(llm, prompt)


def run_interview_session(collection, llm):
    """Chay mot phien phong van hoan chinh."""
    topic, level = choose_topic_and_level()
    topic_label = topic.replace(" interview question", "").title()

    print(f"\n{'='*56}")
    print(f"  BAT DAU PHONG VAN: {topic_label} | Cap do: {level}")
    print(f"  So luong cau hoi: {NUM_QUESTIONS}")
    print(f"{'='*56}")
    print("\n[...] Dang tai cau hoi phu hop tu co so du lieu...\n")

    questions = retrieve_questions(collection, topic, level, llm)

    print(f"\n{'='*56}")
    print("  DANH SACH CAU HOI DUOC CHON (xem truoc)")
    print(f"{'='*56}")
    for i, q in enumerate(questions):
        q_text = extract_question(q["document"])
        print(f"\n  [{i+1}] (Do tuong dong: {q['similarity']}% | "
              f"Level: {q['metadata'].get('level','?')})")
        print(f"       {q_text[:120]}{'...' if len(q_text)>120 else ''}")

    confirm = input("\n\nNhan Enter de bat dau phong van, hoac 'q' de thoat: ").strip()
    if confirm.lower() == "q":
        return

    scores = []

    for i, q_data in enumerate(questions):
        question = extract_question(q_data["document"])
        reference = extract_reference_answer(q_data["document"])

        print(f"\n{'='*56}")
        print(f"  CAU HOI {i+1}/{NUM_QUESTIONS}")
        print(f"{'='*56}")
        print(f"\n{question}\n")

        user_answer = input("Tra loi cua ban: ").strip()

        print("\n[...] Dang cham diem...\n")
        evaluation = evaluate_answer(llm, question, user_answer, reference, level)
        print(evaluation)

        # Lay diem tu evaluation
        for line in evaluation.split("\n"):
            if line.startswith("DIEM:"):
                try:
                    score_str = line.replace("DIEM:", "").strip().split("/")[0].strip()
                    scores.append(float(score_str))
                except:
                    pass

        if i < len(questions) - 1:
            cont = input("\n\nNhan Enter de cau tiep theo...: ")

    # Tong ket phien phong van
    print(f"\n{'='*56}")
    print("  KET QUA PHIEN PHONG VAN")
    print(f"{'='*56}")
    print(f"  Chu de       : {topic_label}")
    print(f"  Cap do       : {level}")
    print(f"  So cau hoi   : {NUM_QUESTIONS}")
    if scores:
        avg = sum(scores) / len(scores)
        print(f"  Diem trung binh: {avg:.1f}/10")
        if avg >= 8:
            verdict = "Xuat sac! Ban da san sang cho buoi phong van thuc te."
        elif avg >= 6:
            verdict = "Kha! Can on tap them mot so phan con thieu."
        elif avg >= 4:
            verdict = "Trung binh. Hay on luyen them truoc khi di phong van."
        else:
            verdict = "Can co gang hon. Hay hoc ky hon va thu lai."
        print(f"  Nhan xet     : {verdict}")
    print(f"{'='*56}\n")


def main():
    print("Dang khoi dong he thong...")
    collection, llm = setup()
    total = collection.count()
    print(f"Co so du lieu: {total} cau hoi da duoc embedding")

    while True:
        run_interview_session(collection, llm)

        retry = input("Phong van phien moi? (y/n): ").strip().lower()
        if retry != "y":
            print("\nCam on da su dung he thong! Chuc ban phong van thanh cong!\n")
            break


if __name__ == "__main__":
    main()
