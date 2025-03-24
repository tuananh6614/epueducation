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
    
    // Only user with ID 1 (admin) can access - based on your database
    if (userId !== 1) {
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

// Thêm route để chạy file update_likes_table.sql
router.post('/update-likes-table', authenticateToken, adminCheck, async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Đọc và thực thi file SQL cho việc cập nhật bảng likes
    const sqlPath = path.join(__dirname, '../sql/update_likes_table.sql');
    
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
      message: 'Đã cập nhật bảng likes thành công'
    });
  } catch (error) {
    console.error('Error updating likes table:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật bảng likes: ' + (error.message || 'Lỗi không xác định')
    });
  }
});

// Run migration to update tables for fixes
router.post('/update-tables-for-fixes', authenticateToken, adminCheck, async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Đọc và thực thi file SQL cho việc cập nhật các bảng
    const sqlPath = path.join(__dirname, '../sql/update_tables_for_fixes.sql');
    
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
      message: 'Đã cập nhật cấu trúc bảng thành công'
    });
  } catch (error) {
    console.error('Error updating tables:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật cấu trúc bảng: ' + (error.message || 'Lỗi không xác định')
    });
  }
});

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
