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

    console.log('--- New request to add product to cart ---');
    console.log(`User ID: ${user_id}`);
    console.log(`Product Code: ${product_code}`);
    console.log(`Quantity: ${quantity}`);

    // Validate inputs
    if (!user_id || !product_code || !quantity) {
        console.error('Validation failed: Missing user_id, product_code, or quantity.');
        return res.status(400).json({ error: 'User ID, Product Code, and Quantity are required' });
    }

    try {
        // Ensure that the cart exists for the user
        const [[existingCart]] = await db.query('SELECT cart_id FROM cart WHERE customer_id = ?', [user_id]);
        console.log('Existing cart found:', existingCart);

        if (!existingCart) {
            // Create a new cart if it doesn't exist
            console.log('No existing cart found, creating a new one for user:', user_id);
            await db.query('INSERT INTO cart (customer_id) VALUES (?)', [user_id]);
        } else {
            console.log('Cart already exists for user:', user_id);
        }

        // Insert or update the product in the cart_items
        const insertOrUpdateQuery = `
            INSERT INTO cart_items (customer_id, product_code, quantity, status) 
            VALUES (?, ?, ?, 'Order Pending')
            ON DUPLICATE KEY UPDATE 
                quantity = quantity + VALUES(quantity)
        `;
        const queryParams = [user_id, product_code, quantity];

        console.log('Executing query to add/update cart items:', insertOrUpdateQuery);
        console.log('Query parameters:', queryParams);

        // Execute the query
        await db.query(insertOrUpdateQuery, queryParams);
        console.log(`Successfully added/updated product ${product_code} in cart.`);

        // Update the product's interaction_cart in the product table
        const updateInteractionQuery = `
            UPDATE product
            SET interaction_cart = interaction_cart + 1
            WHERE product_code = ?
        `;
        const interactionParams = [product_code];

        console.log('Executing query to update interaction_cart for product:', product_code);
        console.log('Query parameters:', interactionParams);

        // Execute the interaction_cart increment query
        await db.query(updateInteractionQuery, interactionParams);
        console.log(`Successfully incremented interaction_cart for product ${product_code}.`);

        // Success response
        res.status(200).json({ message: 'Product added to cart and interaction count updated successfully!' });
        console.log('--- Request successfully completed ---');
    } catch (err) {
        // Log the error
        console.error('Error during add-to-cart process:', err.message);
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


router.get('/cart', authenticateToken, async (req, res) => {
    const { user_id } = req;

    try {
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

        if (!rows || rows.length === 0) {
            return res.status(200).json({ items: [], totalPrice: 0 });
        }

        const totalPrice = rows.reduce((total, item) => total + item.price * item.quantity, 0);

        res.status(200).json({
            items: rows.map(item => ({
                product_id: item.product_id,
                product_code: item.product_code,
                product_name: item.product_name, // Product name included
                description: item.description,
                brand: item.brand,
                category: item.category_name,
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


