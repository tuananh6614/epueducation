
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'TYnh&j1VK8$p2^C@4XZrQ7*sW!9mDgEb'; // JWT Secret mạnh

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const createConnection = async () => {
  return await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'learningplatform' // Tên database đã được cập nhật
  });
};

// Auth routes
app.post('/api/register', async (req, res) => {
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

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }
    
    const connection = await createConnection();
    
    // Find user
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      await connection.end();
      return res.status(400).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      await connection.end();
      return res.status(400).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không chính xác' 
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

// Course routes
app.get('/api/courses', async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [courses] = await connection.execute('SELECT * FROM courses');
    
    await connection.end();
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await createConnection();
    
    // Get course details
    const [courses] = await connection.execute(
      'SELECT * FROM courses WHERE course_id = ?',
      [id]
    );
    
    if (courses.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy khóa học' 
      });
    }
    
    // Get lessons
    const [lessons] = await connection.execute(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index',
      [id]
    );
    
    // Get quizzes
    const [quizzes] = await connection.execute(
      'SELECT * FROM quizzes WHERE course_id = ?',
      [id]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      data: {
        ...courses[0],
        lessons,
        quizzes
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Yêu cầu đăng nhập' 
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token không hợp lệ hoặc hết hạn' 
      });
    }
    
    req.user = user;
    next();
  });
};

// Protected user routes
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    
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

// For development only - do not use in production
app.get('/api/setup', async (req, res) => {
  res.json({
    message: 'Backend đang chạy. Vui lòng thiết lập cơ sở dữ liệu và bảng theo README.'
  });
});

// Server start
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

module.exports = app;
