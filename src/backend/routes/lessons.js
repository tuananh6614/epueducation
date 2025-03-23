
const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get a specific lesson
router.get('/:courseId/lessons/:lessonId', async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const connection = await createConnection();
    
    // First check if the lesson belongs to the course
    const [lessons] = await connection.execute(
      'SELECT * FROM lessons WHERE course_id = ? AND lesson_id = ?',
      [courseId, lessonId]
    );
    
    if (lessons.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy bài học' 
      });
    }
    
    await connection.end();
    
    res.json({
      success: true,
      data: lessons[0]
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

// Update lesson content 
router.put('/:courseId/lessons/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    const connection = await createConnection();
    
    // Check if the course exists and if the user is the instructor
    const [courses] = await connection.execute(
      'SELECT instructor_id FROM courses WHERE course_id = ?',
      [courseId]
    );
    
    if (courses.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy khóa học' 
      });
    }
    
    // Only the instructor can update lesson content
    if (courses[0].instructor_id !== userId) {
      await connection.end();
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật bài học này'
      });
    }
    
    // Update the lesson content
    await connection.execute(
      'UPDATE lessons SET content = ? WHERE lesson_id = ? AND course_id = ?',
      [content, lessonId, courseId]
    );
    
    // Get the updated lesson
    const [updatedLessons] = await connection.execute(
      'SELECT * FROM lessons WHERE lesson_id = ? AND course_id = ?',
      [lessonId, courseId]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Cập nhật nội dung bài học thành công',
      data: updatedLessons[0]
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ, vui lòng thử lại sau' 
    });
  }
});

module.exports = router;
