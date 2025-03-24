
-- Verify and ensure content in the comments table is not null
ALTER TABLE comments MODIFY COLUMN content TEXT NOT NULL;

-- Check if foreign key constraint exists before creating it
SELECT COUNT(*) INTO @constraint_exists 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = DATABASE() 
AND TABLE_NAME = 'comments' 
AND CONSTRAINT_NAME = 'comments_blog_posts_fk';

-- Create a temporary procedure to add the foreign key if not exists
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS add_fk_if_not_exists()
BEGIN
    IF @constraint_exists = 0 THEN
        ALTER TABLE comments ADD CONSTRAINT comments_blog_posts_fk 
        FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE;
        SELECT 'Foreign key relationship added successfully' AS message;
    ELSE
        SELECT 'Foreign key relationship already exists' AS message;
    END IF;
END //
DELIMITER ;

-- Call the procedure
CALL add_fk_if_not_exists();

-- Drop the temporary procedure
DROP PROCEDURE IF EXISTS add_fk_if_not_exists;

-- Make sure parent_id can be null (for top-level comments)
ALTER TABLE comments MODIFY COLUMN parent_id INT NULL;

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- Verify that content is properly encoded to avoid character encoding issues
ALTER TABLE comments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
