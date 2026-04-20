import os
import chromadb

CHROMA_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../chroma_db"))
client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = client.get_collection("interview_questions")

print("Xóa các question insert bằng UUID ngẫu nhiên trước đó...")
try:
    collection.delete(where={"source": "interviewquestions.guru"})
    print("Thành công! Số lượng còn lại:", collection.count())
except Exception as e:
    print("Lỗi:", e)
