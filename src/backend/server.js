
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
    database: 'learningplatform'
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

// Blog routes - NEW
app.get('/api/posts', async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [posts] = await connection.execute(`
      SELECT p.*, u.username as author, 
      (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comments_count,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as likes_count
      FROM blog_posts p
      JOIN users u ON p.author_id = u.user_id
      WHERE p.is_published = 1
      ORDER BY p.created_at DESC
    `);
    
    await connection.end();
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await createConnection();
    
    // Get post details
    const [posts] = await connection.execute(`
      SELECT p.*, u.username as author
      FROM blog_posts p
      JOIN users u ON p.author_id = u.user_id
      WHERE p.post_id = ?
    `, [id]);
    
    if (posts.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy bài viết' 
      });
    }
    
    // Get comments
    const [comments] = await connection.execute(`
      SELECT c.*, u.username as author
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at
    `, [id]);
    
    // Get likes count
    const [likesCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM likes WHERE post_id = ?
    `, [id]);
    
    await connection.end();
    
    res.json({
      success: true,
      data: {
        ...posts[0],
        comments,
        likes_count: likesCount[0].count
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Protected post routes
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, thumbnail } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và nội dung là bắt buộc'
      });
    }
    
    const connection = await createConnection();
    
    // Create post
    const [result] = await connection.execute(`
      INSERT INTO blog_posts (title, content, thumbnail, author_id, is_published)
      VALUES (?, ?, ?, ?, 1)
    `, [title, content, thumbnail || null, req.user.id]);
    
    await connection.end();
    
    res.status(201).json({
      success: true,
      message: 'Đăng bài thành công',
      data: {
        post_id: result.insertId
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Comment routes - NEW
app.post('/api/comments', authenticateToken, async (req, res) => {
  try {
    const { content, post_id } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }
    
    const connection = await createConnection();
    
    // Add comment
    const [result] = await connection.execute(`
      INSERT INTO comments (content, user_id, post_id)
      VALUES (?, ?, ?)
    `, [content, req.user.id, post_id]);
    
    // Get comment with author info
    const [comments] = await connection.execute(`
      SELECT c.*, u.username as author
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.comment_id = ?
    `, [result.insertId]);
    
    await connection.end();
    
    res.status(201).json({
      success: true,
      message: 'Bình luận thành công',
      data: comments[0]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Like routes - NEW
app.post('/api/likes', authenticateToken, async (req, res) => {
  try {
    const { post_id, comment_id } = req.body;
    
    if (!post_id && !comment_id) {
      return res.status(400).json({
        success: false,
        message: 'Cần có ID bài viết hoặc bình luận'
      });
    }
    
    const connection = await createConnection();
    
    try {
      // Try to add like (will fail if already liked due to unique constraint)
      if (post_id) {
        await connection.execute(`
          INSERT INTO likes (user_id, post_id)
          VALUES (?, ?)
        `, [req.user.id, post_id]);
      } else {
        await connection.execute(`
          INSERT INTO likes (user_id, comment_id)
          VALUES (?, ?)
        `, [req.user.id, comment_id]);
      }
      
      await connection.end();
      
      res.status(201).json({
        success: true,
        message: 'Đã thích thành công',
        liked: true
      });
    } catch (err) {
      // If error is duplicate entry, remove the like instead
      if (err.code === 'ER_DUP_ENTRY') {
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
          liked: false
        });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Check if user has liked a post/comment - NEW
app.get('/api/likes/check', authenticateToken, async (req, res) => {
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
    
    await connection.end();
    
    res.json({
      success: true,
      liked: likes.length > 0
    });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

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
