
const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Add/remove like
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { post_id, comment_id } = req.body;
    
    if (!post_id && !comment_id) {
      return res.status(400).json({
        success: false,
        message: 'Cần có ID bài viết hoặc bình luận'
      });
    }
    
    const connection = await createConnection();
    
    try {
      // Try to add like (will fail if already liked due to unique constraint)
      if (post_id) {
        await connection.execute(`
          INSERT INTO likes (user_id, post_id)
          VALUES (?, ?)
        `, [req.user.id, post_id]);
      } else {
        await connection.execute(`
          INSERT INTO likes (user_id, comment_id)
          VALUES (?, ?)
        `, [req.user.id, comment_id]);
      }
      
      await connection.end();
      
      res.status(201).json({
        success: true,
        message: 'Đã thích thành công',
        liked: true
      });
    } catch (err) {
      // If error is duplicate entry, remove the like instead
      if (err.code === 'ER_DUP_ENTRY') {
        if (post_id) {
          await connection.execute(`
            DELETE FROM likes 
            WHERE user_id = ? AND post_id = ?
          `, [req.user.id, post_id]);
        } else {
          await connection.execute(`
            DELETE FROM likes 
            WHERE user_id = ? AND comment_id = ?
          `, [req.user.id, comment_id]);
        }
        
        await connection.end();
        
        res.json({
          success: true,
          message: 'Đã bỏ thích thành công',
          liked: false
        });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Check like status
router.get('/check', authenticateToken, async (req, res) => {
  try {
    const { post_id, comment_id } = req.query;
    
    if (!post_id && !comment_id) {
      return res.status(400).json({
        success: false,
        message: 'Cần có ID bài viết hoặc bình luận'
      });
    }
    
    const connection = await createConnection();
    
    let query, params;
    
    if (post_id) {
      query = 'SELECT * FROM likes WHERE user_id = ? AND post_id = ?';
      params = [req.user.id, post_id];
    } else {
      query = 'SELECT * FROM likes WHERE user_id = ? AND comment_id = ?';
      params = [req.user.id, comment_id];
    }
    
    const [likes] = await connection.execute(query, params);
    
    await connection.end();
    
    res.json({
      success: true,
      liked: likes.length > 0
    });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

module.exports = router;
