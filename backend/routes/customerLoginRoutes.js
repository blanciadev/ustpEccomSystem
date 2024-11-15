const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');


const TOKEN_EXPIRATION_TIME = 1900000;


router.post('/users-login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];

        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check for an existing token
        const [existingTokenRows] = await db.query(
            'SELECT * FROM tokens WHERE user_id = ? AND token_status = ?',
            [user.customer_id, 'Active']
        );

        if (existingTokenRows.length > 0) {
            const existingToken = existingTokenRows[0];

            // Check if the existing token is expired
            const now = new Date();
            if (new Date(existingToken.expires_at) > now) {
                return res.status(400).json({ message: 'User already logged in' });
            } else {
                // Token is expired, so delete it
                await db.query('DELETE FROM tokens WHERE token = ?', [existingToken.token]);
                console.log('Expired token deleted:', existingToken.token);
            }
        }

        // Generate a new token
        const token = crypto.randomBytes(64).toString('hex');

        // Store the new token in the database
        await db.query(
            'INSERT INTO tokens (user_id, token, token_status, expires_at) VALUES (?, ?, ?, ?)',
            [
                user.customer_id,
                token,
                'Active',
                new Date(Date.now() + TOKEN_EXPIRATION_TIME)
            ]
        );

        // Respond with the token and user info
        res.json({
            message: 'Login successful',
            token: token,
            user_id: user.customer_id,
            username: user.username,
            first_name: user.first_name,
            role_type: user.role_type
        });
    } catch (err) {
        console.error('Token Validation Backend Error during login:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Endpoint to fetch and update user details
router.route('/users-details')
    .post(async (req, res) => {
        const { customer_id } = req.body;

        if (!customer_id) {
            return res.status(400).json({ message: 'Customer ID is required.' });
        }

        try {
            const [userDetails] = await db.query('SELECT * FROM users WHERE customer_id = ?', [customer_id]);
            if (userDetails.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json(userDetails[0]);
        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({ message: 'Server error' });
        }
    })

    // Update user details
    .put(async (req, res) => {
        const { customer_id, first_name, last_name, email, phone_number, street_name, region, postal_code, address, role_type } = req.body;

        if (!customer_id) {
            return res.status(400).json({ message: 'Customer ID is required.' });
        }

        // Validate required fields (add more as necessary)
        if (!first_name || !last_name || !email) {
            return res.status(400).json({ message: 'First name, last name, and email are required.' });
        }

        try {
            const result = await db.query(
                `UPDATE users SET 
                first_name = ?, 
                last_name = ?, 
                email = ?, 
                phone_number = ?, 
                street_name = ?, 
                region = ?, 
                postal_code = ?, 
                address = ?, 
                role_type = ? 
                WHERE customer_id = ?`,
                [first_name, last_name, email, phone_number, street_name, region, postal_code, address, role_type, customer_id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json({ message: 'User details updated successfully.' });
        } catch (error) {
            console.error('Error updating user details:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });




module.exports = router;