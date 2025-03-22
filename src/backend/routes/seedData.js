
const express = require('express');
const router = express.Router();
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Admin check middleware
const adminCheck = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Only user with ID 1 (admin) can access
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

// Add a route to add the Algorithm course
router.post('/algorithm-course', authenticateToken, adminCheck, async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Read and execute the SQL file for algorithm course
    const path = require('path');
    const fs = require('fs');
    const sqlPath = path.join(__dirname, '../sql/add_algorithm_course.sql');
    
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
    
    // Get the last inserted course ID
    const [result] = await connection.query('SELECT LAST_INSERT_ID() as id');
    const courseId = result[0].id;
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Đã thêm khóa học Thuật Toán và Thiết Kế Chương Trình thành công',
      courseId
    });
  } catch (error) {
    console.error('Error adding algorithm course:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi thêm khóa học: ' + (error.message || 'Lỗi không xác định')
    });
  }
});

module.exports = router;
