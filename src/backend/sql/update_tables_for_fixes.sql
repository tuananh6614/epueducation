
-- Cập nhật bảng notifications để thêm trường from_user_id
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_user_id INT NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS post_id INT NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS comment_id INT NULL;
ALTER TABLE notifications ADD FOREIGN KEY IF NOT EXISTS (from_user_id) REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE notifications ADD FOREIGN KEY IF NOT EXISTS (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE;
ALTER TABLE notifications ADD FOREIGN KEY IF NOT EXISTS (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE;

-- Cập nhật bảng resources để thêm trường preview_link
ALTER TABLE resources ADD COLUMN IF NOT EXISTS preview_link VARCHAR(255) NULL;

-- Cập nhật bảng blog_posts để hỗ trợ upload ảnh và video
ALTER TABLE blog_posts MODIFY COLUMN content LONGTEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS has_video BOOLEAN DEFAULT FALSE;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS video_url VARCHAR(255) NULL;
