"""
RAG Retriever – Bước R (Retrieve) trong pipeline RAG.

Chức năng:
- Nhúng (embed) các query string thành vector qua Gemini Embedding API.
- Truy vấn ChromaDB theo batch để lấy TOP_K tài liệu liên quan.
- Phân bổ slot và xếp hạng: topic chính chiếm ~60%, topic phụ ~40%.
- Trả về list[RawDoc] để Augmentor xử lý tiếp.

Không gọi LLM text-generation tại bước này.
"""
from __future__ import annotations

import random

import chromadb
import google.generativeai as genai

from app.core.config import (
    GOOGLE_API_KEY_EMBEDDING,
    EMBED_MODEL,
    CHROMA_DB_PATH,
    COLLECTION_NAME,
    TOP_K_RETRIEVE,
)


# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------

class RawDoc:
    """Tài liệu thô lấy từ ChromaDB, kèm metadata để Augmentor sử dụng."""

    def __init__(self, document: str, distance: float, topic: str, metadata: dict):
        self.document = document
        self.distance = distance
        self.topic = topic
        self.metadata = metadata

    def preview(self, length: int = 300) -> str:
        return self.document.replace("\n", " ")[:length]


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _get_collection():
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    return client.get_collection(COLLECTION_NAME)


def _sorted_by_distance_bands(candidates: list[RawDoc]) -> list[RawDoc]:
    """
    Sắp theo distance ASC, xáo nhẹ trong mỗi band 0.05 để đa dạng
    mà vẫn giữ tính liên quan (band nhỏ = khoảng cách nhỏ = relevant hơn).
    """
    bands: dict[int, list[RawDoc]] = {}
    for c in candidates:
        band = int(c.distance / 0.05)
        bands.setdefault(band, []).append(c)
    result: list[RawDoc] = []
    for key in sorted(bands):
        group = bands[key]
        random.shuffle(group)
        result.extend(group)
    return result


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def retrieve_raw_docs(
    topics: list[str],
    level: str,
) -> list[RawDoc]:
    """
    Truy vấn ChromaDB và trả về ngân hàng câu hỏi đầy đủ (TOP_K_RETRIEVE docs).

    Retriever KHÔNG giới hạn số lượng output theo num_q – đó là việc của Augmentor.
    Nhiệm vụ duy nhất ở đây là lấy đủ TOP_K_RETRIEVE tài liệu liên quan nhất,
    phân bổ slot hợp lý theo topic chính/phụ, rồi trả về toàn bộ ngân hàng.

    Args:
        topics:  List topic/query string. Phần tử đầu = topic chính (~60% slot).
        level:   Cấp độ phỏng vấn (junior/mid/senior…) để lọc metadata.

    Returns:
        list[RawDoc] tối đa TOP_K_RETRIEVE phần tử, sắp xếp theo relevance.
    """
    if not topics:
        return []

    collection = _get_collection()

    # ── Embedding batch (1 API call cho tất cả topics) ───────────────────────
    genai.configure(api_key=GOOGLE_API_KEY_EMBEDDING)
    try:
        embed_result = genai.embed_content(
            model=EMBED_MODEL,
            content=topics,
            task_type="retrieval_query",
        )
        query_embeddings = embed_result["embedding"]
        # Khi chỉ có 1 topic, API trả về flat list thay vì list-of-list
        if isinstance(query_embeddings[0], float):
            query_embeddings = [query_embeddings]
    except Exception as e:
        print(f"[Retriever] Lỗi embedding: {e}")
        return []

    # ── ChromaDB batch query ─────────────────────────────────────────────────
    try:
        results = collection.query(
            query_embeddings=query_embeddings,
            n_results=TOP_K_RETRIEVE,
            include=["documents", "metadatas", "distances"],
        )
    except Exception as e:
        print(f"[Retriever] Lỗi ChromaDB query: {e}")
        return []

    # ── Phân loại: valid (đúng level) vs fallback ────────────────────────────
    valid_per_topic: dict[str, list[RawDoc]] = {t: [] for t in topics}
    fallback: list[RawDoc] = []
    seen_docs: set[str] = set()

    for i, topic in enumerate(topics):
        for doc, meta, dist in zip(
            results["documents"][i],
            results["metadatas"][i],
            results["distances"][i],
        ):
            if doc in seen_docs:
                continue
            seen_docs.add(doc)

            raw = RawDoc(document=doc, distance=dist, topic=topic, metadata=meta)
            if level.lower() in meta.get("level", "").lower():
                valid_per_topic[topic].append(raw)
            else:
                fallback.append(raw)

    # ── Phân bổ slot theo TOP_K_RETRIEVE (ngân hàng đầy đủ) ─────────────────
    # Topic chính chiếm ~60% ngân hàng, các topic phụ chia đều phần còn lại.
    # Mục tiêu: trả về TỐI ĐA TOP_K_RETRIEVE docs, không cắt theo num_q.
    primary_topic = topics[0]
    secondary_topics = topics[1:]

    if secondary_topics:
        primary_slots = max(5, round(TOP_K_RETRIEVE * 0.6))   # ít nhất 5 docs cho topic chính
        secondary_slots = TOP_K_RETRIEVE - primary_slots
    else:
        primary_slots = TOP_K_RETRIEVE
        secondary_slots = 0

    selected: list[RawDoc] = []

    # Slot chủ đề chính
    primary_sorted = _sorted_by_distance_bands(valid_per_topic[primary_topic])
    selected.extend(primary_sorted[:primary_slots])

    # Slot chủ đề phụ
    if secondary_slots > 0 and secondary_topics:
        per_sec = max(1, secondary_slots // len(secondary_topics))
        for t in secondary_topics:
            candidates = _sorted_by_distance_bands(valid_per_topic[t])
            selected.extend(candidates[:per_sec])

    # Fallback nếu vẫn chưa đủ TOP_K_RETRIEVE
    if len(selected) < TOP_K_RETRIEVE:
        fallback.sort(key=lambda c: c.distance)
        selected.extend(fallback[: TOP_K_RETRIEVE - len(selected)])

    # ── Log ──────────────────────────────────────────────────────────────────
    print("\n" + "-" * 50)
    print(f">>> [Retriever] Ngân hàng câu hỏi: {len(selected)}/{TOP_K_RETRIEVE} docs từ ChromaDB")
    for i, doc in enumerate(selected):
        print(
            f"  [{i+1}] topic={doc.topic!r} dist={doc.distance:.4f}\n"
            f"       {doc.preview(200)}...\n"
        )
    print(f">>> [Retriever] → Augmentor sẽ chọn lọc & sinh câu hỏi từ ngân hàng này.")

    return selected
