const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/admin-products-with-interaction', async (req, res) => {
    try {
        // Define thresholds for low stock and low interaction
        const LOW_STOCK_THRESHOLD = 10;
        const LOW_INTERACTION_THRESHOLD = 1;

        // Query to get the count of Top Products with interactions of type 'cart'
        const [[{ total }]] = await db.query(`
            SELECT COUNT(DISTINCT p.product_code) AS total
            FROM product AS p
            INNER JOIN user_product_interactions AS upi
            ON p.product_code = upi.product_code
            WHERE upi.interaction_type = 'cart'
            AND upi.interaction_timestamp >= NOW() - INTERVAL 30 DAY
        `);

        // Query to get product names with interaction_type 'cart'
        const [products] = await db.query(`
            SELECT DISTINCT p.product_name
            FROM product AS p
            INNER JOIN user_product_interactions AS upi
            ON p.product_code = upi.product_code
            WHERE upi.interaction_type = 'cart'
            AND upi.interaction_timestamp >= NOW() - INTERVAL 30 DAY
        `);

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

        // Query to get the count of unpopular items (interaction_type = 'view' or no interactions)
        const [unpopularProducts] = await db.query(`
            SELECT p.product_name
            FROM product AS p
            LEFT JOIN user_product_interactions AS upi
            ON p.product_code = upi.product_code
            WHERE upi.interaction_type IS NULL 
            OR upi.interaction_type = 'view'
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

        // Query to get the products with their available quantity and total cart interaction quantity
        const [topProducts] = await db.query(`
            SELECT
                p.product_code AS id, 
                p.product_name AS product, 
                p.quantity AS available_quantity, 
                COALESCE(SUM(od.quantity), 0) AS cart_quantity,
                p.product_image
            FROM
                product AS p
            LEFT JOIN
                order_details AS od ON p.product_code = od.product_id
            LEFT JOIN
                user_product_interactions AS upi ON p.product_code = upi.product_code AND upi.interaction_type = 'Cart' 
            GROUP BY
                p.product_code, 
                p.product_name, 
                p.quantity, 
                p.product_image
            ORDER BY
                cart_quantity DESC
            LIMIT 4;
        `);

        // Send response with top products data
        res.json({
            products: topProducts.map(product => {
                // Calculate the progress based on cart quantity and available quantity
                const progress = product.available_quantity > 0
                    ? Math.min((product.cart_quantity / product.available_quantity) * MAX_PROGRESS, MAX_PROGRESS)
                    : 0;

                return {
                    id: product.id,
                    product: product.product,
                    interaction_count: progress, 
                    available_quantity: product.available_quantity, 
                    cart_quantity: product.cart_quantity, 
                    product_image: product.product_image 
                };
            })
        });
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).send('Error fetching top products');
    }
});



// Route to retrieve all shipments
router.get('/shipments', async (req, res) => {
    console.log('Received request to fetch all shipments.');

    try {
        // Execute the query to fetch all shipments
        const [shipments] = await db.query('SELECT * FROM shipment');

        if (shipments.length === 0) {
            console.log('No shipments found.');
            return res.status(404).json({ error: 'No shipments found' });
        }

        console.log('Retrieved shipments:', shipments);
        res.status(200).json({ shipments });
    } catch (error) {
        console.error('Error retrieving shipments:', error.message);
        res.status(500).json({ error: 'Failed to retrieve shipments. Please try again.' });
    }
});



module.exports = router;
