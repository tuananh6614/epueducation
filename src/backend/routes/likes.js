
const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Add/remove like with reaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { post_id, comment_id, reaction } = req.body;
    
    if (!post_id && !comment_id) {
      return res.status(400).json({
        success: false,
        message: 'Cần có ID bài viết hoặc bình luận'
      });
    }
    
    const connection = await createConnection();
    
    try {
      // First, check if the user already liked this post/comment
      let query, params;
      
      if (post_id) {
        query = 'SELECT * FROM likes WHERE user_id = ? AND post_id = ?';
        params = [req.user.id, post_id];
      } else {
        query = 'SELECT * FROM likes WHERE user_id = ? AND comment_id = ?';
        params = [req.user.id, comment_id];
      }
      
      const [existingLikes] = await connection.execute(query, params);
      
      // If post_id exists, get post author
      let postAuthorId = null;
      if (post_id) {
        const [postInfo] = await connection.execute(
          'SELECT author_id FROM blog_posts WHERE post_id = ?',
          [post_id]
        );
        if (postInfo.length > 0) {
          postAuthorId = postInfo[0].author_id;
        }
      }
      
      if (existingLikes.length > 0) {
        // If already liked with the same reaction, remove it
        if (existingLikes[0].reaction === reaction) {
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
            liked: false,
            reaction: null
          });
        } else {
          // If already liked with a different reaction, update it
          if (post_id) {
            await connection.execute(`
              UPDATE likes 
              SET reaction = ?
              WHERE user_id = ? AND post_id = ?
            `, [reaction, req.user.id, post_id]);
          } else {
            await connection.execute(`
              UPDATE likes 
              SET reaction = ?
              WHERE user_id = ? AND comment_id = ?
            `, [reaction, req.user.id, comment_id]);
          }
          
          await connection.end();
          
          res.json({
            success: true,
            message: 'Đã cập nhật biểu cảm thành công',
            liked: true,
            reaction: reaction
          });
        }
      } else {
        // If not liked yet, add it
        if (post_id) {
          await connection.execute(`
            INSERT INTO likes (user_id, post_id, reaction)
            VALUES (?, ?, ?)
          `, [req.user.id, post_id, reaction || 'like']);
          
          // Create notification if the liker is not the post author
          if (postAuthorId && postAuthorId !== req.user.id) {
            await connection.execute(`
              INSERT INTO notifications (user_id, from_user_id, post_id, type)
              VALUES (?, ?, ?, 'like')
            `, [postAuthorId, req.user.id, post_id]);
          }
        } else {
          await connection.execute(`
            INSERT INTO likes (user_id, comment_id, reaction)
            VALUES (?, ?, ?)
          `, [req.user.id, comment_id, reaction || 'like']);
        }
        
        await connection.end();
        
        res.status(201).json({
          success: true,
          message: 'Đã thích thành công',
          liked: true,
          reaction: reaction || 'like'
        });
      }
    } catch (err) {
      console.error('Like operation error:', err);
      await connection.end();
      throw err; // Re-throw to be caught by the outer catch
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
      liked: likes.length > 0,
      reaction: likes.length > 0 ? likes[0].reaction : null
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
