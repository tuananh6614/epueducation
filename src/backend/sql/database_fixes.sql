
-- Fix character encoding for all text fields in all tables
ALTER DATABASE IF EXISTS learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix blog_posts table
ALTER TABLE blog_posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE blog_posts MODIFY COLUMN content LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Make sure all required notification fields exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_user_id INT NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS post_id INT NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS comment_id INT NULL;

-- Add foreign key relationships for notifications
ALTER TABLE notifications 
ADD CONSTRAINT IF NOT EXISTS notifications_from_user_fk 
FOREIGN KEY (from_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE notifications 
ADD CONSTRAINT IF NOT EXISTS notifications_post_fk 
FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE;

ALTER TABLE notifications 
ADD CONSTRAINT IF NOT EXISTS notifications_comment_fk 
FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE;

-- Make sure all required resource fields exist
ALTER TABLE resources ADD COLUMN IF NOT EXISTS preview_link VARCHAR(255) NULL;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS resource_type VARCHAR(50) NULL;

-- Add indexes for performance improvement
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_resources_author_id ON resources(author_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_comment_id ON likes(comment_id);
