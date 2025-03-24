
const express = require('express');
const router = express.Router();
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Route to run update_likes_table.sql
router.post('/update-likes-table', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Read and execute SQL file for updating likes table
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
router.post('/update-tables-for-fixes', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Read and execute SQL file for updating tables
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
router.post('/add-lesson-content', authenticateToken, async (req, res) => {
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

// Fix comments content and foreign keys
router.post('/fix-comments', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Read and execute SQL file for fixing comments
    const sqlPath = path.join(__dirname, '../sql/fix_comments_content.sql');
    
    if (!fs.existsSync(sqlPath)) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Tệp SQL không tồn tại' 
      });
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    // Split by delimiter for stored procedures
    const blocks = sql.split('DELIMITER');
    
    for (const block of blocks) {
      if (!block.trim()) continue;
      
      if (block.includes('//')) {
        // Handle DELIMITER blocks separately
        const procedureStatements = block.split('//');
        for (const stmt of procedureStatements) {
          if (stmt.trim()) {
            await connection.query(stmt);
          }
        }
      } else {
        // Handle regular statements
        const statements = block.split(';').filter(stmt => stmt.trim() !== '');
        for (const statement of statements) {
          if (statement.trim()) {
            await connection.query(statement + ';');
          }
        }
      }
    }
    
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
    
    // Read and execute SQL file for database fixes
    const sqlPath = path.join(__dirname, '../sql/database_fixes.sql');
    
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
        try {
          await connection.query(statement + ';');
        } catch (err) {
          console.warn(`Warning executing statement: ${statement}`, err.message);
          // Continue with next statement even if one fails
        }
      }
    }
    
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
