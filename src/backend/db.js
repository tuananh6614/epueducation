
const mysql = require('mysql2/promise');

// Database connection
const createConnection = async () => {
  try {
    // First try to connect to the specific database
    return await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'learning'
    });
  } catch (error) {
    // If connection fails, create the database
    console.error('Database connection error:', error);
    console.log('Attempting to create database...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    await connection.query('CREATE DATABASE IF NOT EXISTS learning');
    console.log('Database created or already exists');
    
    // Now connect to the database
    return await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'learning'
    });
  }
};

module.exports = { createConnection };

