-- =============================================================================
-- Migration Cleanup: Dọn dẹp schema cũ
-- Xoá foreign key và cột session_id cũ trong interview_questions
-- Đây là migration an toàn – KHÔNG xóa dữ liệu quan trọng
-- =============================================================================

-- Bước 1: Xóa foreign key ràng buộc session_id → interview_sessions (schema cũ)
ALTER TABLE interview_questions
    DROP CONSTRAINT IF EXISTS interview_questions_session_id_fkey;

-- Bước 2: Xóa cột session_id (không dùng trong schema mới)
ALTER TABLE interview_questions
    DROP COLUMN IF EXISTS session_id;

-- Bước 3: Xóa các cột cũ không còn dùng trong schema mới
-- (Giữ lại vì có thể có data cũ - chỉ bỏ constraint nếu cần)
-- ALTER TABLE interview_questions DROP COLUMN IF EXISTS reference;
-- ALTER TABLE interview_questions DROP COLUMN IF EXISTS topic;
-- ALTER TABLE interview_questions DROP COLUMN IF EXISTS level;
-- ALTER TABLE interview_questions DROP COLUMN IF EXISTS strengths;
-- ALTER TABLE interview_questions DROP COLUMN IF EXISTS weaknesses;
-- ALTER TABLE interview_questions DROP COLUMN IF EXISTS suggestions;

-- Bước 4: Kiểm tra xem interview_sessions có data cũ không trước khi xóa
SELECT COUNT(*) as so_session_cu FROM interview_sessions;

-- Bước 5: Xóa bảng interview_sessions cũ (chỉ chạy sau khi xác nhận không cần data)
-- UNCOMMENT dòng dưới nếu muốn xóa bảng cũ:
-- DROP TABLE IF EXISTS interview_sessions;

-- Bước 6: Xác nhận cấu trúc cuối cùng
\d interview_questions
