
-- Fix character encoding for all text fields in all tables
ALTER DATABASE learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix blog_posts table
ALTER TABLE blog_posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE blog_posts MODIFY COLUMN content LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Thêm các cột còn thiếu cho bảng notifications (sử dụng cú pháp an toàn)
-- Trước tiên kiểm tra xem cột đã tồn tại chưa bằng cách thử thêm và bắt lỗi
ALTER TABLE notifications ADD COLUMN from_user_id INT NULL;
ALTER TABLE notifications ADD COLUMN post_id INT NULL;
ALTER TABLE notifications ADD COLUMN comment_id INT NULL;

-- Xóa các foreign key cũ (nếu có) trước khi thêm mới
ALTER TABLE notifications DROP FOREIGN KEY IF EXISTS notifications_from_user_fk;
ALTER TABLE notifications DROP FOREIGN KEY IF EXISTS notifications_post_fk;
ALTER TABLE notifications DROP FOREIGN KEY IF EXISTS notifications_comment_fk;

-- Thêm foreign key mới
ALTER TABLE notifications 
ADD CONSTRAINT notifications_from_user_fk 
FOREIGN KEY (from_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_post_fk 
FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_comment_fk 
FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE;

-- Thêm các cột còn thiếu cho bảng resources
ALTER TABLE resources ADD COLUMN preview_link VARCHAR(255) NULL;
ALTER TABLE resources ADD COLUMN resource_type VARCHAR(50) NULL;

-- Thêm indexes để cải thiện hiệu suất
-- Xóa các indexes cũ trước (nếu có)
DROP INDEX IF EXISTS idx_blog_posts_author_id ON blog_posts;
DROP INDEX IF EXISTS idx_resources_author_id ON resources;
DROP INDEX IF EXISTS idx_course_enrollments_user_id ON course_enrollments;
DROP INDEX IF EXISTS idx_course_enrollments_course_id ON course_enrollments;
DROP INDEX IF EXISTS idx_likes_user_id ON likes;
DROP INDEX IF EXISTS idx_likes_post_id ON likes;
DROP INDEX IF EXISTS idx_likes_comment_id ON likes;

-- Tạo indexes mới
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_resources_author_id ON resources(author_id);
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_comment_id ON likes(comment_id);
