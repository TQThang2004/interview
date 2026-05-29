-- =============================================================================
-- Migration: Community Moderation + Notifications
-- Ngày: 2026-05
-- Mô tả: Thêm hệ thống kiểm duyệt bài viết community và bảng notifications
-- =============================================================================

-- 1. Thêm cột status vào community_posts
ALTER TABLE community_posts
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2. Tất cả bài cũ đã tồn tại → tự động approved
UPDATE community_posts
SET status = 'approved'
WHERE status IS NULL OR status = 'pending';

-- 3. Index để query nhanh theo status
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_status ON community_posts(author_id, status);

-- 4. Tạo bảng notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,     -- 'post_approved' | 'post_rejected'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
