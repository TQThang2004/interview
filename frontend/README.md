# 🤖 Smart AI Interviewer - Hệ Thống Phỏng Vấn Thông Minh

Chào mừng bạn đến với **Smart AI Interviewer**, một ứng dụng web hiện đại được thiết kế để giúp ứng viên chuẩn bị cho các buổi phỏng vấn xin việc một cách chuyên nghiệp nhất thông qua sức mạnh của Trí tuệ nhân tạo (AI).

![AI Interviewer](https://img.shields.io/badge/AI-Interviewer-blue?style=for-the-badge&logo=openai)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)

---

## ✨ Tính năng nổi bật

- 📄 **Phân tích CV & JD:** Tự động trích xuất thông tin từ CV (PDF) và Mô tả công việc (JD) để tạo nội dung phỏng vấn sát thực tế nhất.
- 🧠 **Cơ chế RAG (Retrieval-Augmented Generation):** Sử dụng công nghệ AI tiên tiến để tạo câu hỏi thông minh dựa trên kỹ năng của ứng viên và yêu cầu của doanh nghiệp.
- 🎙️ **Giao tiếp bằng Giọng nói:** Tích hợp **Speech-to-Text (STT)** để nhận diện câu trả lời và **Text-to-Speech (TTS)** để AI đặt câu hỏi, mang lại trải nghiệm như thật.
- 📊 **Đánh giá Chuyên sâu:** Chấm điểm và đưa ra nhận xét chi tiết cho từng câu trả lời dựa trên tiêu chí: Kiến thức kỹ thuật, Sự rõ ràng và Tính logic.
- 📈 **Báo cáo Kết quả:** Tổng kết hiệu suất sau buổi phỏng vấn với biểu đồ trực quan.

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS (Modern Glassmorphism Design)
- **Icons:** Lucide React
- **State Management:** React Hooks (useState, useEffect, useRef)

### Backend
- **Framework:** FastAPI
- **AI Models:** Google Gemini AI (cung cấp STT, TTS và LLM)
- **PDF Processing:** PyMuPDF / PDFMiner
- **Service Layer:** Audio Service, RAG Service

---

## 🚀 Hướng dẫn Cài đặt

### 1. Yêu cầu hệ thống
- Node.js (v18 trở lên)
- Python 3.9+
- API Key của Google Gemini

### 2. Cài đặt Frontend
```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các dependencies
npm install

# Chạy ứng dụng ở chế độ phát triển
npm run dev
```

### 3. Cài đặt Backend
```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo môi trường ảo (khuyến nghị)
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate

# Cài đặt các thư viện cần thiết
pip install -r requirements.txt

# Khởi chạy server FastAPI
uvicorn main:app --reload
```

---

## 📂 Thu mục Dự án

```text
├── frontend/
│   ├── src/
│   │   ├── components/    # Các thành phần UI (SetupForm, InterviewPanel, ...)
│   │   ├── services/      # API calls (Axios/Fetch)
│   │   ├── hooks/         # Custom hooks (useAudioRecorder)
│   │   └── App.jsx        # Component chính điều hướng trạng thái
│   └── tailwind.config.js
├── backend/
│   ├── services/          # Xử lý Logic (AI, RAG, Audio)
│   ├── schemas/           # Pydantic models cho API
│   └── main.py            # Entry point của FastAPI
└── ...
```

---

## 📝 Giấy phép

Dự án này được phát triển cho mục đích giáo dục và thực hành phỏng vấn. 

Copyright © 2024 **TQThang**. All rights reserved.
