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
        WITH MostFrequentCategory AS (
            SELECT
                p.category_id -- Get the most frequent category_id
            FROM
                cart_items AS ci
            JOIN
                product AS p ON ci.product_code = p.product_code
            WHERE
                ci.customer_id = ?
            GROUP BY
                p.category_id
            ORDER BY
                COUNT(p.category_id) DESC
            LIMIT 1 -- Get only the most frequent category
        ),
        DisplayProductsWithThisCategory AS (
            SELECT
                p.product_id,
                p.product_code,
                p.product_name,
                p.description,
                p.brand,
                p.price,
                p.size,
                p.expiration_date,
                c.category_name
            FROM
                product AS p
            JOIN
                category AS c ON p.category_id = c.category_id
            WHERE
                p.category_id = (SELECT category_id FROM MostFrequentCategory)
        )
        SELECT * FROM DisplayProductsWithThisCategory;
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


// Route to get all products (public route without user filtering)
router.get('/products', async (req, res) => {
    try {
        // Select all products
        const [rows] = await db.query(`
            SELECT DISTINCT product_id, product_code, product_name, description, quantity 
            FROM product
        `);
        // Respond with product details
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});

module.exports = router;