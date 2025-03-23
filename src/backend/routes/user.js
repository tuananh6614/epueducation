const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { upload, uploadDir } = require('../config/upload');

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Update the query to remove the 'bio' field if it doesn't exist in your table
    const [users] = await connection.execute(
      'SELECT user_id, username, email, full_name, profile_picture, balance, created_at FROM users WHERE user_id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }
    
    await connection.end();
    
    // Add full URL to profile picture
    if (users[0].profile_picture) {
      users[0].profile_picture = `http://localhost:${process.env.PORT || 5000}/uploads/${users[0].profile_picture}`;
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Update user profile
router.put('/update', authenticateToken, upload.single('profile_picture'), async (req, res) => {
  try {
    // Loại bỏ username khỏi req.body, chỉ lấy email và full_name
    const { email, full_name } = req.body;
    const profilePicture = req.file ? req.file.filename : null;
    
    const connection = await createConnection();
    
    // Check if email is already taken by another user
    if (email) {
      const [existingUsers] = await connection.execute(
        'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
        [email, req.user.id]
      );
      
      if (existingUsers.length > 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Email đã tồn tại'
        });
      }
    }
    
    // Get current user info
    const [currentUsers] = await connection.execute(
      'SELECT profile_picture FROM users WHERE user_id = ?',
      [req.user.id]
    );
    
    if (currentUsers.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Build update query
    let updateQuery = 'UPDATE users SET ';
    const updateValues = [];
    
    if (email) {
      updateQuery += 'email = ?, ';
      updateValues.push(email);
    }
    
    if (full_name !== undefined) {
      updateQuery += 'full_name = ?, ';
      updateValues.push(full_name);
    }
    
    if (profilePicture) {
      updateQuery += 'profile_picture = ?, ';
      updateValues.push(profilePicture);
      
      // Delete old profile picture if exists
      const oldPicture = currentUsers[0].profile_picture;
      if (oldPicture) {
        const oldPicturePath = path.join(uploadDir, oldPicture);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
    }
    
    // Remove trailing comma and add WHERE clause
    updateQuery = updateQuery.slice(0, -2) + ' WHERE user_id = ?';
    updateValues.push(req.user.id);
    
    // Execute update
    await connection.execute(updateQuery, updateValues);
    
    // Get updated user data (remove 'bio' field from the query)
    const [updatedUsers] = await connection.execute(
      'SELECT user_id, username, email, full_name, profile_picture, balance, created_at FROM users WHERE user_id = ?',
      [req.user.id]
    );
    
    await connection.end();
    
    // Add full URL to profile picture
    if (updatedUsers[0].profile_picture) {
      updatedUsers[0].profile_picture = `http://localhost:${process.env.PORT || 5000}/uploads/${updatedUsers[0].profile_picture}`;
    }
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: updatedUsers[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }
    
    const connection = await createConnection();
    
    // Get current user with password
    const [users] = await connection.execute(
      'SELECT password FROM users WHERE user_id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!isMatch) {
      await connection.end();
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác'
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await connection.execute(
      'UPDATE users SET password = ? WHERE user_id = ?',
      [hashedPassword, req.user.id]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

module.exports = router;
