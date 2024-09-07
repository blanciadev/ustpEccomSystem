const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to verify token and extract user_id
async function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from 'Authorization' header

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const [rows] = await db.query('SELECT user_id FROM tokens WHERE token = ? AND expires_at > NOW()', [token]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        req.user_id = rows[0].user_id; // Add user_id to request object
        next();
    } catch (err) {
        console.error('Error during token validation:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}
// Route to add product to cart
router.post('/add-to-cart', authenticateToken, async (req, res) => {
    const { product_id, quantity } = req.body;
    const { user_id } = req; // Extract user_id from request object

    console.log('Received request to add product to cart:');
    console.log('User ID:', user_id);
    console.log('Product ID:', product_id);
    console.log('Quantity:', quantity);

    // Validate inputs
    if (!user_id || !product_id || !quantity) {
        return res.status(400).json({ error: 'User ID, Product ID, and Quantity are required' });
    }

    try {
        // Ensure that the cart exists and get the customer_id
        const [[existingCart]] = await db.query('SELECT cart_id FROM cart WHERE customer_id = ?', [user_id]);

        if (!existingCart) {
            // Create a new cart if it doesn't exist
            await db.query('INSERT INTO cart (customer_id) VALUES (?)', [user_id]);
        }

        // Insert or update the product in cart_items
        const insertQuery = `
            INSERT INTO cart_items (customer_id, product_id, quantity) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
        const queryParams = [user_id, product_id, quantity];

        console.log('Executing query:', insertQuery);
        console.log('Query parameters:', queryParams);

        await db.query(insertQuery, queryParams);

        console.log('Product added to cart successfully!'); // Log success message
        res.status(200).json({ message: 'Product added to cart successfully!' });
    } catch (err) {
        console.error('Error adding product to cart:', err.message); // Log the error
        res.status(500).json({ error: err.message });
    }
});

// Route to get cart item count
router.get('/cart-item-count', authenticateToken, async (req, res) => {
    const { user_id } = req; // Extract user_id from request object

    try {
        // Query to count items in the cart for the user
        const [rows] = await db.query(`
            SELECT COUNT(*) AS itemCount 
            FROM cart_items 
            WHERE customer_id = ?
        `, [user_id]);

        // Respond with the count of items in the cart
        if (rows.length > 0) {
            res.json({ itemCount: rows[0].itemCount });
        } else {
            res.json({ itemCount: 0 });
        }
    } catch (err) {
        console.error('Error fetching cart item count:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
