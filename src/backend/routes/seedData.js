
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { addSampleCourse, addCalculusCourse } = require('../seedCourse');

const router = express.Router();

// Endpoint to add a sample course (protected, requires authentication)
router.post('/courses/seed', authenticateToken, async (req, res) => {
  try {
    const result = await addSampleCourse();
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Đã thêm khóa học mẫu thành công',
        courseId: result.courseId
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Không thể thêm khóa học mẫu'
      });
    }
  } catch (error) {
    console.error('Seed course error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

// Endpoint to add a calculus course (protected, requires authentication)
router.post('/courses/seed/calculus', authenticateToken, async (req, res) => {
  try {
    const result = await addCalculusCourse();
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Đã thêm khóa học Toán Cao Cấp 3 thành công',
        courseId: result.courseId
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Không thể thêm khóa học Toán Cao Cấp 3'
      });
    }
  } catch (error) {
    console.error('Seed calculus course error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

module.exports = router;
