
-- Verify and ensure content in the comments table is not null
ALTER TABLE comments MODIFY COLUMN content TEXT NOT NULL;

-- Sử dụng cách tiếp cận an toàn hơn bằng cách thực hiện DROP FOREIGN KEY IF EXISTS
-- rồi sau đó ADD CONSTRAINT
ALTER TABLE comments DROP FOREIGN KEY IF EXISTS comments_blog_posts_fk;

-- Thêm constraint mới
ALTER TABLE comments ADD CONSTRAINT comments_blog_posts_fk 
FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE;

-- Make sure parent_id can be null (for top-level comments)
ALTER TABLE comments MODIFY COLUMN parent_id INT NULL;

-- Add missing indexes for better performance
DROP INDEX IF EXISTS idx_comments_post_id ON comments;
CREATE INDEX idx_comments_post_id ON comments(post_id);

DROP INDEX IF EXISTS idx_comments_user_id ON comments;
CREATE INDEX idx_comments_user_id ON comments(user_id);

DROP INDEX IF EXISTS idx_comments_parent_id ON comments;
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- Verify that content is properly encoded to avoid character encoding issues
ALTER TABLE comments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
