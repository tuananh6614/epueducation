
const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [posts] = await connection.execute(`
      SELECT p.*, u.username as author, 
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
      SELECT p.*, u.username as author
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
    
    // Get comments
    const [comments] = await connection.execute(`
      SELECT c.*, u.username as author
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at
    `, [id]);
    
    // Get likes count
    const [likesCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM likes WHERE post_id = ?
    `, [id]);
    
    await connection.end();
    
    res.json({
      success: true,
      data: {
        ...posts[0],
        comments,
        likes_count: likesCount[0].count
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

// Create post
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, thumbnail } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và nội dung là bắt buộc'
      });
    }
    
    const connection = await createConnection();
    
    // Create post
    const [result] = await connection.execute(`
      INSERT INTO blog_posts (title, content, thumbnail, author_id, is_published)
      VALUES (?, ?, ?, ?, 1)
    `, [title, content, thumbnail || null, req.user.id]);
    
    await connection.end();
    
    res.status(201).json({
      success: true,
      message: 'Đăng bài thành công',
      data: {
        post_id: result.insertId
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
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
    
    // Add comment
    const [result] = await connection.execute(`
      INSERT INTO comments (content, user_id, post_id)
      VALUES (?, ?, ?)
    `, [content, req.user.id, post_id]);
    
    // Get comment with author info
    const [comments] = await connection.execute(`
      SELECT c.*, u.username as author
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.comment_id = ?
    `, [result.insertId]);
    
    await connection.end();
    
    res.status(201).json({
      success: true,
      message: 'Bình luận thành công',
      data: comments[0]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

module.exports = router;
