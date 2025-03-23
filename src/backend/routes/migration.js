
const express = require('express');
const router = express.Router();
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Admin check middleware
const adminCheck = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Only user with ID 9 (admin) can access - based on your database
    if (userId !== 9) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
};

// Run migration to add content field to lessons table
router.post('/add-lesson-content', authenticateToken, adminCheck, async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Read and execute the SQL file for migration
    const sqlPath = path.join(__dirname, '../sql/add_content_to_lessons.sql');
    
    if (!fs.existsSync(sqlPath)) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Tệp SQL không tồn tại' 
      });
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement + ';');
      }
    }
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Đã cập nhật cấu trúc bảng lessons thành công'
    });
  } catch (error) {
    console.error('Error updating lessons table:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật cấu trúc bảng: ' + (error.message || 'Lỗi không xác định')
    });
  }
});

module.exports = router;
