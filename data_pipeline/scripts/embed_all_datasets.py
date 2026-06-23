"""
Script: embed_all_datasets.py
Mục đích: Đọc tất cả các file JSON chunked trong thư mục dataset/chunk, 
          tạo embedding bằng Google Gemini API và lưu vào ChromaDB local.
"""

import json
import time
import os
import glob
import sys
from google import genai
from google.genai import types
import chromadb
from dotenv import load_dotenv

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(dotenv_path=env_path, override=True)

# ============================================================
# CẤU HÌNH
# ============================================================
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Lỗi: Không tìm thấy GOOGLE_API_KEY trong file .env")

CHROMA_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../chroma_db"))
COLLECTION_NAME = "interview_questions"
INPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../dataset/chunk"))
EMBEDDING_MODEL = "models/gemini-embedding-001"

BATCH_SIZE = 20
DELAY_BETWEEN_BATCHES = 15
MAX_RETRIES = 5
RETRY_BASE_DELAY = 20
# ============================================================


def normalize_model_name(model: str) -> str:
    return model.removeprefix("models/")


def load_chunks(filepath: str) -> list:
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"✅ Đã đọc {len(data)} chunks từ {os.path.basename(filepath)}")
    return data


def create_embedding_with_retry(text: str, chunk_id: str) -> list[float] | None:
    client = genai.Client(api_key=GOOGLE_API_KEY)
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = client.models.embed_content(
                model=normalize_model_name(EMBEDDING_MODEL),
                contents=text,
                config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
            )
            if result.embeddings:
                return list(result.embeddings[0].values)
            return None
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                wait_time = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                print(f"   ⚠️  Rate limit [{chunk_id}] - Thử lại sau {wait_time}s (lần {attempt}/{MAX_RETRIES})")
                time.sleep(wait_time)
            else:
                print(f"   ❌ Lỗi không xác định [{chunk_id}]: {e}")
                return None
    print(f"   ❌ Bỏ qua [{chunk_id}] sau {MAX_RETRIES} lần thử")
    return None


def setup_chroma(db_path: str, collection_name: str):
    client = chromadb.PersistentClient(path=db_path)
    
    existing = [c.name for c in client.list_collections()]
    if collection_name in existing:
        collection = client.get_collection(collection_name)
        existing_count = collection.count()
        if existing_count > 0:
            print(f"⚠️  Collection '{collection_name}' đã có {existing_count} vectors.")
            return collection, existing_count
    
    collection = client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )
    print(f"✅ Đã tạo collection '{collection_name}' trong ChromaDB tại '{db_path}'")
    return collection, 0


def get_existing_ids(collection) -> set:
    result = collection.get(include=[]) 
    return set(result["ids"])


def clean_metadata(metadata: dict) -> dict:
    clean = {}
    for k, v in metadata.items():
        if isinstance(v, bool):
            clean[k] = str(v).lower()
        elif v is None:
            clean[k] = ""
        else:
            clean[k] = str(v)
    return clean


def update_existing_metadata(collection, chunks: list, existing_ids: set):
    existing_chunks = [c for c in chunks if c["metadata"]["chunk_id"] in existing_ids]
    if not existing_chunks:
        return

    ids = [c["metadata"]["chunk_id"] for c in existing_chunks]
    metadatas = [clean_metadata(c["metadata"]) for c in existing_chunks]
    for start in range(0, len(ids), BATCH_SIZE):
        collection.update(
            ids=ids[start:start + BATCH_SIZE],
            metadatas=metadatas[start:start + BATCH_SIZE],
        )
    print(f"🔁 Đã cập nhật metadata cho {len(ids)} chunks đã tồn tại.")


def embed_and_store(chunks: list, collection, existing_ids: set):
    total = len(chunks)
    success_count = 0
    error_count = 0

    pending_chunks = [c for c in chunks if c["metadata"]["chunk_id"] not in existing_ids]
    skip_count = total - len(pending_chunks)
    
    if skip_count > 0:
        print(f"⏭️  Bỏ qua {skip_count} chunks đã embed trước đó.")
        update_existing_metadata(collection, chunks, existing_ids)
    
    if not pending_chunks:
        print("✅ Tất cả chunks trong file này đã được embed rồi!")
        return 0, 0, skip_count

    pending_total = len(pending_chunks)
    print(f"📋 Cần embed thêm: {pending_total} chunks\n")

    for batch_start in range(0, pending_total, BATCH_SIZE):
        batch = pending_chunks[batch_start: batch_start + BATCH_SIZE]
        batch_end = min(batch_start + BATCH_SIZE, pending_total)
        
        print(f"📦 Batch [{batch_start + 1} - {batch_end}] / {pending_total}  "
              f"(Tiến độ file hiện tại: {skip_count + success_count + batch_start}/{total})")

        ids, embeddings, documents, metadatas = [], [], [], []

        for item in batch:
            chunk_id = item["metadata"]["chunk_id"]
            page_content = item["page_content"]
            metadata = item["metadata"]

            embedding = create_embedding_with_retry(page_content, chunk_id)
            if embedding is not None:
                ids.append(chunk_id)
                embeddings.append(embedding)
                documents.append(page_content)
                metadatas.append(clean_metadata(metadata))
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
    print("🚀 EMBEDDING NHIỀU FILE VÀO CHROMADB - GOOGLE GEMINI")
    print("=" * 60)

    print(f"✅ Gemini API: {EMBEDDING_MODEL}")

    json_files = glob.glob(os.path.join(INPUT_DIR, "*.json"))
    if not json_files:
        print(f"❌ Không tìm thấy file JSON nào trong {INPUT_DIR}")
        return

    print(f"🔍 Đã tìm thấy {len(json_files)} file JSON. Chuẩn bị kết nối DB...\n")

    collection, existing_count = setup_chroma(CHROMA_DB_PATH, COLLECTION_NAME)
    existing_ids = get_existing_ids(collection) if existing_count > 0 else set()
    
    total_success = 0
    total_errors = 0
    total_skipped = 0

    for filepath in json_files:
        print("\n" + "-" * 40)
        print(f"📄 Đang xử lý: {os.path.basename(filepath)}")
        chunks = load_chunks(filepath)
        
        success, errors, skipped = embed_and_store(chunks, collection, existing_ids)
        
        # Cập nhật lại existing_ids cho file tiếp theo
        # Nhưng ở đây không cần thiết lắm nếu các ID chunk là duy nhất trên toàn bộ
        # Tuy nhiên để chắc chắn, ta có thể không cần lấy lại vì Collection sẽ update.
        
        total_success += success
        total_errors += errors
        total_skipped += skipped

    final_count = collection.count()

    print("\n" + "=" * 60)
    print("📊 KẾT QUẢ CUỐI CÙNG TẤT CẢ CÁC FILE")
    print("=" * 60)
    print(f"   ⏭️  Đã có sẵn  : {total_skipped:>4} chunks")
    print(f"   ✅ Mới thêm   : {total_success:>4} chunks")
    print(f"   ❌ Lỗi        : {total_errors:>4} chunks")
    print(f"   📈 Tổng DB    : {final_count:>4} vectors")
    print(f"   📁 Lưu tại    : {CHROMA_DB_PATH}")
    print(f"   🗂️  Collection  : {COLLECTION_NAME}")
    print("=" * 60)
    
    if total_errors == 0:
        print("🎉 HOÀN THÀNH XUẤT SẮC! Dữ liệu sẵn sàng để query.")
    else:
        print(f"⚠️  Hoàn thành với {total_errors} lỗi. Chạy lại script để embed các chunk bị lỗi.")


if __name__ == "__main__":
    main()
