
-- First, check if any foreign key constraints exist on the post_id column
-- If a constraint exists and is incorrect, it will need to be dropped
-- but we won't assume it's named comments_ibfk_1

-- Add the correct foreign key constraint to reference blog_posts table
ALTER TABLE comments
ADD CONSTRAINT comments_blog_posts_fk
FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE;
