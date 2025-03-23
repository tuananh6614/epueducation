
const express = require('express');
const path = require('path');
const fs = require('fs');
const { createConnection } = require('../db');
const { authenticateToken, adminCheck } = require('../middleware/auth');
const { resourceUpload, getFileType, resourcesDir } = require('../config/upload');
const SEPAY_CONFIG = require('../config/sepay');
const axios = require('axios');
const crypto = require('crypto');

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
    
    console.log(`Processing purchase for resource ${resourceId} by user ${userId}`);
    
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
        console.log('User already purchased this resource');
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
        console.log('Resource not found');
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài liệu'
        });
      }
      
      const resource = resources[0];
      console.log(`Resource found: ${resource.title}, price: ${resource.price}`);
      
      // Get user balance
      const [users] = await connection.execute(`
        SELECT balance FROM users WHERE user_id = ?
      `, [userId]);
      
      const userBalance = users[0].balance;
      console.log(`User balance: ${userBalance}`);
      
      // Check if user has enough balance
      if (parseFloat(userBalance) < parseFloat(resource.price)) {
        await connection.rollback();
        console.log('Insufficient balance');
        return res.status(400).json({
          success: false,
          message: 'Số dư không đủ để mua tài liệu này'
        });
      }
      
      // Update user balance
      const newBalance = parseFloat(userBalance) - parseFloat(resource.price);
      await connection.execute(`
        UPDATE users SET balance = ? WHERE user_id = ?
      `, [newBalance, userId]);
      
      console.log(`Updated user balance to: ${newBalance}`);
      
      // Record purchase
      await connection.execute(`
        INSERT INTO resource_purchases (user_id, resource_id, price_paid)
        VALUES (?, ?, ?)
      `, [userId, resourceId, resource.price]);
      
      console.log('Recorded purchase');
      
      // Record transaction
      await connection.execute(`
        INSERT INTO transactions (user_id, amount, transaction_type, status, related_id)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, resource.price, 'resource_purchase', 'completed', resourceId]);
      
      console.log('Recorded transaction');
      
      // Create notification for user
      await connection.execute(`
        INSERT INTO notifications (user_id, type, message, is_read)
        VALUES (?, ?, ?, ?)
      `, [userId, 'system', `Bạn đã mua thành công tài liệu "${resource.title}"`, false]);
      
      console.log('Created notification');
      
      await connection.commit();
      console.log('Transaction committed successfully');
      
      res.json({
        success: true,
        message: 'Mua tài liệu thành công',
        data: {
          new_balance: newBalance
        }
      });
    } catch (error) {
      console.error('Error in purchase transaction:', error);
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
    const { amount, transaction_id, bank_info } = req.body;
    
    if (!amount || amount <= 0 || !transaction_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập số tiền và mã giao dịch hợp lệ'
      });
    }
    
    const connection = await createConnection();
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Create a pending transaction
      await connection.execute(
        'INSERT INTO transactions (user_id, amount, transaction_type, status, transaction_ref, metadata) VALUES (?, ?, ?, ?, ?, ?)',
        [
          req.user.id, 
          amount, 
          'deposit', 
          'pending', 
          transaction_id,
          JSON.stringify(bank_info || {})
        ]
      );
      
      // Record in payment history
      await connection.execute(
        'INSERT INTO payment_history (user_id, amount, payment_method, transaction_ref, bank_name, account_number, account_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          req.user.id,
          amount,
          'bank_transfer',
          transaction_id,
          bank_info?.bank_name || null,
          bank_info?.account_number || null,
          bank_info?.account_name || null,
          'pending'
        ]
      );
      
      // Get current balance (don't update yet, admin will verify)
      const [users] = await connection.execute(
        'SELECT balance FROM users WHERE user_id = ?',
        [req.user.id]
      );
      
      await connection.commit();
      await connection.end();
      
      res.json({
        success: true,
        message: 'Yêu cầu nạp tiền đã được ghi nhận, đang chờ xác nhận',
        data: {
          amount,
          transaction_id,
          current_balance: users[0].balance,
          new_balance: users[0].balance // Not updated yet
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

// Add a route for handling deposit notifications
router.post('/verify-deposit', authenticateToken, adminCheck, async (req, res) => {
  try {
    const { transaction_id, username, amount, status } = req.body;

    if (!transaction_id || !username || !amount || !status) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin giao dịch'
      });
    }

    const connection = await createConnection();
    await connection.beginTransaction();

    try {
      // Find the user by username
      const [users] = await connection.execute(
        'SELECT user_id, balance FROM users WHERE username = ?',
        [username]
      );

      if (users.length === 0) {
        await connection.rollback();
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      const userId = users[0].user_id;
      const currentBalance = users[0].balance;

      if (status === 'success') {
        // Update user balance
        const newBalance = parseFloat(currentBalance) + parseFloat(amount);
        
        await connection.execute(
          'UPDATE users SET balance = ? WHERE user_id = ?',
          [newBalance, userId]
        );

        // Record transaction
        await connection.execute(
          'INSERT INTO transactions (user_id, amount, transaction_type, status, transaction_ref) VALUES (?, ?, ?, ?, ?)',
          [userId, amount, 'deposit', 'completed', transaction_id]
        );

        // Update payment history
        await connection.execute(
          'UPDATE payment_history SET status = ?, admin_note = ? WHERE user_id = ? AND transaction_ref = ?',
          ['completed', 'Xác nhận bởi admin', userId, transaction_id]
        );

        // Create notification for the user
        await connection.execute(
          'INSERT INTO notifications (user_id, type, message, is_read) VALUES (?, ?, ?, ?)',
          [userId, 'system', `Nạp tiền thành công: +${amount.toLocaleString('vi-VN')}đ`, false]
        );

        await connection.commit();
        await connection.end();

        return res.json({
          success: true,
          message: 'Xác nhận nạp tiền thành công',
          data: {
            user_id: userId,
            amount,
            new_balance: newBalance
          }
        });
      } else {
        // Record failed transaction
        await connection.execute(
          'INSERT INTO transactions (user_id, amount, transaction_type, status, transaction_ref) VALUES (?, ?, ?, ?, ?)',
          [userId, amount, 'deposit', 'failed', transaction_id]
        );

        // Update payment history
        await connection.execute(
          'UPDATE payment_history SET status = ?, admin_note = ? WHERE user_id = ? AND transaction_ref = ?',
          ['failed', 'Từ chối bởi admin', userId, transaction_id]
        );

        await connection.commit();
        await connection.end();

        return res.status(400).json({
          success: false,
          message: 'Giao dịch không thành công'
        });
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Verify deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

// Add new endpoint to get pending transactions for admin
router.get('/pending-deposits', authenticateToken, adminCheck, async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [transactions] = await connection.execute(`
      SELECT t.*, u.username, u.email, u.full_name,
             p.bank_name, p.account_number, p.account_name 
      FROM transactions t
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN payment_history p ON t.transaction_ref = p.transaction_ref AND t.user_id = p.user_id
      WHERE t.transaction_type = 'deposit' AND t.status = 'pending'
      ORDER BY t.created_at DESC
    `);
    
    await connection.end();
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get pending deposits error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

// Add endpoint to get payment history for user
router.get('/payment-history', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [payments] = await connection.execute(`
      SELECT * FROM payment_history 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);
    
    await connection.end();
    
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

// Tích hợp thanh toán SePay
router.post('/sepay-deposit', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập số tiền hợp lệ'
      });
    }
    
    // Tạo mã giao dịch duy nhất
    const transactionRef = `SP${Date.now()}${userId}`;
    
    // Lấy thông tin người dùng
    const connection = await createConnection();
    await connection.beginTransaction();
    
    try {
      const [users] = await connection.execute('SELECT username FROM users WHERE user_id = ?', [userId]);
      const username = users[0].username;
      
      // Tạo chữ ký
      const dataToSign = `${SEPAY_CONFIG.MERCHANT_ID}|${transactionRef}|${amount}|${username}`;
      const signature = crypto
        .createHmac('sha256', SEPAY_CONFIG.API_TOKEN)
        .update(dataToSign)
        .digest('hex');
      
      // Tạo URL thanh toán
      const paymentData = {
        merchant_id: SEPAY_CONFIG.MERCHANT_ID,
        transaction_id: transactionRef,
        amount: amount,
        currency: 'VND',
        description: `Nạp tiền cho tài khoản ${username}`,
        customer_name: username,
        customer_email: req.user.email || '',
        return_url: `http://localhost:5173/payment-result`, // URL trả về sau khi thanh toán
        callback_url: SEPAY_CONFIG.WEBHOOK_URL, // Webhook URL
        signature: signature
      };
      
      // Gọi API của SePay để tạo yêu cầu thanh toán
      const sepayResponse = await axios.post(`${SEPAY_CONFIG.API_URL}/create-payment`, paymentData, {
        headers: {
          'Authorization': `Bearer ${SEPAY_CONFIG.API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (sepayResponse.data.success) {
        // Lưu thông tin giao dịch vào cơ sở dữ liệu
        await connection.execute(
          'INSERT INTO transactions (user_id, amount, transaction_type, status, transaction_ref, metadata) VALUES (?, ?, ?, ?, ?, ?)',
          [
            userId, 
            amount, 
            'deposit', 
            'pending', 
            transactionRef,
            JSON.stringify({
              payment_url: sepayResponse.data.payment_url,
              payment_method: 'sepay'
            })
          ]
        );
        
        // Record in payment history
        await connection.execute(
          'INSERT INTO payment_history (user_id, amount, payment_method, transaction_ref, status) VALUES (?, ?, ?, ?, ?)',
          [
            userId,
            amount,
            'sepay',
            transactionRef,
            'pending'
          ]
        );
        
        await connection.commit();
        await connection.end();
        
        // Trả về payment URL cho client
        res.json({
          success: true,
          message: 'Đã tạo yêu cầu thanh toán',
          data: {
            payment_url: sepayResponse.data.payment_url,
            transaction_ref: transactionRef
          }
        });
      } else {
        await connection.rollback();
        await connection.end();
        throw new Error('Không thể tạo yêu cầu thanh toán');
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('SePay deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi kết nối đến cổng thanh toán, vui lòng thử lại sau'
    });
  }
});

// Webhook để nhận kết quả thanh toán từ SePay
router.post('/sepay-webhook', async (req, res) => {
  try {
    const {
      merchant_id,
      transaction_id,
      amount,
      status,
      signature
    } = req.body;
    
    // Xác minh chữ ký
    const dataToVerify = `${merchant_id}|${transaction_id}|${amount}|${status}`;
    const expectedSignature = crypto
      .createHmac('sha256', SEPAY_CONFIG.API_TOKEN)
      .update(dataToVerify)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
    
    // Xác minh merchant ID
    if (merchant_id !== SEPAY_CONFIG.MERCHANT_ID) {
      console.error('Invalid merchant ID');
      return res.status(400).json({ success: false, message: 'Invalid merchant ID' });
    }
    
    const connection = await createConnection();
    await connection.beginTransaction();
    
    try {
      // Tìm giao dịch trong cơ sở dữ liệu
      const [transactions] = await connection.execute(
        'SELECT * FROM transactions WHERE transaction_ref = ? AND transaction_type = ? AND status = ?',
        [transaction_id, 'deposit', 'pending']
      );
      
      if (transactions.length === 0) {
        await connection.rollback();
        await connection.end();
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      
      const transaction = transactions[0];
      
      // Nếu giao dịch thành công, cập nhật số dư người dùng
      if (status === 'successful') {
        // Cập nhật trạng thái giao dịch
        await connection.execute(
          'UPDATE transactions SET status = ? WHERE transaction_id = ?',
          ['completed', transaction.transaction_id]
        );
        
        // Update payment history
        await connection.execute(
          'UPDATE payment_history SET status = ? WHERE transaction_ref = ?',
          ['completed', transaction_id]
        );
        
        // Cập nhật số dư người dùng
        await connection.execute(
          'UPDATE users SET balance = balance + ? WHERE user_id = ?',
          [parseFloat(amount), transaction.user_id]
        );
        
        // Tạo thông báo cho người dùng
        await connection.execute(
          'INSERT INTO notifications (user_id, type, message, is_read) VALUES (?, ?, ?, ?)',
          [transaction.user_id, 'system', `Nạp tiền thành công: +${parseFloat(amount).toLocaleString('vi-VN')}đ`, false]
        );
      } else {
        // Cập nhật trạng thái giao dịch thành thất bại
        await connection.execute(
          'UPDATE transactions SET status = ? WHERE transaction_id = ?',
          ['failed', transaction.transaction_id]
        );
        
        // Update payment history
        await connection.execute(
          'UPDATE payment_history SET status = ? WHERE transaction_ref = ?',
          ['failed', transaction_id]
        );
        
        // Tạo thông báo cho người dùng
        await connection.execute(
          'INSERT INTO notifications (user_id, type, message, is_read) VALUES (?, ?, ?, ?)',
          [transaction.user_id, 'system', `Nạp tiền thất bại. Vui lòng liên hệ hỗ trợ.`, false]
        );
      }
      
      await connection.commit();
      await connection.end();
      
      // Phản hồi thành công cho SePay
      res.json({ success: true });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('SePay webhook error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Trang kết quả thanh toán
router.get('/check-payment-status/:transactionRef', authenticateToken, async (req, res) => {
  try {
    const { transactionRef } = req.params;
    const userId = req.user.id;
    
    const connection = await createConnection();
    
    // Kiểm tra trạng thái giao dịch
    const [transactions] = await connection.execute(
      'SELECT * FROM transactions WHERE transaction_ref = ? AND user_id = ?',
      [transactionRef, userId]
    );
    
    await connection.end();
    
    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }
    
    const transaction = transactions[0];
    
    res.json({
      success: true,
      data: {
        status: transaction.status,
        amount: transaction.amount,
        created_at: transaction.created_at
      }
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau'
    });
  }
});

module.exports = router;
