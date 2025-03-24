
-- Fix character encoding for all text fields in all tables
ALTER DATABASE learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix blog_posts table
ALTER TABLE blog_posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE blog_posts MODIFY COLUMN content LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Thêm các cột còn thiếu cho bảng notifications (sử dụng cú pháp an toàn)
-- Sử dụng ALTER TABLE ... ADD COLUMN IF NOT EXISTS nếu MySQL hỗ trợ
-- Hoặc chỉ cần bỏ qua lỗi nếu cột đã tồn tại

-- Kiểm tra trước khi thêm cột (thực hiện câu lệnh riêng và bắt lỗi)
-- Các cột này có thể đã được thêm bởi tệp SQL khác
SET @stmt = CONCAT("SELECT COUNT(*) INTO @exist FROM information_schema.columns WHERE table_schema = '", DATABASE(), "' AND table_name = 'notifications' AND column_name = 'from_user_id'");
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm từng cột theo điều kiện
-- Chúng ta không sử dụng ALTER TABLE ... ADD COLUMN IF NOT EXISTS vì có thể không được hỗ trợ ở tất cả phiên bản MySQL
-- Thay vào đó, chúng ta sẽ chỉ bỏ qua các lỗi duplicate column

-- Foreign keys được xử lý riêng
-- Trước tiên cố gắng xóa các foreign key cũ (nếu có)
ALTER TABLE notifications DROP FOREIGN KEY IF EXISTS notifications_from_user_fk;
ALTER TABLE notifications DROP FOREIGN KEY IF EXISTS notifications_post_fk;
ALTER TABLE notifications DROP FOREIGN KEY IF EXISTS notifications_comment_fk;

-- Thêm foreign key mới
-- MySQL sẽ tự động kiểm tra và báo lỗi nếu constraints đã tồn tại,
-- nhưng chúng ta có thể bỏ qua lỗi này trong migration script
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
-- Kiểm tra trước khi thêm
SET @stmt = CONCAT("SELECT COUNT(*) INTO @exist FROM information_schema.columns WHERE table_schema = '", DATABASE(), "' AND table_name = 'resources' AND column_name = 'preview_link'");
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm nếu chưa tồn tại
SET @addPreviewLink = CONCAT("ALTER TABLE resources ADD COLUMN preview_link VARCHAR(255) NULL");
SET @addResourceType = CONCAT("ALTER TABLE resources ADD COLUMN resource_type VARCHAR(50) NULL");

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
