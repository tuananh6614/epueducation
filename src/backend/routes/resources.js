
const express = require('express');
const path = require('path');
const fs = require('fs');
const { createConnection } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { resourceUpload, getFileType, resourcesDir } = require('../config/upload');

const router = express.Router();

// Get all resources (public listing)
router.get('/', async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [resources] = await connection.execute(`
      SELECT r.*, u.username AS author_name 
      FROM resources r
      JOIN users u ON r.author_id = u.user_id
      ORDER BY r.created_at DESC
    `);
    
    await connection.end();
    
    // Add server URL to file paths
    const resourcesWithURLs = resources.map(resource => ({
      ...resource,
      thumbnail: resource.thumbnail ? `http://localhost:${process.env.PORT || 5000}/uploads/${resource.thumbnail}` : null,
    }));
    
    res.json({
      success: true,
      data: resourcesWithURLs
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

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
      const resourceIds = purchases.map(purchase => purchase.resource_id);
      
      const [resourcesResult] = await connection.execute(`
        SELECT r.*, u.username AS author_name 
        FROM resources r
        JOIN users u ON r.author_id = u.user_id
        WHERE r.resource_id IN (${resourceIds.join(',')})
      `);
      
      resources = resourcesResult.map(resource => ({
        ...resource,
        thumbnail: resource.thumbnail ? `http://localhost:${process.env.PORT || 5000}/uploads/${resource.thumbnail}` : null,
      }));
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

// Upload new resource
router.post('/upload', authenticateToken, resourceUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file được tải lên'
      });
    }
    
    const { title, description, price } = req.body;
    
    if (!title || !price) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(path.join(resourcesDir, req.file.filename));
      
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }
    
    const fileType = getFileType(req.file.originalname);
    const connection = await createConnection();
    
    // Insert resource data
    const [result] = await connection.execute(`
      INSERT INTO resources (title, description, file_url, file_type, price, author_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      title,
      description || null,
      req.file.filename,
      fileType,
      parseFloat(price),
      req.user.id
    ]);
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Tải lên tài liệu thành công',
      data: {
        resource_id: result.insertId
      }
    });
  } catch (error) {
    console.error('Upload resource error:', error);
    
    // Delete uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(path.join(resourcesDir, req.file.filename));
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

// Purchase resource
router.post('/:id/purchase', authenticateToken, async (req, res) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;
    
    const connection = await createConnection();
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Check if already purchased
      const [existingPurchases] = await connection.execute(`
        SELECT * FROM resource_purchases 
        WHERE user_id = ? AND resource_id = ?
      `, [userId, resourceId]);
      
      if (existingPurchases.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Bạn đã mua tài liệu này trước đó'
        });
      }
      
      // Get resource info
      const [resources] = await connection.execute(`
        SELECT * FROM resources WHERE resource_id = ?
      `, [resourceId]);
      
      if (resources.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài liệu'
        });
      }
      
      const resource = resources[0];
      
      // Get user balance
      const [users] = await connection.execute(`
        SELECT balance FROM users WHERE user_id = ?
      `, [userId]);
      
      const userBalance = users[0].balance;
      
      if (userBalance < resource.price) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Số dư không đủ để mua tài liệu này'
        });
      }
      
      // Update user balance
      await connection.execute(`
        UPDATE users SET balance = balance - ? WHERE user_id = ?
      `, [resource.price, userId]);
      
      // Record purchase
      await connection.execute(`
        INSERT INTO resource_purchases (user_id, resource_id, price_paid)
        VALUES (?, ?, ?)
      `, [userId, resourceId, resource.price]);
      
      // Record transaction
      await connection.execute(`
        INSERT INTO transactions (user_id, amount, transaction_type, status, related_id)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, resource.price, 'resource_purchase', 'completed', resourceId]);
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Mua tài liệu thành công',
        data: {
          new_balance: userBalance - resource.price
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Purchase resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

// Download resource
router.get('/:id/download', authenticateToken, async (req, res) => {
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
    
    // Get resource info
    const [resources] = await connection.execute(`
      SELECT * FROM resources WHERE resource_id = ?
    `, [id]);
    
    if (resources.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }
    
    const resource = resources[0];
    
    // Update download count
    await connection.execute(`
      UPDATE resources SET download_count = download_count + 1 WHERE resource_id = ?
    `, [id]);
    
    await connection.end();
    
    // Check if file exists
    const filePath = path.join(resourcesDir, resource.file_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File không tồn tại'
      });
    }
    
    // Send file for download
    res.download(filePath, path.basename(resource.file_url));
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

// Process deposit
router.post('/deposit', authenticateToken, async (req, res) => {
  try {
    const { amount, bank_info } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập số tiền hợp lệ'
      });
    }
    
    // In a real application, this would connect to a payment gateway
    // For demo purposes, we'll just simulate a successful deposit
    
    const connection = await createConnection();
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Update user balance
      await connection.execute(`
        UPDATE users SET balance = balance + ? WHERE user_id = ?
      `, [amount, req.user.id]);
      
      // Record transaction
      await connection.execute(`
        INSERT INTO transactions (user_id, amount, transaction_type, status)
        VALUES (?, ?, ?, ?)
      `, [req.user.id, amount, 'deposit', 'completed']);
      
      // Get updated balance
      const [users] = await connection.execute(`
        SELECT balance FROM users WHERE user_id = ?
      `, [req.user.id]);
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Nạp tiền thành công',
        data: {
          new_balance: users[0].balance
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

module.exports = router;
