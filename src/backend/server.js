
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import config
const { PORT } = require('./config');

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const blogRoutes = require('./routes/blog');
const likeRoutes = require('./routes/likes');
const userRoutes = require('./routes/user');
const resourceRoutes = require('./routes/resources');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/resources', resourceRoutes);

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
