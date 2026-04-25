-- =============================================================================
-- Migration: Thêm cột google_id vào bảng users (nếu chưa có)
-- Chạy file này nếu database đã tồn tại trước khi schema.sql v2 được áp dụng.
-- =============================================================================

-- Thêm cột google_id (Google OAuth sub identifier)
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Tạo index tối ưu tìm kiếm theo google_id
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Kiểm tra kết quả
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('google_id', 'avatar_url', 'password_hash');