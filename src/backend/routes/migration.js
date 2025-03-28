
const express = require('express');
const router = express.Router();
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Helper function to execute SQL statements safely
const executeSqlStatements = async (connection, statements) => {
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await connection.query(statement + ';');
      } catch (err) {
        console.warn(`Cảnh báo khi thực thi câu lệnh: ${statement}`, err.message);
        // Tiếp tục với câu lệnh tiếp theo ngay cả khi một câu lệnh thất bại
      }
    }
  }
};

// Helper function to read SQL file and parse statements
const readAndParseSqlFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('Tệp SQL không tồn tại');
  }
  
  const sql = fs.readFileSync(filePath, 'utf8');
  return sql
    .replace(/DELIMITER \/\/|DELIMITER ;/g, '')
    .replace(/SET @\w+.*?;/g, '') // Xóa các câu lệnh SET @variable không được hỗ trợ
    .replace(/PREPARE\s+.*?;/g, '')
    .replace(/EXECUTE\s+.*?;/g, '')
    .replace(/DEALLOCATE\s+.*?;/g, '')
    .split(';')
    .filter(stmt => stmt.trim() !== '');
};

// Route to run update_likes_table.sql
router.post('/update-likes-table', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const sqlPath = path.join(__dirname, '../sql/update_likes_table.sql');
    const statements = readAndParseSqlFile(sqlPath);
    
    await executeSqlStatements(connection, statements);
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
router.post('/update-tables-for-fixes', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const sqlPath = path.join(__dirname, '../sql/update_tables_for_fixes.sql');
    const statements = readAndParseSqlFile(sqlPath);
    
    await executeSqlStatements(connection, statements);
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
router.post('/add-lesson-content', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const sqlPath = path.join(__dirname, '../sql/add_content_to_lessons.sql');
    const statements = readAndParseSqlFile(sqlPath);
    
    await executeSqlStatements(connection, statements);
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

// Fix comments content and foreign keys
router.post('/fix-comments', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const sqlPath = path.join(__dirname, '../sql/fix_comments_content.sql');
    const statements = readAndParseSqlFile(sqlPath);
    
    await executeSqlStatements(connection, statements);
    await connection.end();
    
    res.json({
      success: true,
      message: 'Đã cập nhật bảng comments thành công'
    });
  } catch (error) {
    console.error('Error fixing comments table:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật bảng comments: ' + (error.message || 'Lỗi không xác định')
    });
  }
});

// Run comprehensive database fixes
router.post('/database-fixes', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const sqlPath = path.join(__dirname, '../sql/database_fixes.sql');
    const statements = readAndParseSqlFile(sqlPath);
    
    await executeSqlStatements(connection, statements);
    await connection.end();
    
    res.json({
      success: true,
      message: 'Đã cập nhật cơ sở dữ liệu thành công'
    });
  } catch (error) {
    console.error('Error applying database fixes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật cơ sở dữ liệu: ' + (error.message || 'Lỗi không xác định')
    });
  }
});

module.exports = router;
