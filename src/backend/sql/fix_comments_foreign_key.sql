
-- First check if any constraint exists on the post_id column
SELECT COUNT(*) 
INTO @constraint_exists
FROM information_schema.referential_constraints
WHERE constraint_schema = DATABASE() AND
      table_name = 'comments' AND
      referenced_table_name = 'blog_posts';

-- If the constraint already exists, we don't need to do anything
SET @query = IF(@constraint_exists = 0,
    'ALTER TABLE comments ADD CONSTRAINT comments_blog_posts_fk FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE',
    'SELECT "Foreign key relationship already exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
