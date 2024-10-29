const express = require('express');
const router = express.Router();
const db = require('../db');

const nodemailer = require('nodemailer');
const crypto = require('crypto');

const findUserByEmail = async (email) => {
    const [rows] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
};

const saveResetToken = async (email, token, tokenExpiry) => {
    await db.execute('INSERT INTO PasswordResets (email, token, tokenExpiry) VALUES (?, ?, ?)', [email, token, tokenExpiry]);
};

router.post('/request-reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        console.log('Received reset password request for email:', email);


        const user = await findUserByEmail(email);
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(404).json({ message: 'User not found' });
        }


        const token = crypto.randomInt(100000, 999999).toString();
        console.log('Generated reset token:', token);


        const tokenExpiry = new Date(Date.now() + 3600000);
        console.log('Token expiry set to:', tokenExpiry);


        await saveResetToken(email, token, tokenExpiry);
        console.log(`Reset token saved for user: ${email}`);


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'xzhampp@gmail.com',
                pass: 'xcni sdig vxfv zrxn',
            },
        });

        // Step 6: Send the token to the user's email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Token',
            text: `Your password reset token is: ${token}. It will expire in 1 hour.`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Reset token email sent to: ${email}`);

        res.status(200).json({ message: 'Reset token sent to email' });
    } catch (error) {
        console.error('Error processing reset request: ', error);
        res.status(500).json({ error: 'Failed to process reset request' });
    }
});

// Helper functions
const findResetToken = async (email, token) => {
    const query = 'SELECT * FROM PasswordResets WHERE email = ? AND token = ?';
    const [results] = await db.execute(query, [email, token]);
    return results[0];
};




router.post('/verify-reset-token', async (req, res) => {
    const { email, token } = req.body;

    if (!email || !token) {
        return res.status(400).json({ message: 'Missing email or token' });
    }

    try {
        const resetRecord = await findResetToken(email, token);

        if (!resetRecord) {
            return res.status(400).json({ message: 'Invalid token or email' });
        }

        const currentTime = Date.now();
        if (currentTime > new Date(resetRecord.tokenExpiry).getTime()) {
            return res.status(400).json({ message: 'Token has expired' });
        }

        // Verification successful
        res.status(200).json({ success: true, message: 'Token verified successfully' });
    } catch (error) {
        console.error('Error verifying reset token: ', error);
        res.status(500).json({ error: 'Failed to verify token' });
    }
});

// password update route
router.post('/password-reset', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length === 0) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        await db.query('UPDATE users SET password = ? WHERE email = ?', [password, email]);

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error updating password:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
