# AI Mock Interviewer System

Dự án Hệ thống phỏng vấn thử bằng Trí Tuệ Nhân Tạo (AI Mock Interviewer) là một ứng dụng toàn diện giúp người dùng luyện tập kỹ năng phỏng vấn kỹ thuật từ Intern tới Senior. Thông qua dữ liệu được nạp vào cơ sở dữ liệu Vector và sự kết hợp của GenAI (Google Gemini), hệ thống có thể đóng vai trò như một Interviewer ảo: chọn lọc câu hỏi, đọc câu hỏi bằng giọng nói, thu âm nhận diện câu trả lời kết hợp cả Tiếng Anh và Tiếng Việt (Vinglish), và cuối cùng là chấm điểm kèm nhận xét chi tiết.

---

## 🛠 Những Thư viện / Công nghệ được sử dụng

### 1. Phía Frontend (Ứng dụng Client)
Nằm trong thư mục `backend/`
- **ReactJS & Vite**: Giúp xây dựng UI thành các Component modular chạy nhanh.
- **Tailwind CSS**: Framework tiện lợi cho phép thiết kế giao diện theo sát chuẩn UI/UX hiện đại (gradient, animation).
- **lucide-react**: Thư viện chứa các Icon SVG sử dụng trong ứng dụng.
- Sử dụng trực tiếp `MediaRecorder API` và `Audio` API trên trình duyệt Web để thu phát âm thanh.

### 2. Phía Backend (Máy chủ xử lý AI)
Nằm trong thư mục `frontend/`
- **FastAPI** & **Uvicorn**: Máy chủ Backend với hiệu năng truy xuất cao để dễ đóng mở luồng API nhanh chóng giữa React và GenAI.
- **google-generativeai**: SDK chính thống tương tác với hệ thống AI của Google, sử dụng để: Vectorize (Embedding) văn bản, Transcribe Multi-modal nhận diện tiếng nói, và Chat Generative LLM đánh giá / dịch thuật ngữ AI.
- **chromadb**: Cơ sở dữ liệu vec-tơ lưu trữ không gian semantic nhằm tìm nhanh câu trả lời theo ngữ cảnh RAG (Retrieval-Augmented Generation).
- **gTTS** (Google Text-to-Speech): Chuyển văn bản câu hỏi thành Giọng đọc AI trả về cho Frontend phát.
- **pydantic**, **python-dotenv**: Giúp quản lý schema validation API và load nhanh các biến bảo mật từ file hệ thống `.env`.

---

## 🚀 Logic chạy & Luồng hoạt động của Source Code

Toàn bộ hệ thống chạy dựa trên hai luồng chia tách rõ ràng: **Tiền xử lý Data** và **Application Hoạt động thời gian thực**.

### A. Luồng Tiền xử lý & Nạp Kiến Thức chuẩn bị (Data Pipeline)
Được chạy dưới local terminal nội bộ bởi Dev với các file trực tiếp tại gốc nhằm chuẩn bị dữ liệu phỏng vấn:

1. **Xử lý thô (`process_sample.py`)**: Script này đọc dữ liệu CSV thô từ `sample.csv` (chứa input, answer, question origin). Làm sạch, gộp metadata (loại chủ đề, kinh nghiệm level) và dump ra một file JSON được chuẩn hoá gọi là `chunked_sample.json`.
2. **Nhúng Vector Nâng Cao (`embed_to_chroma.py`)**: Đọc từng chunk file `chunked_sample.json` và yêu cầu Gemini Embedding API biểu thị chúng dưới dạng Vec-tơ số học. Sau đó lưu tất cả khối lượng lớn này vào một local DB là thư mục `chroma_db/`. (Quá trình này có tính năng tự động delay exponential mỗi khi hit threshold của Google rate limit API).
3. **Kiểm tra trạng thái (`check_chroma.py`)**: Load thử xem thư mục local DB đắp xong chưa, test thử quá trình tìm kiếm với top K xem điểm số tương đương cao nhất. Log nằm tại `check_result.txt`.

### B. Luồng hoạt động Ứng dụng AI Phỏng Vấn (Live App Workflow)
Được phát qua giao diện Web khi Start backend FastAPI (`main.py`) và Frontend vite webserver:

1. **Khởi tạo (Start Interview)**: 
   Người dùng thông qua giao diện Web React tại màn hình chính thiết lập "Chủ đề Kiến thức", "Mức độ level", và "Ngôn ngữ đọc/hiển thị". Frontend submit `/api/start-interview`. 
   Phía sau Backend (cụ thể script `rag_services.py`) tiến hành query RAG vào `chroma_db` để truy vấn ra Top các câu hỏi liên quan sát chủ đề nhất. Đồng thời trộn ngẫu nhiên và dùng Gemini dịch mượt mà qua lại giữa 2 khung Tiếng Anh - Tiếng Việt nếu user tick chọn hệ Tiếng Việt.

2. **Giao tiếp Hỏi - Đáp**:
   - Backend xuất list dạng JSON. Frontend sẽ kích hoạt gọi TTS âm thanh (thông qua API `/api/tts` dùng gTTS generator) đọc từng chữ nội dung câu hỏi cho giả lập phỏng vấn thực.
   - Thí sinh khi nghe xong bấm record Icon Mic. Micro kích hoạt, đóng module Blob âm lượng và gửi audio WebM tới backend theo enpoint `/api/transcribe`.
   - Lớp LLM thông qua gemini Flash tiến hành đọc File Audio, thực hiện trích lọc ký tự "Vinglish" theo bộ Prompt được tinh chỉnh (ví dụ: `rì ắc` -> `React`, `Nốt di ét` -> `NodeJS`) đẩy ra String text thô rồi trả ngược lại lên UI cho ứng tuyển viên nhìn lại câu trả lời.

3. **Chấm Điểm Nhận Xét (Evaluate)**:
   Sau khi chốt câu trả lời, Frontend ném câu này + Cau tham khảo (ở DB reference) vào endpoint (`/api/evaluate`).
   Gemini trong `rag_services.py` đóng vai giám khảo chuyên môn tuỳ theo senior hay junior sẽ so khớp và bóc tách ra thành object cố định bao gồm:
   - Điểm số: 7/10
   - Điểm mạnh: ...
   - Điểm thiếu sót: ...
   - Gợi ý ôn tập: ...
   
   Frontend nhận tín hiệu render ra View đẹp mắt, bấm Next sẽ trỏ tới câu tiếp theo trong Queue. Kết thúc màn phỏng vấn sẽ cộng dồn Tổng điểm và đánh giá liệu thí sinh đã sẵn sàng ứng tuyển thực hay chưa.

*(Lưu ý: Bạn cũng có một file `rag_interview_test.py` cung cấp chức năng CLI Mock Test để test Terminal thay vì chạy UI Graphic nếu backend muốn kiểm thử luồng nhanh chóng)*
