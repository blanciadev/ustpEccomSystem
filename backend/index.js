// backend/index.js
const express = require('express');
const app = express();
const db = require('./db');  // Import the MySQL connection pool

const PORT = process.env.PORT || 5000;

// Sample route using async/await
app.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows);  // Send the results as a JSON response
    } catch (err) {
        res.status(500).send('Error retrieving users');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
