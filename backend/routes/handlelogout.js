const express = require('express');
const router = express.Router();
const db = require('../db');


const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM tokens WHERE token = ?', [token]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const tokenData = rows[0];
        if (new Date(tokenData.expires_at) < new Date()) {
            return res.status(401).json({ message: 'Token expired' });
        }

        const [userRows] = await db.query('SELECT * FROM users WHERE customer_id = ?', [tokenData.user_id]);

        if (userRows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = userRows[0];
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ message: 'No token provided.' });
    }

    try {
        await db.query('DELETE FROM tokens WHERE token = ?', [token]);
        console.error('Deleting token');
        res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
        console.error('Error during logout:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;