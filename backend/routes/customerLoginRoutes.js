const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');


const TOKEN_EXPIRATION_TIME = 3600000; // 1 hour

router.post('/users-login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Fetch user data from the database
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];


        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if a token already exists for the user
        const [existingTokenRows] = await db.query('SELECT * FROM tokens WHERE user_id = ? AND token_status = ?', [user.customer_id, 'Active']);

        if (existingTokenRows.length > 0) {
            return res.status(400).json({ message: 'User already logged in' });
        }

        // Generate a random token
        const token = crypto.randomBytes(64).toString('hex');

        // Store the token in the database
        await db.query('INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [
            user.customer_id,
            token,
            new Date(Date.now() + TOKEN_EXPIRATION_TIME)
        ]);

        // Respond with success message, token, user_id, username, and first_name
        res.json({
            message: 'Login successful',
            token: token,
            user_id: user.customer_id,
            username: user.username,
            first_name: user.first_name,
            role_type: user.role_type
        });
    } catch (err) {
        // Log only the message
        console.error('Token Validation Backedn Error during login:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});




module.exports = router;