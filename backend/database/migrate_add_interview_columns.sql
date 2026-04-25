-- =============================================================================
-- Migration: Thêm các cột còn thiếu vào bảng interviews và interview_questions
-- Chạy script này nếu database đã tồn tại trước khi schema được cập nhật.
-- Dùng IF NOT EXISTS để an toàn – chạy nhiều lần không bị lỗi.
-- =============================================================================

-- Bảng interviews: thêm cột level (nếu chưa có)
ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS level VARCHAR(50) NOT NULL DEFAULT 'Junior';

-- Bảng interviews: thêm cột language (nếu chưa có)
ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS language VARCHAR(50) NOT NULL DEFAULT 'vi';

-- Bảng interviews: thêm cột status (nếu chưa có)
ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'in_progress';

-- Bảng interviews: thêm cột overall_score (nếu chưa có)
ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS overall_score NUMERIC(5, 2);

-- Bảng interviews: thêm cột overall_feedback (nếu chưa có)
ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS overall_feedback TEXT;

-- Bảng interviews: thêm cột completed_at (nếu chưa có)
ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Bảng interviews: thêm cột started_at (nếu chưa có)
ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Bảng interviews: thêm cột topic (nếu chưa có)
ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS topic VARCHAR(255);

-- Bảng interview_questions: thêm cột question_text (nếu chưa có)
ALTER TABLE interview_questions
    ADD COLUMN IF NOT EXISTS question_text TEXT;

-- Bảng interview_questions: thêm cột user_answer (nếu chưa có)
ALTER TABLE interview_questions
    ADD COLUMN IF NOT EXISTS user_answer TEXT;

-- Bảng interview_questions: thêm cột ai_evaluation (nếu chưa có)
ALTER TABLE interview_questions
    ADD COLUMN IF NOT EXISTS ai_evaluation TEXT;

-- Bảng interview_questions: thêm cột score (nếu chưa có)
ALTER TABLE interview_questions
    ADD COLUMN IF NOT EXISTS score NUMERIC(5, 2);

-- Bảng interview_questions: thêm cột question_order (nếu chưa có)
ALTER TABLE interview_questions
    ADD COLUMN IF NOT EXISTS question_order INTEGER NOT NULL DEFAULT 0;

-- Bảng interview_questions: thêm cột asked_at (nếu chưa có)
ALTER TABLE interview_questions
    ADD COLUMN IF NOT EXISTS asked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Bảng interview_questions: thêm cột answered_at (nếu chưa có)
ALTER TABLE interview_questions
    ADD COLUMN IF NOT EXISTS answered_at TIMESTAMP WITH TIME ZONE;

-- Index phòng vấn (nếu chưa có)
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_interview_id ON interview_questions(interview_id);

-- Tạo bảng nếu chưa tồn tại (trường hợp database hoàn toàn trống ngoại trừ users)
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

-- Xác nhận kết quả
SELECT
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name IN ('interviews', 'interview_questions')
ORDER BY table_name, ordinal_position;
