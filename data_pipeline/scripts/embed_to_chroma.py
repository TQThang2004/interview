"""
Script: embed_to_chroma.py
Mục đích: Đọc chunked_sample.json, tạo embedding bằng Google Gemini API
          và lưu vào ChromaDB local.
          - Tự động retry khi gặp Rate Limit (429)
          - Tiếp tục từ checkpoint nếu script bị dừng giữa chừng

Cách dùng:
    python embed_to_chroma.py
"""

import json
import time
import os
import google.generativeai as genai
import chromadb
from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(dotenv_path=env_path, override=True)

# ============================================================
# CẤU HÌNH
# ============================================================
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Lỗi: Không tìm thấy GOOGLE_API_KEY trong file .env")
CHROMA_DB_PATH = os.path.join(os.path.dirname(__file__), "../../chroma_db")
COLLECTION_NAME = "interview_questions"
INPUT_FILE = os.path.join(os.path.dirname(__file__), "../data/chunked_sample.json")
EMBEDDING_MODEL = "models/gemini-embedding-001"

# Mỗi batch 20 docs (an toàn với limit 100 req/min)
BATCH_SIZE = 20
# Chờ 15 giây giữa các batch (4 batch/min = 80 req/min < 100)
DELAY_BETWEEN_BATCHES = 15
# Số lần retry khi gặp lỗi 429
MAX_RETRIES = 5
# Thời gian chờ ban đầu khi retry (giây), tăng dần theo exponential backoff
RETRY_BASE_DELAY = 20
# ============================================================


def load_chunks(filepath: str) -> list:
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"✅ Đã đọc {len(data)} chunks từ {filepath}")
    return data


def create_embedding_with_retry(text: str, chunk_id: str) -> list[float] | None:
    """Tạo embedding với auto-retry khi gặp Rate Limit."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=text,
                task_type="retrieval_document"
            )
            return result["embedding"]
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                wait_time = RETRY_BASE_DELAY * (2 ** (attempt - 1))  # exponential backoff
                print(f"   ⚠️  Rate limit [{chunk_id}] - Thử lại sau {wait_time}s (lần {attempt}/{MAX_RETRIES})")
                time.sleep(wait_time)
            else:
                print(f"   ❌ Lỗi không xác định [{chunk_id}]: {e}")
                return None
    print(f"   ❌ Bỏ qua [{chunk_id}] sau {MAX_RETRIES} lần thử")
    return None


def setup_chroma(db_path: str, collection_name: str):
    client = chromadb.PersistentClient(path=db_path)
    
    # Kiểm tra xem collection đã có dữ liệu chưa (để resume)
    existing = [c.name for c in client.list_collections()]
    if collection_name in existing:
        collection = client.get_collection(collection_name)
        existing_count = collection.count()
        if existing_count > 0:
            print(f"⚠️  Collection '{collection_name}' đã có {existing_count} vectors.")
            print(f"   → Sẽ bỏ qua các chunk đã được embed, chỉ thêm chunk còn thiếu.")
            return collection, existing_count
    
    collection = client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )
    print(f"✅ Đã tạo collection '{collection_name}' trong ChromaDB tại '{db_path}'")
    return collection, 0


def get_existing_ids(collection) -> set:
    """Lấy danh sách chunk_id đã được lưu trong ChromaDB."""
    result = collection.get(include=[])  # Chỉ lấy IDs
    return set(result["ids"])


def embed_and_store(chunks: list, collection, existing_ids: set):
    total = len(chunks)
    success_count = 0
    error_count = 0
    skip_count = 0

    # Lọc ra các chunks chưa được embed
    pending_chunks = [c for c in chunks if c["metadata"]["chunk_id"] not in existing_ids]
    skip_count = total - len(pending_chunks)
    
    if skip_count > 0:
        print(f"⏭️  Bỏ qua {skip_count} chunks đã embed trước đó.")
    
    if not pending_chunks:
        print("✅ Tất cả chunks đã được embed rồi!")
        return 0, 0, skip_count

    pending_total = len(pending_chunks)
    print(f"📋 Cần embed thêm: {pending_total} chunks\n")

    for batch_start in range(0, pending_total, BATCH_SIZE):
        batch = pending_chunks[batch_start: batch_start + BATCH_SIZE]
        batch_end = min(batch_start + BATCH_SIZE, pending_total)
        
        print(f"📦 Batch [{batch_start + 1} - {batch_end}] / {pending_total}  "
              f"(Tổng tiến độ: {skip_count + success_count + batch_start}/{total})")

        ids, embeddings, documents, metadatas = [], [], [], []

        for item in batch:
            chunk_id = item["metadata"]["chunk_id"]
            page_content = item["page_content"]
            metadata = item["metadata"]

            clean_metadata = {}
            for k, v in metadata.items():
                if isinstance(v, bool):
                    clean_metadata[k] = str(v).lower()
                elif v is None:
                    clean_metadata[k] = ""
                else:
                    clean_metadata[k] = str(v)

            embedding = create_embedding_with_retry(page_content, chunk_id)
            if embedding is not None:
                ids.append(chunk_id)
                embeddings.append(embedding)
                documents.append(page_content)
                metadatas.append(clean_metadata)
                success_count += 1
            else:
                error_count += 1

        if ids:
            collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )
            print(f"   ✅ Đã lưu {len(ids)} chunks vào ChromaDB")

        if batch_end < pending_total:
            print(f"   ⏳ Chờ {DELAY_BETWEEN_BATCHES}s trước batch tiếp theo...\n")
            time.sleep(DELAY_BETWEEN_BATCHES)

    return success_count, error_count, skip_count


def main():
    print("=" * 60)
    print("🚀 EMBEDDING VÀO CHROMADB - GOOGLE GEMINI")
    print("=" * 60)

    genai.configure(api_key=GOOGLE_API_KEY)
    print(f"✅ Gemini API: {EMBEDDING_MODEL}")

    chunks = load_chunks(INPUT_FILE)
    collection, existing_count = setup_chroma(CHROMA_DB_PATH, COLLECTION_NAME)
    
    existing_ids = get_existing_ids(collection) if existing_count > 0 else set()
    
    success, errors, skipped = embed_and_store(chunks, collection, existing_ids)

    final_count = collection.count()

    print("\n" + "=" * 60)
    print("📊 KẾT QUẢ CUỐI CÙNG")
    print("=" * 60)
    print(f"   ⏭️  Đã có sẵn  : {skipped:>4} chunks")
    print(f"   ✅ Mới thêm   : {success:>4} chunks")
    print(f"   ❌ Lỗi        : {errors:>4} chunks")
    print(f"   📈 Tổng DB    : {final_count:>4} vectors")
    print(f"   📁 Lưu tại    : {os.path.abspath(CHROMA_DB_PATH)}")
    print(f"   🗂️  Collection  : {COLLECTION_NAME}")
    print("=" * 60)
    
    if errors == 0:
        print("🎉 HOÀN THÀNH XUẤT SẮC! Dữ liệu sẵn sàng để query.")
    else:
        print(f"⚠️  Hoàn thành với {errors} lỗi. Chạy lại script để embed các chunk bị lỗi.")


if __name__ == "__main__":
    main()
