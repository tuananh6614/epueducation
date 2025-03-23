
const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Function to convert YouTube URL to embed format
const formatYouTubeUrl = (url) => {
  if (!url) return null;

  // Check if it's a YouTube URL
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match && match[1]) {
    // Return the embed URL format
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  
  // If not a YouTube URL, return as is
  return url;
};

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
    
    // Handle different video field names
    const lesson = lessons[0];
    
    // Format video URLs if they exist
    if (lesson.video_url) {
      lesson.video_url = formatYouTubeUrl(lesson.video_url);
    }
    
    if (lesson.video_link) {
      lesson.video_link = formatYouTubeUrl(lesson.video_link);
    }
    
    // If video_url is present but video_link is not, add video_link field for consistency
    if (lesson.video_url && !lesson.video_link) {
      lesson.video_link = lesson.video_url;
    }
    
    await connection.end();
    
    res.json({
      success: true,
      data: lesson
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
