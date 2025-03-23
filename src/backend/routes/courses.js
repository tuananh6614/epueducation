const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Truy vấn đơn giản vì bảng courses không có user_id và thumbnail
    const [courses] = await connection.execute(`
      SELECT c.*, u.full_name AS instructorName
      FROM courses c
      LEFT JOIN users u ON u.user_id = 9
    `);
    
    console.log('Fetched courses:', courses);
    
    // Thêm dữ liệu mô phỏng cho mỗi khóa học
    const processedCourses = courses.map(course => ({
      ...course,
      thumbnail: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e',
      enrolled: Math.floor(Math.random() * 100) + 50,
      isFeatured: Math.random() > 0.7,
      categories: ['Lập trình', 'Thuật toán'],
      duration: (Math.floor(Math.random() * 20) + 10) + ' giờ'
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
    
    // Truy vấn khóa học
    const [courses] = await connection.execute(`
      SELECT c.*, u.full_name AS instructorName
      FROM courses c
      LEFT JOIN users u ON u.user_id = 9
      WHERE c.course_id = ?
    `, [id]);
    
    if (courses.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy khóa học' 
      });
    }
    
    // Lấy danh sách bài học
    const [lessons] = await connection.execute(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index',
      [id]
    );
    
    console.log('Fetched lessons:', lessons);
    
    // Lấy danh sách bài kiểm tra
    const [quizzes] = await connection.execute(
      'SELECT * FROM quizzes WHERE course_id = ?',
      [id]
    );
    
    console.log('Fetched quizzes:', quizzes);
    
    // Cho mỗi bài kiểm tra, lấy danh sách câu hỏi
    for (let i = 0; i < quizzes.length; i++) {
      const [questions] = await connection.execute(
        'SELECT * FROM questions WHERE quiz_id = ?',
        [quizzes[i].quiz_id]
      );
      quizzes[i].questions = questions;
      
      // Cho mỗi câu hỏi, lấy câu trả lời (nếu có)
      for (let j = 0; j < questions.length; j++) {
        const [answers] = await connection.execute(
          'SELECT * FROM answers WHERE question_id = ?',
          [questions[j].question_id]
        );
        questions[j].answers = answers;
      }
    }
    
    await connection.end();
    
    // Xử lý dữ liệu khóa học
    const processedCourse = {
      ...courses[0],
      lessons,
      quizzes,
      thumbnail: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e',
      enrolled: Math.floor(Math.random() * 100) + 50,
      duration: lessons.length * 45 + ' phút',
      isFeatured: Math.random() > 0.7,
      categories: ['Lập trình', 'Thuật toán']
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

// Check if user is enrolled in a course
router.get('/:id/enrollment-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const connection = await createConnection();
    
    // Check if already enrolled
    const [enrollments] = await connection.execute(
      'SELECT * FROM courseenrollments WHERE user_id = ? AND course_id = ?',
      [userId, id]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      isEnrolled: enrollments.length > 0
    });
  } catch (error) {
    console.error('Check enrollment error:', error);
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
