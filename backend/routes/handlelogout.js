const express = require('express');
const router = express.Router();
const db = require('../db');


const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        // Fetch the token from the database
        const [rows] = await db.query('SELECT * FROM tokens WHERE token = ?', [token]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const tokenData = rows[0];
        // Check if the token is expired
        if (new Date(tokenData.expires_at) < new Date()) {
            return res.status(401).json({ message: 'Token expired' });
        }

        // Fetch user details based on the token
        const [userRows] = await db.query('SELECT * FROM users WHERE customer_id = ?', [tokenData.user_id]);

        if (userRows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = userRows[0]; // Attach user info to request
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from headers

    if (!token) {
        return res.status(400).json({ message: 'No token provided.' });
    }

    try {
        // Update the token in the database
        await db.query('UPDATE tokens SET token_status = ?, expires_at = NOW() WHERE token = ?', ['Deactivated', token]);

        // Optionally, blacklist the token in memory
        // blacklistToken(token);

        res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
        console.error('Error during logout:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;