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

from app.core.logging import get_logger
from app.core.config import (
    GOOGLE_API_KEY_EMBEDDING,
    EMBED_MODEL,
    CHROMA_DB_PATH,
    COLLECTION_NAME,
    TOP_K_RETRIEVE,
)
from app.utils.gemini_client import embed_contents

logger = get_logger(__name__)


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
    matching_topics: list[str] | None = None,
    gap_topics: list[str] | None = None,
) -> list[RawDoc]:
    """
    Truy vấn ChromaDB và trả về ngân hàng câu hỏi đầy đủ (TOP_K_RETRIEVE docs).

    Phân bổ slot:
    - 60% cho matching_topics (kỹ năng ứng viên ĐÃ CÓ theo JD)
    - 40% cho gap_topics (kỹ năng ứng viên THIẾU theo JD)

    Args:
        topics:           All query strings (backward compat, dùng khi matching/gap chưa có).
        level:            Cấp độ phỏng vấn (junior/mid/senior…) để lọc metadata.
        matching_topics:  Query strings cho kỹ năng khớp (60%).
        gap_topics:       Query strings cho kỹ năng thiếu (40%).

    Returns:
        list[RawDoc] tối đa TOP_K_RETRIEVE phần tử, sắp xếp theo relevance.
    """
    # Nếu có matching/gap topics, dùng chúng; ngược lại fallback về topics cũ
    if matching_topics or gap_topics:
        m_topics = matching_topics or []
        g_topics = gap_topics or []
        all_query_topics = m_topics + g_topics
    else:
        # Backward compat: topic đầu = matching, còn lại = gap
        all_query_topics = topics
        m_topics = topics[:1] if topics else []
        g_topics = topics[1:] if len(topics) > 1 else []

    if not all_query_topics:
        return []

    collection = _get_collection()

    # ── Embedding batch (1 API call cho tất cả topics) ───────────────────────
    try:
        query_embeddings = embed_contents(
            api_key=GOOGLE_API_KEY_EMBEDDING,
            contents=all_query_topics,
            model=EMBED_MODEL,
            task_type="RETRIEVAL_QUERY",
        )
        if not query_embeddings:
            return []
    except Exception as e:
        logger.warning("Failed to embed RAG retrieval query: %s", e)
        return []

    # ── ChromaDB batch query ─────────────────────────────────────────────────
    try:
        results = collection.query(
            query_embeddings=query_embeddings,
            n_results=TOP_K_RETRIEVE,
            include=["documents", "metadatas", "distances"],
        )
    except Exception as e:
        logger.warning("Failed to query ChromaDB: %s", e)
        return []

    # ── Phân loại: valid (đúng level) vs fallback ────────────────────────────
    valid_per_topic: dict[str, list[RawDoc]] = {t: [] for t in all_query_topics}
    fallback: list[RawDoc] = []
    seen_docs: set[str] = set()

    for i, topic in enumerate(all_query_topics):
        for doc, meta, dist in zip(
            results["documents"][i],
            results["metadatas"][i],
            results["distances"][i],
        ):
            if doc in seen_docs:
                continue
            seen_docs.add(doc)

            raw = RawDoc(document=doc, distance=dist, topic=topic, metadata=meta)
            meta_level = meta.get("level", "")
            if not meta_level or level.lower() in meta_level.lower():
                valid_per_topic[topic].append(raw)
            else:
                fallback.append(raw)

    # ── Phân bổ slot: 60% matching, 40% gap ─────────────────────────────────
    matching_slots = max(5, round(TOP_K_RETRIEVE * 0.6)) if g_topics else TOP_K_RETRIEVE
    gap_slots = TOP_K_RETRIEVE - matching_slots if g_topics else 0

    selected: list[RawDoc] = []

    # Slot matching topics (60%)
    if m_topics:
        per_m = max(1, matching_slots // len(m_topics))
        for t in m_topics:
            candidates = _sorted_by_distance_bands(valid_per_topic.get(t, []))
            selected.extend(candidates[:per_m])

    # Slot gap topics (40%)
    if gap_slots > 0 and g_topics:
        per_g = max(1, gap_slots // len(g_topics))
        for t in g_topics:
            candidates = _sorted_by_distance_bands(valid_per_topic.get(t, []))
            selected.extend(candidates[:per_g])

    # Fallback nếu vẫn chưa đủ TOP_K_RETRIEVE
    if len(selected) < TOP_K_RETRIEVE:
        fallback.sort(key=lambda c: c.distance)
        selected.extend(fallback[: TOP_K_RETRIEVE - len(selected)])

    return selected
