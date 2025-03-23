
const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Điều chỉnh SQL query dựa trên cấu trúc bảng thực tế
    const [courses] = await connection.execute(`
      SELECT c.*, u.full_name AS instructorName,
      (SELECT COUNT(*) FROM courseenrollments WHERE course_id = c.course_id) AS enrolled
      FROM courses c
      LEFT JOIN users u ON c.user_id = u.user_id
    `);
    
    // Process courses 
    const processedCourses = courses.map(course => ({
      ...course,
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
    
    // Get course details
    const [courses] = await connection.execute(`
      SELECT c.*, u.full_name AS instructorName,
      (SELECT COUNT(*) FROM courseenrollments WHERE course_id = c.course_id) AS enrolled
      FROM courses c
      LEFT JOIN users u ON c.user_id = u.user_id
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
    
    // For each quiz, get its questions
    for (let i = 0; i < quizzes.length; i++) {
      const [questions] = await connection.execute(
        'SELECT * FROM questions WHERE quiz_id = ?',
        [quizzes[i].quiz_id]
      );
      quizzes[i].questions = questions;
    }
    
    await connection.end();
    
    // Process course
    const processedCourse = {
      ...courses[0],
      lessons,
      quizzes,
      enrolled: courses[0].enrolled || 0,
      duration: lessons.reduce((total, lesson) => total + 45, 0) + ' phút', // Assume 45 minutes per lesson
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
      'SELECT * FROM courseenrollments WHERE user_id = ? AND course_id = ?',
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
      'INSERT INTO courseenrollments (user_id, course_id) VALUES (?, ?)',
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
