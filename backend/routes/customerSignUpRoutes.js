const express = require('express');
const router = express.Router();
const db = require('../db');

// users Signup Route
router.post('/users-signup', async (req, res) => {
    const { firstName, lastName, email, address, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !email || !address || !phoneNumber || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }


        const result = await db.query(
            'INSERT INTO users (first_name, last_name, email, address, phone_number, password) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, address, phoneNumber, password]
        );

        res.status(201).json({ message: 'users created successfully' });
    } catch (err) {
        console.error('Token Validation Backedn signup Error during sign up:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// admin Signup Route
router.post('/admin-signup', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password, userType } = req.body;
    console.log('Incoming request body:', req.body);

    let missingFields = [];

    // Check for each required field
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');
    if (!email) missingFields.push('email');
    if (!phoneNumber) missingFields.push('phoneNumber');
    if (!password) missingFields.push('password');
    if (!userType) missingFields.push('userType');

    if (missingFields.length > 0) {
        console.log('Missing required fields:', missingFields);
        return res.status(400).json({ message: 'Missing required fields', fields: missingFields });
    }


    try {
        console.log('Checking if email already exists:', email);
        const [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('Existing email query result:', existingEmail);

        if (existingEmail.length > 0) {
            console.log('Email already exists:', email);
            return res.status(400).json({ message: 'Email already exists' });
        }

        console.log('Inserting new user into the database:', {
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
            userType
        });

        const result = await db.query(
            'INSERT INTO users (first_name, last_name, email, phone_number, password, role_type) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, phoneNumber, password, userType]
        );

        console.log('Insert result:', result);
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error('Error during user signup:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;


