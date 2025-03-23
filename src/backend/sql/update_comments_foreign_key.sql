
-- Drop the existing foreign key constraint
ALTER TABLE comments
DROP FOREIGN KEY comments_ibfk_1;

-- Add the correct foreign key constraint to reference blog_posts table
ALTER TABLE comments
ADD CONSTRAINT comments_ibfk_1
FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE;

-- This ensures when a post is deleted, all associated comments are also deleted
