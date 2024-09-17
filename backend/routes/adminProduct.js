const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/admin-products-with-interaction', async (req, res) => {
    try {
        // Define thresholds for low stock and low interaction
        const LOW_STOCK_THRESHOLD = 10;
        const LOW_INTERACTION_THRESHOLD = 1;

        // Query to get the count of Top Products
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



router.get('/top-products', async (req, res) => {
    try {
        // Define the maximum percentage for the progress bar
        const MAX_PROGRESS = 100;

        // Query to get the products with their available quantity and cart interaction quantity
        const [topProducts] = await db.query(`
            SELECT
                p.product_code AS id, 
                p.product_name AS product, 
                p.quantity AS available_quantity, 
                COALESCE(SUM(od.quantity), 0) AS cart_quantity, 
                p.interaction_cart, 
                p.interaction_orders
            FROM
                product AS p
            LEFT JOIN
                order_details AS od
            ON 
                p.product_code = od.product_id
            GROUP BY
                p.product_code, 
                p.product_name, 
                p.quantity, 
                p.interaction_cart, 
                p.interaction_orders
        `);

        // Send response with top products data
        res.json({
            products: topProducts.map(product => {
                // Calculate the progress based on available quantity and interaction orders
                // If interaction_orders exceeds available_quantity, cap the progress at 100%
                const progress = product.available_quantity > 0
                    ? Math.min((product.interaction_orders / product.available_quantity) * MAX_PROGRESS, MAX_PROGRESS)
                    : 0;

                return {
                    id: product.id,
                    product: product.product,
                    interaction_count: progress, // Percentage used for progress bar
                    available_quantity: product.available_quantity, // Current stock availability
                    cart_quantity: product.cart_quantity, // Quantity added to cart
                    interaction_orders: product.interaction_orders, // Reflect interaction based on orders
                };
            })
        });
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).send('Error fetching top products');
    }
});





module.exports = router;
