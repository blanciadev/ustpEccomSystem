const express = require('express');
const app = express();
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');

// const crypto = require('crypto'); // For generating random tokens

const PORT = process.env.PORT || 5001;


const cartRoutes = require('./routes/cartRoutes');
const customerSignUpRoutes = require('./routes/customerSignUpRoutes');
const customerLoginRoutes = require('./routes/customerLoginRoutes');


app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//routes
app.use('/', cartRoutes);
app.use('/', customerSignUpRoutes);
app.use('/', customerLoginRoutes);


// Token validation 
app.get('/validate-token', async(req, res) => {

    // Extract token from 'Authorization' header
    const token = req.headers.authorization?.split(' ')[1];

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


app.get('/products', async (req, res) => {
    try {

        const [rows] = await db.query('SELECT DISTINCT product_id, product_name, description, quantity FROM product');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
