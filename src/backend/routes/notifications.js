
const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [notifications] = await connection.execute(`
      SELECT n.*, 
        u.username as from_username, 
        u.full_name as from_fullname,
        u.profile_picture as from_avatar,
        p.title as post_title,
        CASE 
          WHEN n.type = 'like' THEN 'đã thích bài viết của bạn'
          WHEN n.type = 'comment' THEN 'đã bình luận bài viết của bạn'
          WHEN n.type = 'system' THEN n.message
          ELSE ''
        END as action_text
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.user_id
      LEFT JOIN blog_posts p ON n.post_id = p.post_id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `, [req.user.id]);
    
    await connection.end();
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Mark notifications as read
router.put('/read', authenticateToken, async (req, res) => {
  try {
    const { notification_ids } = req.body;
    
    if (!notification_ids || !notification_ids.length) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID thông báo'
      });
    }
    
    const connection = await createConnection();
    
    // Create placeholders for the SQL query
    const placeholders = notification_ids.map(() => '?').join(',');
    
    await connection.execute(`
      UPDATE notifications
      SET is_read = TRUE
      WHERE notification_id IN (${placeholders})
      AND user_id = ?
    `, [...notification_ids, req.user.id]);
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Đã đánh dấu thông báo là đã đọc'
    });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    
    await connection.execute(`
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ?
    `, [req.user.id]);
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

module.exports = router;
