
const express = require('express');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get purchased resources
router.get('/purchased', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Get user purchases
    const [purchases] = await connection.execute(`
      SELECT * FROM resource_purchases 
      WHERE user_id = ?
      ORDER BY purchase_date DESC
    `, [req.user.id]);
    
    // Get resources details
    let resources = [];
    if (purchases.length > 0) {
      const resourceIds = purchases.map(purchase => purchase.resource_id).join(',');
      
      const [resourcesResult] = await connection.execute(`
        SELECT * FROM resources 
        WHERE resource_id IN (${resourceIds})
      `);
      
      resources = resourcesResult;
    }
    
    await connection.end();
    
    res.json({
      success: true,
      data: {
        purchases,
        resources
      }
    });
  } catch (error) {
    console.error('Get purchased resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

// Download resource
router.post('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await createConnection();
    
    // Verify user has purchased this resource
    const [purchases] = await connection.execute(`
      SELECT * FROM resource_purchases 
      WHERE user_id = ? AND resource_id = ?
    `, [req.user.id, id]);
    
    if (purchases.length === 0) {
      await connection.end();
      return res.status(403).json({
        success: false,
        message: 'Bạn chưa mua tài liệu này'
      });
    }
    
    // Update download count
    await connection.execute(`
      UPDATE resources 
      SET download_count = download_count + 1
      WHERE resource_id = ?
    `, [id]);
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Tải tài liệu thành công'
    });
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

module.exports = router;
