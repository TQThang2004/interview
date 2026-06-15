from __future__ import annotations

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.services.practice_service import get_rag_status  # noqa: E402


def main() -> int:
    status = get_rag_status()
    print(f"Collection: {status.get('collection_name')}")
    print(f"Chroma path: {status.get('chroma_path')}")
    print(f"Total vectors: {status.get('total_vectors')}")
    print("Topics:")
    for topic, count in status.get("topics", {}).items():
        print(f"  - {topic}: {count}")
    missing = status.get("missing_topics", [])
    if missing:
        print("Missing topics:")
        for topic in missing:
            print(f"  - {topic}")
        return 1
    print("All expected topics are available.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
