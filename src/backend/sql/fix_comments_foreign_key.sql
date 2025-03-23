
-- Xóa khóa ngoại cũ
ALTER TABLE comments
DROP FOREIGN KEY comments_ibfk_1;

-- Thêm khóa ngoại mới trỏ đến bảng blog_posts
ALTER TABLE comments
ADD CONSTRAINT comments_blog_posts_fk
FOREIGN KEY (post_id) REFERENCES blog_posts(post_id);
