const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',

    //angela
    port: '3306',
    password: '',

    // PORT KURT 
    // port: '3308',
    // password: 'root',

    database: 'ustpecom',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection (optional)
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database');
        connection.release();
    } catch (err) {
        console.error('Error connecting to MySQL:', err);
    }
};

testConnection();

module.exports = pool;