const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    port: '3308',
    //password: 'root',
    password: 'Cookies1',// ako gi ilisan
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
        connection.release(); // Release the connection back to the pool
    } catch (err) {
        console.error('Error connecting to MySQL:', err);
    }
};

testConnection();

module.exports = pool;