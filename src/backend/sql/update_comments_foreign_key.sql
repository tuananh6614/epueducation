
-- Check if any constraint exists on the post_id column with the specific name
SELECT COUNT(*) INTO @constraint_exists 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = DATABASE() 
AND TABLE_NAME = 'comments' 
AND CONSTRAINT_NAME = 'comments_blog_posts_fk';

-- Only create the constraint if it doesn't exist
SET @sql = CONCAT('
  SELECT IF(@constraint_exists = 0, 
    "ALTER TABLE comments ADD CONSTRAINT comments_blog_posts_fk FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE", 
    "SELECT \'Constraint already exists\' AS message") INTO @statement
');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Execute the generated statement
PREPARE stmt FROM @statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- This ensures when a post is deleted, all associated comments are also deleted
