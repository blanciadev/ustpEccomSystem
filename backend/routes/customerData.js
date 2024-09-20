const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/customer-insight', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) AS user_count
            FROM 
                tokens
            WHERE 
                created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) -- Start of the week
                AND created_at < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY) -- End of the week
        `);

        res.json({ insights: rows });
    } catch (error) {
        console.error('Error fetching customer insights:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
