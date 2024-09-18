const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');


const TOKEN_EXPIRATION_TIME = 3600000; // 1 hour

router.post('/customer-login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Fetch user data from the database
        const [rows] = await db.query('SELECT * FROM customer WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];


        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if a token already exists for the user
        const [existingTokenRows] = await db.query('SELECT * FROM tokens WHERE user_id = ?', [user.customer_id]);

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
            first_name: user.first_name
        });
    } catch (err) {
        // Log only the message
        console.error('Error during login:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/cart-item-count/:customer_id', async (req, res) => {
    const customerId = req.params.customer_id;

    try {
        const [rows] = await db.query('SELECT COUNT(*) AS itemCount FROM cart WHERE customer_id = ?', [customerId]);
        res.json({ itemCount: rows[0].itemCount });
    } catch (error) {
        console.error('Error fetching cart item count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/get-customer-details', async (req, res) => {
    const customerId = req.params.customer_id;

    try {
        const [rows] = await db.query('SELECT COUNT(*) AS itemCount FROM cart WHERE customer_id = ?', [customerId]);
        res.json({ itemCount: rows[0].itemCount });
    } catch (error) {
        console.error('Error fetching cart item count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});





module.exports = router;