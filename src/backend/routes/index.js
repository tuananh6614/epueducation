
const express = require('express');
const router = express.Router();

// Lấy các tuyến đường từ các file tương ứng
const authRoutes = require('./auth');
const courseRoutes = require('./courses');
const userRoutes = require('./user');
const lessonRoutes = require('./lessons');
const seedRoutes = require('./seedData');
const resourceRoutes = require('./resources');
const blogRoutes = require('./blog');
const likesRoutes = require('./likes');
const notificationRoutes = require('./notifications');
const migrationRoutes = require('./migration');

// Áp dụng các tuyến đường
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/user', userRoutes);
router.use('/lessons', lessonRoutes);
router.use('/seed', seedRoutes);
router.use('/resources', resourceRoutes);
router.use('/blog', blogRoutes);
router.use('/likes', likesRoutes);
router.use('/notifications', notificationRoutes);
router.use('/migrations', migrationRoutes);

module.exports = router;
