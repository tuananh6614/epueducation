
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createConnection } = require('../db');
const { JWT_SECRET } = require('../config');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }
    
    const connection = await createConnection();
    
    // Check if user exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(400).json({ 
        success: false, 
        message: 'Email hoặc tên người dùng đã tồn tại' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, fullName || '']
    );
    
    await connection.end();
    
    // Generate token
    const token = jwt.sign({ id: result.insertId }, JWT_SECRET, { expiresIn: '1d' });
    
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        id: result.insertId,
        username,
        email,
        fullName: fullName || ''
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }
    
    const connection = await createConnection();
    
    // Find user by username instead of email
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      await connection.end();
      return res.status(400).json({ 
        success: false, 
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác' 
      });
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      await connection.end();
      return res.status(400).json({ 
        success: false, 
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác' 
      });
    }
    
    await connection.end();
    
    // Generate token
    const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        fullName: user.full_name || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Thêm router cho chức năng quên mật khẩu
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng nhập địa chỉ email' 
      });
    }
    
    const connection = await createConnection();
    
    // Kiểm tra xem email có tồn tại trong hệ thống hay không
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      await connection.end();
      return res.status(400).json({ 
        success: false, 
        message: 'Email không tồn tại trong hệ thống' 
      });
    }
    
    await connection.end();
    
    // Trong trường hợp thực tế, ở đây sẽ gửi email khôi phục mật khẩu
    // Nhưng trong demo này, chúng ta chỉ trả về thông báo thành công
    
    res.json({
      success: true,
      message: 'Hướng dẫn khôi phục mật khẩu đã được gửi đến email của bạn'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

module.exports = router;
