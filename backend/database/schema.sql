-- =============================================================================
-- AI Mock Interview - Database Schema
-- =============================================================================
-- Mô tả: Script khởi tạo toàn bộ cấu trúc database cho ứng dụng AI Mock Interview.
-- Chạy script này trên PostgreSQL để tạo các bảng, kiểu dữ liệu và index cần thiết.
-- =============================================================================

-- Kích hoạt extension để tạo UUID tự động
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Định nghĩa kiểu dữ liệu cho User Role
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- =============================================================================
-- Bảng Users
-- Chứa thông tin đăng nhập (Bao gồm email/pass và Google Auth) và Profile
-- =============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),            -- Có thể null nếu người dùng đăng nhập bằng Google
    google_id VARCHAR(255) UNIQUE,         -- ID trả về từ Google OAuth
    role user_role DEFAULT 'user',         -- Phân quyền
    avatar_url VARCHAR(500),               -- URL ảnh đại diện (có thể cập nhật sau)
    phone_number VARCHAR(20),              -- Số điện thoại (có thể cập nhật sau)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Bảng Interviews
-- Lưu lịch sử các phiên phỏng vấn
-- =============================================================================
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,           -- Chủ đề phỏng vấn (VD: Frontend React, Backend Python)
    level VARCHAR(50) NOT NULL DEFAULT 'Beginner',   -- Cấp độ: Beginner, Intermediate, Advanced
    language VARCHAR(50) NOT NULL DEFAULT 'English', -- Ngôn ngữ: English, Vietnamese
    status VARCHAR(50) DEFAULT 'in_progress',        -- Trạng thái: in_progress, completed, cancelled
    overall_score NUMERIC(5, 2),           -- Điểm số tổng quan của cả buổi phỏng vấn
    overall_feedback TEXT,                 -- Đánh giá tổng quan từ AI
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE             -- NULL nếu chưa hoàn thành
);

-- =============================================================================
-- Bảng Interview_Questions
-- Lưu chi tiết luồng câu hỏi, câu trả lời và đánh giá của từng câu
-- =============================================================================
CREATE TABLE interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,           -- Câu hỏi AI đưa ra
    user_answer TEXT,                      -- Câu trả lời của ứng viên (có thể thu từ Speech-to-Text)
    ai_evaluation TEXT,                    -- Đánh giá riêng cho câu trả lời này
    score NUMERIC(5, 2),                   -- Điểm cho câu trả lời này
    question_order INTEGER NOT NULL,       -- Thứ tự câu hỏi trong buổi phỏng vấn
    asked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE  -- NULL nếu chưa trả lời
);

-- =============================================================================
-- INDEX - Tối ưu hóa truy vấn
-- =============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interview_questions_interview_id ON interview_questions(interview_id);
