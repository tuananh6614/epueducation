
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
app.use(bodyParser.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, '../../public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../../../public/uploads')));
app.use('/resources', express.static(path.join(__dirname, '../../../public/resources')));

// Routes
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/courses', lessonsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api', seedDataRoutes);
app.use('/api/migration', migrationRoutes);
app.use('/api/notifications', notificationsRoutes);

// Add sample resource endpoint
app.get('/api/add-sample-resource', async (req, res) => {
  try {
    const connection = await createConnection();
    const fs = require('fs');
    
    // Check if sample resource file exists in resources directory
    const resourcesDir = path.join(__dirname, '../../../public/resources');
    const sampleFilePath = path.join(resourcesDir, 'resource-sample.pdf');
    
    // Create resources directory if it doesn't exist
    if (!fs.existsSync(resourcesDir)) {
      fs.mkdirSync(resourcesDir, { recursive: true });
    }
    
    // Create sample PDF if it doesn't exist
    if (!fs.existsSync(sampleFilePath)) {
      // Create a simple PDF-like file (just a placeholder)
      fs.writeFileSync(sampleFilePath, 'This is a sample PDF resource file for JavaScript learning');
    }
    
    // Read and execute the SQL file
    const sqlFile = path.join(__dirname, './sql/add_sample_resource.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await connection.query(sql);
    await connection.end();
    
    res.json({
      success: true,
      message: 'Sample resource added successfully'
    });
  } catch (error) {
    console.error('Error adding sample resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding sample resource'
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
