const express = require('express');
const app = express();
const db = require('./db');  
const bodyParser = require('body-parser'); 
const cors = require('cors');
const crypto = require('crypto'); // For generating random tokens

// Ensure you have a secret key in your environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';

const PORT = process.env.PORT || 5000;

app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// token validation 
app.get('/validate-token', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from 'Authorization' header

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const [rows] = await db.query('SELECT u.username FROM tokens t JOIN user u ON t.user_id = u.user_id WHERE t.token = ? AND t.expires_at > NOW()', [token]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const user = rows[0];
        res.json({ username: user.username });
    } catch (err) {
        console.error('Error during token validation:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log('Received login request');
    console.log('Username:', username);
    console.log('Password:', password);

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
        console.log('Database query result:', rows); // Log the query result

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = rows[0];
        console.log('debug', user);

        // Direct password comparison (simplified for demonstration)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate a random token
        const token = crypto.randomBytes(64).toString('hex');

        // Store the token in the database
        await db.query('INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [
            user.user_id,
            token,
            new Date(Date.now() + 3600000) // Set expiration date 1 hour from now
        ]);

        // Respond with success message and token
        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Error during login:', err.message); // Log only the message
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Signup Route 
app.post('/admin-signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
        // Check if the username already exists
        const [existingUser] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Check if the email already exists
        const [existingEmail] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Insert the new user into the database
        const result = await db.query(
            'INSERT INTO user (username, email, password, user_type) VALUES (?, ?, ?, ?)',
            [username, email, password, 'admin']
        );

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error('Error during sign up:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
