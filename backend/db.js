const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
//<<<<<<< sep-11-login-signup-css
    // password: 'root',
  // password: 'Cookies1',// ako gi ilisan
=======
    port: '3308',
    password: 'root',
    // password: 'Cookies1',// ako gi ilisan
//>>>>>>> sep-12-backend-codes-finetuning-with-UI-Update
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