
const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
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

router.get('/:id', async (req, res) => {
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

module.exports = router;
