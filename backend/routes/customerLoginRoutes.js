const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');


const bcryptjs = require('bcryptjsjs');
const saltRounds = 10;



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

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const [existingTokenRows] = await db.query(
            'SELECT * FROM tokens WHERE user_id = ? AND token_status = ?',
            [user.customer_id, 'Active']
        );

        if (existingTokenRows.length > 0) {
            const existingToken = existingTokenRows[0];

            const now = new Date();
            if (new Date(existingToken.expires_at) > now) {
                return res.status(400).json({ message: 'User already logged in' });
            } else {
                await db.query('DELETE FROM tokens WHERE token = ?', [existingToken.token]);
                console.log('Expired token deleted:', existingToken.token);
            }
        }

        const token = crypto.randomBytes(64).toString('hex');

        await db.query(
            'INSERT INTO tokens (user_id, token, token_status, expires_at) VALUES (?, ?, ?, ?)',
            [
                user.customer_id,
                token,
                'Active',
                new Date(Date.now() + TOKEN_EXPIRATION_TIME)
            ]
        );

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



router.route('/users-details')
    .post(async (req, res) => {
        const { customer_id } = req.body;

        if (!customer_id) {
            console.log('Error: Customer ID is required.');
            return res.status(400).json({ message: 'Customer ID is required.' });
        }

        try {
            console.log(`Fetching user details for customer_id: ${customer_id}`);
            const [userDetails] = await db.query('SELECT * FROM users WHERE customer_id = ?', [customer_id]);

            if (userDetails.length === 0) {
                console.log(`User not found for customer_id: ${customer_id}`);
                return res.status(404).json({ message: 'User not found.' });
            }

            console.log(`User details found:`, userDetails[0]);
            res.status(200).json(userDetails[0]);
        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({ message: 'Server error' });
        }
    })

    .put(async (req, res) => {
        const { customer_id, first_name, last_name, email, phone_number, street_name, region, postal_code, address, role_type } = req.body;

        if (!customer_id) {
            console.log('Error: Customer ID is required.');
            return res.status(400).json({ message: 'Customer ID is required.' });
        }

        try {
            console.log(`Fetching current details for user with customer_id: ${customer_id}`);
            const [userDetails] = await db.query('SELECT * FROM users WHERE customer_id = ?', [customer_id]);

            if (userDetails.length === 0) {
                console.log(`User not found for customer_id: ${customer_id}`);
                return res.status(404).json({ message: 'User not found.' });
            }

            console.log('Updating user details (excluding password).');
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
                [
                    first_name,
                    last_name,
                    email,
                    phone_number,
                    street_name,
                    region,
                    postal_code,
                    address,
                    role_type,
                    customer_id
                ]
            );

            if (result.affectedRows === 0) {
                console.log(`No user found to update for customer_id: ${customer_id}`);
                return res.status(404).json({ message: 'User not found.' });
            }

            console.log('User details updated successfully.');
            res.status(200).json({ message: 'User details updated successfully.' });
        } catch (error) {
            console.error('Error updating user details:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });




router.route('/update-password')
    .put(async (req, res) => {
        const { customer_id, current_password, new_password } = req.body;

        if (!customer_id || !current_password || !new_password) {
            console.log('Error: Missing required fields.');
            return res.status(400).json({ message: 'Customer ID, current password, and new password are required.' });
        }

        try {
            console.log(`Fetching user for password update with customer_id: ${customer_id}`);
            const [userDetails] = await db.query('SELECT * FROM users WHERE customer_id = ?', [customer_id]);

            if (userDetails.length === 0) {
                console.log(`User not found for customer_id: ${customer_id}`);
                return res.status(404).json({ message: 'User not found.' });
            }

            const currentStoredPassword = userDetails[0].password;

            const isHashed = currentStoredPassword.startsWith('$2') && currentStoredPassword.length === 60;

            let passwordMatch = false;

            if (isHashed) {
                console.log('Verifying hashed current password.');
                passwordMatch = await bcryptjs.compare(current_password, currentStoredPassword);
            } else {
                console.log('Verifying plaintext current password.');
                passwordMatch = current_password === currentStoredPassword;

                if (passwordMatch) {
                    console.log('Upgrading plaintext password to hashed.');
                    const hashedPassword = await bcryptjs.hash(current_password, saltRounds);
                    await db.query('UPDATE users SET password = ? WHERE customer_id = ?', [hashedPassword, customer_id]);
                }
            }

            if (!passwordMatch) {
                console.log('Error: Current password is incorrect.');
                return res.status(400).json({ message: 'Current password is incorrect.' });
            }

            if (current_password === new_password) {
                console.log('Error: New password cannot be the same as the current password.');
                return res.status(400).json({ message: 'New password cannot be the same as the current password.' });
            }

            console.log('Hashing new password.');
            const hashedNewPassword = await bcryptjs.hash(new_password, saltRounds);

            console.log('Updating password in the database.');
            const result = await db.query(
                'UPDATE users SET password = ? WHERE customer_id = ?',
                [hashedNewPassword, customer_id]
            );

            if (result.affectedRows === 0) {
                console.log('Error: Password update failed.');
                return res.status(500).json({ message: 'Failed to update password.' });
            }

            console.log('Password updated successfully.');
            res.status(200).json({ message: 'Password updated successfully.' });
        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });




module.exports = router;