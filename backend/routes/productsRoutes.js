const express = require('express');
const router = express.Router();
const db = require('../db');

// Route to get products based on the most frequent category for the user
router.get('/product-user', async (req, res) => {
    try {
        const customerId = req.query.customerId; // Retrieve customer ID from query parameters

        if (!customerId) {
            return res.status(400).send('customerId is required');
        }

        // Query to get products based on the most frequent category for the customer
        let query = `
        SELECT
    p.product_id,
    p.product_code,
    p.product_name,
    p.description,

    p.price,
    p.size,
    p.expiration_date,
    c.category_name
FROM
    product AS p
JOIN
    category AS c ON p.category_id = c.category_id
WHERE
    p.category_id = (
        SELECT
            p2.category_id
        FROM
            cart_items AS ci
        JOIN
            product AS p2 ON ci.product_code = p2.product_code
        WHERE
            ci.customer_id = ?
        GROUP BY
            p2.category_id
        ORDER BY
            COUNT(p2.category_id) DESC
        LIMIT 1
    );
`;

        // Execute the query, passing the customerId as a parameter
        const [rows] = await db.query(query, [customerId]);

        // Respond with product recommendations
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products based on the most frequent category:', error);
        res.status(500).send('Error fetching products');
    }
});

// Route to update product interaction count
router.get('/products-interaction', async (req, res) => {
    const { product_code } = req.query; // Get product_code from the query params
    if (!product_code) {
        return res.status(400).json({ error: 'Product code is required' });
    }

    try {
        // Increment interaction count for the clicked product
        await db.query(`
            UPDATE product
            SET interaction_count = interaction_count + 1
            WHERE product_code = ?
        `, [product_code]);

        // Respond with a success message
        res.json({ success: true, message: 'Product interaction updated' });
    } catch (error) {
        console.error('Error updating product interaction:', error);
        res.status(500).json({ error: 'Error updating product interaction' });
    }
});

// Route to get top 4 user-picked products
router.get('/products-top-picks', async (req, res) => {
    try {
        // Fetch the top 4 products based on the highest interaction count
        const [rows] = await db.query(`
            SELECT product_id, product_code, product_name, price, description, quantity, interaction_count
            FROM product
            ORDER BY interaction_count DESC
            LIMIT 4
        `);

        // Respond with top picked products
        res.json(rows);
    } catch (error) {
        console.error('Error fetching top user picks:', error);
        res.status(500).send('Error fetching top user picks');
    }
});





router.get('/products', async (req, res) => {
    try {
        // Fetch all products and their categories
        const [rows] = await db.query(`
            SELECT p.product_id, p.product_code, p.product_name, p.price ,p.description, p.quantity, c.category_name
            FROM product p
            INNER JOIN category c ON p.category_id = c.category_id
        `);

        // Respond with product details including categories
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});


module.exports = router;
