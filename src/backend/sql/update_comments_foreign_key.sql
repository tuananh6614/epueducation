
-- First check if the constraint already exists to avoid the error
SELECT COUNT(*)
INTO @constraint_exists
FROM information_schema.table_constraints 
WHERE constraint_schema = DATABASE() AND 
      table_name = 'comments' AND 
      constraint_name = 'comments_blog_posts_fk';

-- Only try to add the constraint if it doesn't exist
SET @query = IF(@constraint_exists = 0, 
    'ALTER TABLE comments ADD CONSTRAINT comments_blog_posts_fk FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE',
    'SELECT "Constraint already exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- This ensures when a post is deleted, all associated comments are also deleted
