const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Function to format video URLs for embedding
const formatVideoUrl = (url) => {
  if (!url) return null;
  
  // Clean the URL in case multiple URLs are pasted together
  const cleanUrl = url.split('https://')[1] ? 'https://' + url.split('https://')[1] : url;
  
  // YouTube formats
  // Handle standard YouTube URLs
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = cleanUrl.match(youtubeRegex);
  
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Handle youtu.be format (YouTube shortlinks)
  if (cleanUrl.includes('youtu.be')) {
    const videoId = cleanUrl.split('youtu.be/')[1].split('?')[0].split('&')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // Check if it's already an embed URL
  if (cleanUrl.includes('/embed/')) {
    return cleanUrl;
  }
  
  // Google Drive format: Proper embedding for Google Drive files
  if (cleanUrl.includes('drive.google.com/file/d/')) {
    // Extract the file ID
    const driveIdMatch = cleanUrl.match(/\/d\/([^\/\?]+)/);
    if (driveIdMatch && driveIdMatch[1]) {
      const fileId = driveIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }
  
  // Check if it's a Vimeo URL
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = cleanUrl.match(vimeoRegex);
  
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // For other video URLs, just return as is
  return cleanUrl;
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
      lesson.video_url = formatVideoUrl(lesson.video_url);
    }
    
    if (lesson.video_link) {
      lesson.video_link = formatVideoUrl(lesson.video_link);
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
