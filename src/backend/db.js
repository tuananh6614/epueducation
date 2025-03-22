
const mysql = require('mysql2/promise');

// Database connection
const createConnection = async () => {
  return await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'learningplatform'
  });
};

module.exports = { createConnection };
