const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [posts] = await connection.execute(`
      SELECT p.*, u.username as author, u.full_name as author_fullname, u.profile_picture as author_avatar,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comments_count,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as likes_count
      FROM blog_posts p
      JOIN users u ON p.author_id = u.user_id
      WHERE p.is_published = 1
      ORDER BY p.created_at DESC
    `);
    
    await connection.end();
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Get single post
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await createConnection();
    
    // Get post details
    const [posts] = await connection.execute(`
      SELECT p.*, u.username as author, u.full_name as author_fullname, u.profile_picture as author_avatar
      FROM blog_posts p
      JOIN users u ON p.author_id = u.user_id
      WHERE p.post_id = ?
    `, [id]);
    
    if (posts.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy bài viết' 
      });
    }
    
    // Get comments with user details
    const [comments] = await connection.execute(`
      SELECT c.*, u.username as author, u.full_name as author_fullname, u.profile_picture as author_avatar,
             (SELECT COUNT(*) FROM likes WHERE comment_id = c.comment_id) as likes_count
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [id]);
    
    // Get likes count và reactions
    const [likesCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM likes WHERE post_id = ?
    `, [id]);
    
    // Get reaction counts by type
    const [reactions] = await connection.execute(`
      SELECT reaction, COUNT(*) as count 
      FROM likes 
      WHERE post_id = ? 
      GROUP BY reaction
    `, [id]);
    
    await connection.end();
    
    res.json({
      success: true,
      data: {
        ...posts[0],
        comments,
        likes_count: likesCount[0].count,
        reactions
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Create post with support for images and videos
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, thumbnail, video_url, has_video } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và nội dung là bắt buộc'
      });
    }
    
    const connection = await createConnection();
    
    // Tạo bài viết với hỗ trợ video
    const [result] = await connection.execute(`
      INSERT INTO blog_posts (title, content, thumbnail, author_id, is_published, video_url, has_video)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `, [title, content, thumbnail || null, req.user.id, video_url || null, has_video || 0]);
    
    // Lấy thông tin bài viết vừa tạo
    const [posts] = await connection.execute(`
      SELECT p.*, u.username as author, u.full_name as author_fullname, u.profile_picture as author_avatar
      FROM blog_posts p
      JOIN users u ON p.author_id = u.user_id
      WHERE p.post_id = ?
    `, [result.insertId]);
    
    await connection.end();
    
    res.status(201).json({
      success: true,
      message: 'Đăng bài thành công',
      data: posts[0]
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Update post
router.put('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, thumbnail } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và nội dung là bắt buộc'
      });
    }
    
    const connection = await createConnection();
    
    // Check if user is the author of the post
    const [posts] = await connection.execute(
      'SELECT * FROM blog_posts WHERE post_id = ?', 
      [id]
    );
    
    if (posts.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }
    
    if (posts[0].author_id !== req.user.id) {
      await connection.end();
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa bài viết này'
      });
    }
    
    // Update post
    await connection.execute(`
      UPDATE blog_posts
      SET title = ?, content = ?, thumbnail = ?, updated_at = NOW()
      WHERE post_id = ?
    `, [title, content, thumbnail, id]);
    
    // Get updated post
    const [updatedPost] = await connection.execute(`
      SELECT p.*, u.username as author, u.full_name as author_fullname, u.profile_picture as author_avatar
      FROM blog_posts p
      JOIN users u ON p.author_id = u.user_id
      WHERE p.post_id = ?
    `, [id]);
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: updatedPost[0]
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Add comment
router.post('/comments', authenticateToken, async (req, res) => {
  try {
    const { content, post_id } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }
    
    const connection = await createConnection();
    
    try {
      // Kiểm tra bài viết tồn tại
      const [postCheck] = await connection.execute(
        'SELECT post_id, author_id FROM blog_posts WHERE post_id = ?', 
        [post_id]
      );
      
      if (postCheck.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Bài viết không tồn tại'
        });
      }
      
      // Thêm bình luận
      const [result] = await connection.execute(`
        INSERT INTO comments (content, user_id, post_id)
        VALUES (?, ?, ?)
      `, [content, req.user.id, post_id]);
      
      // Lấy thông tin bình luận vừa thêm kèm thông tin người dùng
      const [comments] = await connection.execute(`
        SELECT c.*, u.username as author, u.full_name as author_fullname, u.profile_picture as author_avatar
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.comment_id = ?
      `, [result.insertId]);
      
      // Tạo thông báo cho chủ bài viết (nếu người bình luận không phải là chủ bài viết)
      const postAuthorId = postCheck[0].author_id;
      
      if (postAuthorId !== req.user.id) {
        await connection.execute(`
          INSERT INTO notifications (user_id, from_user_id, post_id, comment_id, type, message)
          VALUES (?, ?, ?, ?, 'comment', ?)
        `, [
          postAuthorId, 
          req.user.id, 
          post_id, 
          result.insertId, 
          `đã bình luận về bài viết của bạn`
        ]);
      }
      
      await connection.end();
      
      res.status(201).json({
        success: true,
        message: 'Bình luận thành công',
        data: comments[0]
      });
    } catch (err) {
      console.error('Comment operation error:', err);
      
      // Kiểm tra lỗi khóa ngoại
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Bài viết không tồn tại hoặc đã bị xóa'
        });
      }
      
      await connection.end();
      throw err; // Re-throw để bắt ở catch ngoài
    }
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Get comments for a post
router.get('/comments/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const connection = await createConnection();
    
    // Get comments with user details
    const [comments] = await connection.execute(`
      SELECT c.*, u.username as author, u.full_name as author_fullname, u.profile_picture as author_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [postId]);
    
    await connection.end();
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Delete comment
router.delete('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await createConnection();
    
    // Check if comment exists and user is the author
    const [comments] = await connection.execute(
      'SELECT * FROM comments WHERE comment_id = ?', 
      [id]
    );
    
    if (comments.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }
    
    if (comments[0].user_id !== req.user.id) {
      await connection.end();
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này'
      });
    }
    
    // Delete comment
    await connection.execute(
      'DELETE FROM comments WHERE comment_id = ?', 
      [id]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Xóa bình luận thành công'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

module.exports = router;
