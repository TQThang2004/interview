from __future__ import annotations

import json
from pathlib import Path

import chromadb

ROOT_DIR = Path(__file__).resolve().parents[2]
CHROMA_DB_PATH = ROOT_DIR / "chroma_db"
INPUT_DIR = ROOT_DIR / "data_pipeline" / "dataset" / "chunk"
COLLECTION_NAME = "interview_questions"
BATCH_SIZE = 100


def clean_metadata(metadata: dict) -> dict:
    clean = {}
    for key, value in metadata.items():
        if isinstance(value, bool):
            clean[key] = str(value).lower()
        elif value is None:
            clean[key] = ""
        else:
            clean[key] = str(value)
    return clean


def main() -> int:
    client = chromadb.PersistentClient(path=str(CHROMA_DB_PATH))
    collection = client.get_collection(COLLECTION_NAME)
    existing_ids = set(collection.get(include=[])["ids"])

    ids = []
    metadatas = []
    for path in sorted(INPUT_DIR.glob("*.json")):
        chunks = json.loads(path.read_text(encoding="utf-8"))
        for chunk in chunks:
            chunk_id = chunk["metadata"]["chunk_id"]
            if chunk_id in existing_ids:
                ids.append(chunk_id)
                metadatas.append(clean_metadata(chunk["metadata"]))

    for start in range(0, len(ids), BATCH_SIZE):
        collection.update(
            ids=ids[start:start + BATCH_SIZE],
            metadatas=metadatas[start:start + BATCH_SIZE],
        )

    print(f"Updated metadata for {len(ids)} existing vectors.")
    print(f"Collection total vectors: {collection.count()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
