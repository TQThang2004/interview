-- =============================================================================
-- AI Mock Interview - Database Schema (v2 - Cap nhat 2026-04)
-- =============================================================================
-- Mo ta: Script khoi tao toan bo cau truc database cho ung dung AI Mock Interview.
-- Chay script nay tren PostgreSQL de tao cac bang, kieu du lieu va index can thiet.
--
-- NEU database da ton tai, chay cac file migration thay vi script nay:
--   1. backend/database/migrate_add_interview_columns.sql
--   2. backend/database/migrate_cleanup_old_schema.sql
-- =============================================================================

-- Kich hoat extension de tao UUID tu dong
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Dinh nghia kieu du lieu cho User Role
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('user', 'admin');

-- =============================================================================
-- Bang Users
-- Chua thong tin dang nhap (Bao gom email/pass va Google Auth) va Profile
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    role user_role DEFAULT 'user',
    avatar_url VARCHAR(500),
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Bang Interviews
-- Luu lich su cac phien phong van
-- =============================================================================
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL DEFAULT 'Junior',
    language VARCHAR(50) NOT NULL DEFAULT 'vi',
    status VARCHAR(50) DEFAULT 'in_progress',
    overall_score NUMERIC(5, 2),
    overall_feedback TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- Bang Interview_Questions
-- Luu chi tiet luong cau hoi, cau tra loi va danh gia cua tung cau
-- =============================================================================
CREATE TABLE IF NOT EXISTS interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    user_answer TEXT,
    ai_evaluation TEXT,
    score NUMERIC(5, 2),
    question_order INTEGER NOT NULL,
    asked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- INDEX - Toi uu hoa truy van
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_interview_id ON interview_questions(interview_id);
