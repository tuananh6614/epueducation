
-- Check if any constraint exists on the post_id column
SELECT EXISTS (
  SELECT 1 FROM information_schema.key_column_usage
  WHERE constraint_schema = DATABASE()
  AND table_name = 'comments'
  AND column_name = 'post_id'
  AND referenced_table_name = 'blog_posts'
) INTO @constraint_exists;

-- If the constraint doesn't exist, create it
SET @alter_statement = CONCAT('ALTER TABLE comments ',
  'ADD CONSTRAINT comments_blog_posts_fk ',
  'FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE');

SET @show_message = 'SELECT "Foreign key relationship already exists" AS message';

-- Choose which statement to execute
SET @sql = IF(@constraint_exists = 0, @alter_statement, @show_message);

-- Execute the chosen statement
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
