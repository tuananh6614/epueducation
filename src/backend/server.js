
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const coursesRoutes = require('./routes/courses');
const blogRoutes = require('./routes/blog');
const likesRoutes = require('./routes/likes');
const resourcesRoutes = require('./routes/resources');
const seedDataRoutes = require('./routes/seedData');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api', seedDataRoutes); // Add the seed routes

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
