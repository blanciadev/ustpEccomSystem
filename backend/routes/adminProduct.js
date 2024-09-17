const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/admin-products-with-interaction', async (req, res) => {
    try {
        // Define thresholds for low stock and low interaction
        const LOW_STOCK_THRESHOLD = 10;
        const LOW_INTERACTION_THRESHOLD = 1;

        // Query to get the count of products with interaction_cart >= 1
        const [[{ total }]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM product
            WHERE interaction_cart >= ?
        `, [LOW_INTERACTION_THRESHOLD]);

        // Query to get product names with interaction_cart >= 1
        const [products] = await db.query(`
            SELECT product_name
            FROM product
            WHERE interaction_cart >= ?
        `, [LOW_INTERACTION_THRESHOLD]);

        // Query to get the total quantity of products
        const [[{ totalQuantity }]] = await db.query(`
            SELECT SUM(quantity) AS totalQuantity
            FROM product
        `);

        // Query to get the count of low stock items
        const [[{ lowStockCount }]] = await db.query(`
            SELECT COUNT(*) AS lowStockCount
            FROM product
            WHERE quantity <= ?
        `, [LOW_STOCK_THRESHOLD]);

        // Query to get the total quantity of low stock items
        const [[{ lowStockQuantity }]] = await db.query(`
            SELECT SUM(quantity) AS lowStockQuantity
            FROM product
            WHERE quantity <= ?
        `, [LOW_STOCK_THRESHOLD]);

        // Query to get the count of unpopular items (interaction_cart <= 0)
        const [unpopularProducts] = await db.query(`
            SELECT product_name
            FROM product
            WHERE interaction_cart <= 0
        `);

        // Query to get the count and total quantity of out-of-stock items
        const [[{ outOfStockCount }]] = await db.query(`
            SELECT COUNT(*) AS outOfStockCount
            FROM product
            WHERE quantity = 0
        `);

        const [[{ outOfStockQuantity }]] = await db.query(`
            SELECT SUM(quantity) AS outOfStockQuantity
            FROM product
            WHERE quantity = 0
        `);

        // Query to get the count and total quantity of discontinued products
        const [[{ discontinuedCount }]] = await db.query(`
            SELECT COUNT(*) AS discontinuedCount
            FROM product
            WHERE product_status = 'discontinued'
        `);

        const [[{ discontinuedQuantity }]] = await db.query(`
            SELECT SUM(quantity) AS discontinuedQuantity
            FROM product
            WHERE product_status = 'discontinued'
        `);

        // Send response with all the gathered data
        res.json({
            total,
            totalQuantity,
            products: products.map(product => product.product_name),
            lowStockCount,
            lowStockQuantity,
            unpopularProducts: unpopularProducts.map(product => product.product_name),
            outOfStockCount,
            outOfStockQuantity,
            discontinuedCount,
            discontinuedQuantity
        });
    } catch (error) {
        console.error('Error fetching products data:', error);
        res.status(500).send('Error fetching products');
    }
});

module.exports = router;
