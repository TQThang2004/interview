"""
Script: check_chroma.py
Kiem tra ket qua embedding trong ChromaDB va thu query tim kiem
"""
import chromadb
import google.generativeai as genai
from collections import Counter

import os

from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(dotenv_path=env_path, override=True)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Lỗi: Không tìm thấy GOOGLE_API_KEY trong file .env")
CHROMA_DB_PATH = os.path.join(os.path.dirname(__file__), "../../chroma_db")
COLLECTION_NAME = "interview_questions"
EMBEDDING_MODEL = "models/gemini-embedding-001"

def main():
    print("=" * 60)
    print("KIEM TRA KET QUA CHROMADB")
    print("=" * 60)

    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    col = client.get_collection(COLLECTION_NAME)
    total = col.count()
    print(f"\n[OK] Tong so vectors da luu: {total}")

    print("\n[...] Dang doc metadata de thong ke...")
    result = col.get(include=["metadatas"])

    instructions = Counter()
    levels = Counter()
    for m in result["metadatas"]:
        instructions[m.get("instruction", "?")] += 1
        for lv in m.get("level", "").split(","):
            lv = lv.strip()
            if lv:
                levels[lv] += 1

    print("\n--- Phan bo theo loai cau hoi (instruction) ---")
    for k, v in sorted(instructions.items(), key=lambda x: -x[1]):
        bar = "#" * (v // 5)
        print(f"  {k:<45} {v:>3}  {bar}")

    print("\n--- Phan bo theo cap do (level) ---")
    level_order = ["Intern", "Junior", "Middle", "Senior"]
    for lv in level_order:
        v = levels.get(lv, 0)
        bar = "#" * (v // 5)
        print(f"  {lv:<10} {v:>3}  {bar}")

    print("\n" + "=" * 60)
    print("THU QUERY TIM KIEM")
    print("=" * 60)

    genai.configure(api_key=GOOGLE_API_KEY)

    test_queries = [
        "What is overfitting in machine learning?",
        "How to handle imbalanced dataset?",
        "Explain KNN algorithm",
    ]

    for query in test_queries:
        print(f'\n[Query]: "{query}"')
        query_embedding = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=query,
            task_type="retrieval_query"
        )["embedding"]

        results = col.query(
            query_embeddings=[query_embedding],
            n_results=3,
            include=["documents", "metadatas", "distances"]
        )

        for i, (doc, meta, dist) in enumerate(zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        )):
            similarity = round((1 - dist) * 100, 1)
            print(f"\n  [#{i+1}] Do tuong dong: {similarity}%")
            print(f"  Loai: {meta.get('instruction','?')} | Level: {meta.get('level','?')}")
            lines = doc.strip().split("\n")
            for line in lines[:4]:
                print(f"  {line}")

    print("\n" + "=" * 60)
    print("[DONE] Kiem tra hoan tat! ChromaDB hoat dong tot.")
    print("=" * 60)


if __name__ == "__main__":
    main()
