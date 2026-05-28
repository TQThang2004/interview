-- =============================================================================
-- Migration: Tạo bảng cv_evaluations
-- Lưu lịch sử đánh giá CV (tối đa 2 bản/user)
-- File CV được lưu trên Cloudinary (resource_type=image, hỗ trợ PDF embed)
-- =============================================================================

CREATE TABLE IF NOT EXISTS cv_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- File CV trên Cloudinary
    original_filename VARCHAR(500) NOT NULL,
    cloudinary_url VARCHAR(1000) NOT NULL,        -- URL secure (dùng <iframe> embed)
    cloudinary_public_id VARCHAR(500) NOT NULL,   -- public_id để destroy khi xóa

    file_size_bytes INTEGER,

    -- Nội dung đã parse từ PDF
    cv_text TEXT,

    -- Kết quả đánh giá AI
    overall_score NUMERIC(4, 2),
    evaluation_result JSONB NOT NULL,             -- { overall, sections[], suggestions[] }

    -- Timestamps
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cv_evaluations_user_id ON cv_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_evaluations_evaluated_at ON cv_evaluations(evaluated_at DESC);
