const express = require('express');
const router = express.Router();
const db = require('../db');

// Customer Signup Route
router.post('/customer-signup', async (req, res) => {
    const { firstName, lastName, email, address, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !email || !address || !phoneNumber || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if the email already exists
        const [existingEmail] = await db.query('SELECT * FROM customer WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Insert the new customer into the database
        const result = await db.query(
            'INSERT INTO customer (first_name, last_name, email, address, phone_number, password) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, address, phoneNumber, password]
        );

        res.status(201).json({ message: 'Customer created successfully' });
    } catch (err) {
        console.error('Error during sign up:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
