
-- First, check if the foreign key constraint exists before trying to drop it
-- If it doesn't exist, we'll just add a new one

-- Add the correct foreign key constraint to reference blog_posts table
ALTER TABLE comments
ADD CONSTRAINT comments_blog_posts_fk
FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE;

-- This ensures when a post is deleted, all associated comments are also deleted
