-- =============================================================================
-- Migration: Thêm bảng Practice Sessions (Luyện tập theo Chủ đề)
-- Ngày: 2026-06-11
-- =============================================================================

-- Bảng practice_sessions: mỗi bài kiểm tra luyện tập
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(100) NOT NULL,              -- "React", "Python", "SQL"...
    level VARCHAR(50) NOT NULL DEFAULT 'Junior',
    language VARCHAR(50) NOT NULL DEFAULT 'vi',
    num_questions INTEGER NOT NULL DEFAULT 5,
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress | completed | cancelled
    correct_count INTEGER DEFAULT 0,          -- số câu đạt >= 6 điểm
    overall_score NUMERIC(5, 2),              -- điểm trung bình
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Bảng practice_answers: từng câu hỏi + trả lời trong bài kiểm tra
CREATE TABLE IF NOT EXISTS practice_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    reference_answer TEXT,                    -- đáp án tham khảo từ ChromaDB
    user_answer TEXT,
    ai_evaluation TEXT,                       -- nhận xét AI dạng JSON
    score NUMERIC(5, 2),
    question_order INTEGER NOT NULL,
    asked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_topic ON practice_sessions(topic);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_status ON practice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_practice_answers_session_id ON practice_answers(session_id);
