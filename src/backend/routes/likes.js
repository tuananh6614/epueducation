
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
      // Kiểm tra người dùng đã thích bài viết/bình luận chưa
      let query, params;
      
      if (post_id) {
        query = 'SELECT * FROM likes WHERE user_id = ? AND post_id = ?';
        params = [req.user.id, post_id];
      } else {
        query = 'SELECT * FROM likes WHERE user_id = ? AND comment_id = ?';
        params = [req.user.id, comment_id];
      }
      
      const [existingLikes] = await connection.execute(query, params);
      
      // Nếu có post_id, lấy thông tin người đăng bài
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
      
      // Nếu có comment_id, lấy thông tin người bình luận
      let commentAuthorId = null;
      if (comment_id) {
        const [commentInfo] = await connection.execute(
          'SELECT user_id FROM comments WHERE comment_id = ?',
          [comment_id]
        );
        if (commentInfo.length > 0) {
          commentAuthorId = commentInfo[0].user_id;
        }
      }
      
      if (existingLikes.length > 0) {
        // Nếu đã thích với cùng một reaction, xóa nó (unlike)
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
          // Nếu đã thích với reaction khác, cập nhật nó
          if (post_id) {
            await connection.execute(`
              UPDATE likes 
              SET reaction = ?
              WHERE user_id = ? AND post_id = ?
            `, [reaction, req.user.id, post_id]);
            
            // Nếu chưa có thông báo, tạo thông báo cho chủ bài viết
            if (postAuthorId && postAuthorId !== req.user.id) {
              await connection.execute(`
                INSERT INTO notifications (user_id, from_user_id, post_id, type, message)
                VALUES (?, ?, ?, 'like', ?)
                ON DUPLICATE KEY UPDATE created_at = NOW(), is_read = FALSE
              `, [
                postAuthorId, 
                req.user.id, 
                post_id, 
                `đã thể hiện cảm xúc ${reaction} với bài viết của bạn`
              ]);
            }
          } else {
            await connection.execute(`
              UPDATE likes 
              SET reaction = ?
              WHERE user_id = ? AND comment_id = ?
            `, [reaction, req.user.id, comment_id]);
            
            // Nếu chưa có thông báo, tạo thông báo cho người bình luận
            if (commentAuthorId && commentAuthorId !== req.user.id) {
              await connection.execute(`
                INSERT INTO notifications (user_id, from_user_id, comment_id, type, message)
                VALUES (?, ?, ?, 'like', ?)
                ON DUPLICATE KEY UPDATE created_at = NOW(), is_read = FALSE
              `, [
                commentAuthorId, 
                req.user.id, 
                comment_id, 
                `đã thể hiện cảm xúc ${reaction} với bình luận của bạn`
              ]);
            }
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
        // Nếu chưa thích, thêm mới
        if (post_id) {
          await connection.execute(`
            INSERT INTO likes (user_id, post_id, reaction)
            VALUES (?, ?, ?)
          `, [req.user.id, post_id, reaction || 'like']);
          
          // Tạo thông báo nếu người thích không phải là chủ bài viết
          if (postAuthorId && postAuthorId !== req.user.id) {
            await connection.execute(`
              INSERT INTO notifications (user_id, from_user_id, post_id, type, message)
              VALUES (?, ?, ?, 'like', ?)
            `, [
              postAuthorId, 
              req.user.id, 
              post_id, 
              reaction === 'like' ? 'đã thích bài viết của bạn' : `đã thể hiện cảm xúc ${reaction} với bài viết của bạn`
            ]);
          }
        } else {
          await connection.execute(`
            INSERT INTO likes (user_id, comment_id, reaction)
            VALUES (?, ?, ?)
          `, [req.user.id, comment_id, reaction || 'like']);
          
          // Tạo thông báo nếu người thích không phải là người bình luận
          if (commentAuthorId && commentAuthorId !== req.user.id) {
            await connection.execute(`
              INSERT INTO notifications (user_id, from_user_id, comment_id, type, message)
              VALUES (?, ?, ?, 'like', ?)
            `, [
              commentAuthorId, 
              req.user.id, 
              comment_id, 
              reaction === 'like' ? 'đã thích bình luận của bạn' : `đã thể hiện cảm xúc ${reaction} với bình luận của bạn`
            ]);
          }
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
    
    // Lấy tổng số lượt thích và phân loại theo reaction
    let reactionsCount = [];
    
    if (post_id) {
      const [reactions] = await connection.execute(`
        SELECT reaction, COUNT(*) as count 
        FROM likes 
        WHERE post_id = ? 
        GROUP BY reaction
      `, [post_id]);
      reactionsCount = reactions;
    } else if (comment_id) {
      const [reactions] = await connection.execute(`
        SELECT reaction, COUNT(*) as count 
        FROM likes 
        WHERE comment_id = ? 
        GROUP BY reaction
      `, [comment_id]);
      reactionsCount = reactions;
    }
    
    await connection.end();
    
    res.json({
      success: true,
      liked: likes.length > 0,
      reaction: likes.length > 0 ? likes[0].reaction : null,
      reactions: reactionsCount
    });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Get reactions for post or comment
router.get('/reactions', async (req, res) => {
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
      query = `
        SELECT l.reaction, COUNT(*) as count, 
               GROUP_CONCAT(u.username) as users
        FROM likes l
        JOIN users u ON l.user_id = u.user_id
        WHERE l.post_id = ?
        GROUP BY l.reaction
      `;
      params = [post_id];
    } else {
      query = `
        SELECT l.reaction, COUNT(*) as count,
               GROUP_CONCAT(u.username) as users
        FROM likes l
        JOIN users u ON l.user_id = u.user_id
        WHERE l.comment_id = ?
        GROUP BY l.reaction
      `;
      params = [comment_id];
    }
    
    const [reactions] = await connection.execute(query, params);
    
    await connection.end();
    
    res.json({
      success: true,
      data: reactions
    });
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

module.exports = router;
