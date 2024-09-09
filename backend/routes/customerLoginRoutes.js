const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');


const TOKEN_EXPIRATION_TIME = 3600000; // 1 hour

router.post('/customer-login', async (req, res) => {
    const { email, password } = req.body;

    // Logging result in console
    console.log('Received login request');
    console.log('Email:', email);
    console.log('Password:', password);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Special credentials that bypass the usual login mechanism
    if (email === 'sa@gmail.com' && password === '1234') {
        // Generate a random token for the special login
        const token = crypto.randomBytes(64).toString('hex');
        return res.json({
            message: 'Login successful (special case)',
            token: token,
            user_id: 'special-user-id'
        });
    }

    try {
        // Fetch user data from database
        const [rows] = await db.query('SELECT * FROM customer WHERE email = ?', [email]);
        console.log('Database query result:', rows);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];

        // Direct password comparison
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a random token
        const token = crypto.randomBytes(64).toString('hex');

        // Store the token in the database
        await db.query('INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [
            user.customer_id,
            token,
            new Date(Date.now() + TOKEN_EXPIRATION_TIME)
        ]);

        // Respond with success message, token, and customer_id
        res.json({
            message: 'Login successful',
            token: token,
            user_id: user.customer_id
        });
    } catch (err) {
        // Log only the message
        console.error('Error during login:', err.message);

        // In case of an error, allow login for the special user
        if (email === 'sa@gmail.com' && password === '1234') {
            // Generate a random token for the special login
            const token = crypto.randomBytes(64).toString('hex');
            return res.json({
                message: 'Login successful (special case, fallback)',
                token: token,
                user_id: 'special-user-id'
            });
        }

        res.status(500).json({ message: 'Internal server error' });
    }
});

// router.post('/customer-login', async (req, res) => {
//     const { email, password } = req.body;

//     // Logging result in console
//     console.log('Received login request');
//     console.log('Email:', email);
//     console.log('Password:', password);

//     if (!email || !password) {
//         return res.status(400).json({ message: 'Email and password are required' });
//     }

//     try {
//         // Fetch user data from database
//         const [rows] = await db.query('SELECT * FROM customer WHERE email = ?', [email]);
//         console.log('Database query result:', rows);

//         if (rows.length === 0) {
//             return res.status(401).json({ message: 'Invalid email or password' });
//         }

//         const user = rows[0];

//         // Direct password comparison
//         if (password !== user.password) {
//             return res.status(401).json({ message: 'Invalid email or password' });
//         }

//         // Generate a random token
//         const token = crypto.randomBytes(64).toString('hex');

//         // Store the token in the database
//         await db.query('INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [
//             user.customer_id,
//             token,
//             new Date(Date.now() + TOKEN_EXPIRATION_TIME)
//         ]);

//         // Respond with success message, token, and customer_id
//         res.json({
//             message: 'Login successful',
//             token: token,
//             user_id: user.customer_id
//         });
//     } catch (err) {
//         // Log only the message
//         console.error('Error during login:', err.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

module.exports = router;
