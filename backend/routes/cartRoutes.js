const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to verify token and extract user_id
async function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const [rows] = await db.query('SELECT user_id FROM tokens WHERE token = ? AND expires_at > NOW()', [token]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        req.user_id = rows[0].user_id;
        next();
    } catch (err) {
        console.error('Error during token validation:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}
// Route to add product to cart
router.post('/add-to-cart', authenticateToken, async (req, res) => {
    const { product_code, quantity } = req.body;

    // Extract user_id from request object
    const { user_id } = req;

    console.log('Received request to add product to cart:');
    console.log('User ID:', user_id);
    console.log('Product Code:', product_code); // Correctly log product_code
    console.log('Quantity:', quantity);

    // Validate inputs
    if (!user_id || !product_code || !quantity) {
        return res.status(400).json({ error: 'User ID, Product Code, and Quantity are required' });
    }

    try {
        // Ensure that the cart exists for the user
        const [[existingCart]] = await db.query('SELECT cart_id FROM cart WHERE customer_id = ?', [user_id]);

        if (!existingCart) {
            // Create a new cart if it doesn't exist
            await db.query('INSERT INTO cart (customer_id) VALUES (?)', [user_id]);
        }

        // Insert the product into cart_items or update the quantity if it already exists
        const insertOrUpdateQuery = `
            INSERT INTO cart_items (customer_id, product_code, quantity, status) 
            VALUES (?, ?, ?, 'Order Pending')
            ON DUPLICATE KEY UPDATE 
                quantity = quantity + VALUES(quantity)  -- Increment the quantity of the existing product
        `;
        const queryParams = [user_id, product_code, quantity];

        console.log('Executing query:', insertOrUpdateQuery);
        console.log('Query parameters:', queryParams);

        // Execute the query
        await db.query(insertOrUpdateQuery, queryParams);

        // Log success message
        console.log('Product added to cart successfully!');
        res.status(200).json({ message: 'Product added to cart successfully!' });
    } catch (err) {
        // Log the error
        console.error('Error adding product to cart:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Route to get cart item count
router.get('/cart-item-count', authenticateToken, async (req, res) => {
    const { user_id } = req;
    try {
        // Query to count items in the cart for the user
        const [rows] = await db.query(`
            SELECT SUM(quantity) AS itemCount
            FROM cart_items 
            WHERE customer_id = ? AND status = 'Order Pending'
        `, [user_id]);

        // Check if query result is valid and has rows
        const itemCount = rows && rows[0] && rows[0].itemCount ? rows[0].itemCount : 0;

        // Respond with the count of items in the cart
        res.status(200).json({ itemCount });
    } catch (err) {
        console.error('Error fetching cart item count:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Route to get cart items with product details
router.get('/cart', authenticateToken, async (req, res) => {
    const { user_id } = req;

    try {
        // Query to get cart items with product details
        const [rows] = await db.query(`
            SELECT
                p.product_id,
                p.product_code,
                p.product_name,
                p.description,
                p.brand,
                p.price,
                p.size,
                p.expiration_date,
                c.category_name,
                ci.quantity
            FROM
                cart_items AS ci
            JOIN
                product AS p ON ci.product_code = p.product_code
            JOIN
                category AS c ON p.category_id = c.category_id
            WHERE
                ci.customer_id = ? AND ci.status = 'Order Pending'
        `, [user_id]);

        // If there are no cart items
        if (!rows || rows.length === 0) {
            return res.status(200).json({ items: [], totalPrice: 0 });
        }

        // Calculate total price
        const totalPrice = rows.reduce((total, item) => total + item.price * item.quantity, 0);

        // Return the cart items and the total price
        res.status(200).json({
            items: rows.map(item => ({
                product_id: item.product_id,
                product_code: item.product_code,
                product_name: item.product_name,
                description: item.description,
                brand: item.brand,
                category: item.category_name, // Updated to use the category_name
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                expiration_date: item.expiration_date,
                sub_total: item.price * item.quantity
            })),
            totalPrice
        });
    } catch (err) {
        console.error('Error fetching cart items:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;


