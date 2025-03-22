
const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Get courses with instructor information and categories
    const [courses] = await connection.execute(`
      SELECT c.*, u.full_name AS instructorName, cat.name AS category_name,
      (SELECT COUNT(*) FROM course_enrollments WHERE course_id = c.course_id) AS enrolled
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.user_id
      LEFT JOIN categories cat ON c.category_id = cat.category_id
    `);
    
    // Process courses to include categories as an array
    const processedCourses = courses.map(course => ({
      ...course,
      categories: course.category_name ? [course.category_name] : [],
      enrolled: course.enrolled || 0,
      isFeatured: Math.random() > 0.7 // Random featured status for demo
    }));
    
    await connection.end();
    
    res.json({
      success: true,
      data: processedCourses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await createConnection();
    
    // Get course details with instructor information and category
    const [courses] = await connection.execute(`
      SELECT c.*, u.full_name AS instructorName, cat.name AS category_name,
      (SELECT COUNT(*) FROM course_enrollments WHERE course_id = c.course_id) AS enrolled
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.user_id
      LEFT JOIN categories cat ON c.category_id = cat.category_id
      WHERE c.course_id = ?
    `, [id]);
    
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
    
    // Process course to include category as an array
    const processedCourse = {
      ...courses[0],
      categories: courses[0].category_name ? [courses[0].category_name] : [],
      lessons,
      quizzes,
      enrolled: courses[0].enrolled || 0,
      duration: '36 giờ', // Placeholder for now
      isFeatured: Math.random() > 0.7 // Random featured status for demo
    };
    
    res.json({
      success: true,
      data: processedCourse
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Endpoint to enroll in a course
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const connection = await createConnection();
    
    // Check if course exists
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
    
    // Check if already enrolled
    const [enrollments] = await connection.execute(
      'SELECT * FROM course_enrollments WHERE user_id = ? AND course_id = ?',
      [userId, id]
    );
    
    if (enrollments.length > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký khóa học này rồi'
      });
    }
    
    // Enroll in course
    await connection.execute(
      'INSERT INTO course_enrollments (user_id, course_id) VALUES (?, ?)',
      [userId, id]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Đăng ký khóa học thành công'
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

module.exports = router;
