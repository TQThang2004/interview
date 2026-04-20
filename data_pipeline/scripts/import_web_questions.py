import os
import sys
import re
import uuid
import time
import google.generativeai as genai
import chromadb
from dotenv import load_dotenv

if sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# Load biến môi trường
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(dotenv_path=env_path, override=True)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Lỗi: Không tìm thấy GOOGLE_API_KEY trong file .env")

genai.configure(api_key=GOOGLE_API_KEY)
EMBEDDING_MODEL = "models/gemini-embedding-001"

CHROMA_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../chroma_db"))
COLLECTION_NAME = "interview_questions"

def parse_markdown_qa(filepath, topic):
    """Đọc file markdown text, trích xuất cấu hình Câu hỏi / Trả lời"""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Tìm các đoạn bắt đầu bằng "### " đến "### " tiếp theo
    sections = re.split(r'\n###\s+', content)
    
    questions = []
    
    # Bỏ qua phần header (trước '### ' đầu tiên)
    for section in sections[1:]:
        lines = section.split('\n')
        if not lines:
            continue
            
        question = lines[0].strip()
        answer = "\n".join(lines[1:]).strip()
        
        # Sửa: không cần check "Answer:" vì trang Nodejs không có chữ này
        if len(answer) > 10:
            # Xoá chữ "Answer:" nếu có bên React
            clean_answer = re.sub(r'(?i)^answer:\s*', '', answer).strip()
            questions.append({
                "question": question,
                "answer": clean_answer
            })
            
    print(f"✅ Đã trích xuất {len(questions)} câu hỏi từ {topic}.")
    return questions

def embed_with_retry(text, retries=5):
    for attempt in range(1, retries + 1):
        try:
            result = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=text,
                task_type="retrieval_document"
            )
            return result["embedding"]
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                wait = 20 * (2 ** (attempt - 1))
                print(f"   ⚠️ Rate limit, chờ {wait}s...")
                time.sleep(wait)
            else:
                print(f"❌ Lỗi embedding: {e}")
                return None
    return None

def main():
    print("🚀 BẮT ĐẦU NẠP DỮ LIỆU TỪ WEB VÀO CHROMA_DB CHUNG MÃ UUID...")
    
    # Đường dẫn file md từ gemini agent
    node_file = r"C:\Users\Thang\.gemini\antigravity\brain\36bc634c-1ffb-41b6-9feb-e196727f7149\.system_generated\steps\175\content.md"
    
    qa_node = parse_markdown_qa(node_file, "NodeJS")
    
    all_qa = []
    for item in qa_node:
        item["topic"] = "Backend NodeJS"
        
    all_qa.extend(qa_node)

    # Khởi tạo ChromaDB
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )
    
    print(f"📂 Đang truy cập collection '{COLLECTION_NAME}' (Số lượng gốc: {collection.count()})")
    
    batch_size = 15
    for i in range(0, len(all_qa), batch_size):
        batch = all_qa[i:i+batch_size]
        print(f"📦 Xử lý batch {i+1} đến {i+len(batch)} / {len(all_qa)}...")
        
        ids = []
        embeddings = []
        documents = []
        metadatas = []
        
        for qa in batch:
            doc_text = f"Question: {qa['question']}\n\n{qa['answer']}"
            chunk_id = str(uuid.uuid4())
            
            emb = embed_with_retry(doc_text)
            if emb:
                ids.append(chunk_id)
                embeddings.append(emb)
                documents.append(doc_text)
                metadatas.append({
                    "chunk_id": chunk_id,
                    "topic": qa["topic"],
                    "level": "Intermediate", # Default Web questions assume mid-level
                    "language": "English",
                    "source": "interviewquestions.guru"
                })
        
        if ids:
            collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )
            print(f"   ✅ Đã chèn {len(ids)} câu.")
            
        time.sleep(10) # Chờ 10s giữa chu kỳ cho khỏi limit
        
    print(f"🎉 HOÀN TẤT. Số lượng vectors hiện tại: {collection.count()}")

if __name__ == "__main__":
    main()
