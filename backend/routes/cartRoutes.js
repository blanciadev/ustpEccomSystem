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

    // Extract user_id from request object (set in the `authenticateToken` middleware)
    const { user_id } = req;

    console.log('--- New request to add product to cart ---');
    console.log(`User ID: ${user_id}`);
    console.log(`Product Code: ${product_code}`);
    console.log(`Quantity: ${quantity}`);

    // Validate inputs
    if (!user_id) {
        console.error('Validation failed: Missing user_id.');
        return res.status(400).json({ error: 'User ID is required' });
    }
    if (!product_code) {
        console.error('Validation failed: Missing product_code.');
        return res.status(400).json({ error: 'Product Code is required' });
    }
    if (!quantity || quantity <= 0) {
        console.error('Validation failed: Invalid quantity.');
        return res.status(400).json({ error: 'A valid Quantity greater than 0 is required' });
    }

    try {
        // Check if the product exists in the system
        const [[product]] = await db.query('SELECT product_id FROM product WHERE product_code = ?', [product_code]);
        if (!product) {
            console.error(`Product not found for product_code: ${product_code}`);
            return res.status(404).json({ error: 'Product not found' });
        }

        // Ensure that the cart exists for the user and retrieve the cart_id
        const [[existingCart]] = await db.query('SELECT cart_id FROM cart WHERE customer_id = ?', [user_id]);

        let cart_id;
        if (!existingCart) {
            // Create a new cart if it doesn't exist
            console.log(`No existing cart found for user ${user_id}. Creating a new cart.`);
            const [result] = await db.query('INSERT INTO cart (customer_id) VALUES (?)', [user_id]);
            cart_id = result.insertId; // Get the newly created cart_id
            console.log(`New cart created with ID: ${cart_id}`);
        } else {
            cart_id = existingCart.cart_id; // Use existing cart_id
            console.log(`Using existing cart with ID: ${cart_id}`);
        }

        // Insert or update the product in the cart_items
        const insertOrUpdateQuery = `
            INSERT INTO cart_items (cart_id, customer_id, product_code, quantity, status) 
            VALUES (?, ?, ?, ?, 'Order Pending')
            ON DUPLICATE KEY UPDATE 
                quantity = quantity + VALUES(quantity)
        `;
        const queryParams = [cart_id, user_id, product_code, quantity];

        console.log('Executing query to add/update cart items:', insertOrUpdateQuery);
        console.log('Query parameters:', queryParams);

        // Execute the query
        await db.query(insertOrUpdateQuery, queryParams);
        console.log(`Successfully added/updated product ${product_code} in cart.`);

        // Log user interaction in user_product_interactions
        const interactionQuery = `
            INSERT INTO user_product_interactions (customer_id, product_code, interaction_type)
            VALUES (?, ?, 'cart')
            ON DUPLICATE KEY UPDATE interaction_type = 'cart'
        `;
        const interactionParams = [user_id, product_code];

        console.log('Logging user interaction as "cart":', interactionQuery);
        console.log('Interaction query parameters:', interactionParams);

        // Execute the interaction query
        await db.query(interactionQuery, interactionParams);
        console.log('User interaction logged as "cart".');

        // Success response
        res.status(200).json({ message: 'Product added to cart and interaction logged successfully!' });
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
                product_name: item.product_name,
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


router.get('/cart-item-count/:customer_id', async (req, res) => {
    const customerId = req.params.customer_id;

    try {
        const [rows] = await db.query('SELECT COUNT(*) AS itemCount FROM cart WHERE customer_id = ?', [customerId]);
        res.json({ itemCount: rows[0].itemCount });
    } catch (error) {
        console.error('Error fetching cart item count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/checkout-details', async (req, res) => {
    const { selectedProducts, customerId } = req.body; // Extract customerId from the request body

    // Validate the selected products and customerId
    if (!selectedProducts || selectedProducts.length === 0) {
        return res.status(400).json({ message: 'No products selected.' });
    }

    if (!customerId) {
        return res.status(400).json({ message: 'Customer ID is required.' });
    }

    try {
        // Construct a parameterized query for the selected products
        const placeholders = selectedProducts.map(() => '?').join(','); // Create a list of placeholders (e.g., ?, ?, ?)
        const query = `
            SELECT
                p.product_id,
                p.product_code,
                p.product_name,
                p.description,
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
                ci.customer_id = ? AND p.product_code IN (${placeholders})
        `;

        // Query the database using the customer ID and selected product codes
        const [rows] = await db.query(query, [customerId, ...selectedProducts]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'No matching products found in your cart.' });
        }

        // Return the fetched product details
        res.status(200).json({ items: rows });
    } catch (err) {
        console.error('Error fetching product details:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});





module.exports = router;


