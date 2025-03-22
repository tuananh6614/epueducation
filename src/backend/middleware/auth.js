
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Yêu cầu đăng nhập' 
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token không hợp lệ hoặc hết hạn' 
      });
    }
    
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
