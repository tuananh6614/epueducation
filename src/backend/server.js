
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { createConnection } = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const coursesRoutes = require('./routes/courses');
const lessonsRoutes = require('./routes/lessons');
const blogRoutes = require('./routes/blog');
const likesRoutes = require('./routes/likes');
const resourcesRoutes = require('./routes/resources');
const seedDataRoutes = require('./routes/seedData');
const migrationRoutes = require('./routes/migration');
const notificationsRoutes = require('./routes/notifications');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Tăng kích thước giới hạn cho body
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, '../../public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../../../public/uploads')));
app.use('/resources', express.static(path.join(__dirname, '../../../public/resources')));
app.use('/lovable-uploads', express.static(path.join(__dirname, '../../../public/lovable-uploads')));

// Tạo bảng nếu chưa tồn tại khi khởi động server
const initDatabase = async () => {
  try {
    const connection = await createConnection();
    console.log('Connected to database');
    
    // Thực hiện các migration nếu cần
    // Ví dụ: thêm cột vào bảng notifications nếu chưa có
    try {
      await connection.execute(`
        ALTER TABLE notifications 
        ADD COLUMN IF NOT EXISTS from_user_id INT NULL,
        ADD COLUMN IF NOT EXISTS post_id INT NULL,
        ADD COLUMN IF NOT EXISTS comment_id INT NULL
      `);
      console.log('Checked and updated notifications table structure');
    } catch (e) {
      console.error('Error updating notifications table:', e);
    }
    
    await connection.end();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Gọi hàm khởi tạo database
initDatabase();

// Routes
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/courses', lessonsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/seed', seedDataRoutes);
app.use('/api/migration', migrationRoutes);
app.use('/api/notifications', notificationsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
