const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createConnection } = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');
const userRoutes = require('./routes/user');
const blogRoutes = require('./routes/blog');
const resourceRoutes = require('./routes/resources');
const notificationRoutes = require('./routes/notifications');
const likesRoutes = require('./routes/likes');
const migrationRoutes = require('./routes/migration'); // Add this line
const seedDataRoutes = require('./routes/seedData');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/user', userRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/migration', migrationRoutes); // Add this line
app.use('/api/seed', seedDataRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
