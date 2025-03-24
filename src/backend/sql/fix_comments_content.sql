
-- Kiểm tra và đảm bảo content trong bảng comments không bị null
ALTER TABLE comments MODIFY COLUMN content TEXT NOT NULL;

-- Đảm bảo các bảng có đủ foreign key
SELECT COUNT(*) INTO @constraint_exists 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = DATABASE() 
AND TABLE_NAME = 'comments' 
AND CONSTRAINT_NAME = 'comments_blog_posts_fk';

-- Only create the constraint if it doesn't exist
SET @sql = CONCAT('
  SELECT IF(@constraint_exists = 0, 
    "ALTER TABLE comments ADD CONSTRAINT comments_blog_posts_fk FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE", 
    "SELECT \'Foreign key relationship already exists\' AS message") INTO @statement
');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Execute the generated statement
PREPARE stmt FROM @statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
