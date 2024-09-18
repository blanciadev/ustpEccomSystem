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


// Route to get top products from different categories
router.get('/products-top-mix-picks', async (req, res) => {
    try {
        // Fetch top products from different categories
        const [rows] = await db.query(`
        SELECT product_id, product_code, product_name, price, description, quantity, interaction_orders, category_name
FROM (
    SELECT p.product_id, p.product_code, p.product_name, p.price, p.description, p.quantity, p.interaction_orders, c.category_name,
           @ranking := IF(@category = p.category_id, @ranking + 1, 1) AS ranking,
           @category := p.category_id
    FROM product p
    JOIN category c ON p.category_id = c.category_id
    CROSS JOIN (SELECT @ranking := 0, @category := 0) AS vars
    ORDER BY p.category_id, p.interaction_orders DESC
) AS ranked_products
WHERE ranking = 1;

        `);

        // Respond with top picked products by category
        res.json(rows);
    } catch (error) {
        console.error('Error fetching top user picks by category:', error);
        res.status(500).send('Error fetching top user picks by category');
    }
});


// router.get('/recommend-products/:customerId', async (req, res) => {
//     const customerId = req.params.customerId;
//     console.log('Customer ID:', customerId);

//     try {
//         // Fetch products interacted with by the current customer
//         const [customerProducts] = await db.query(`
//             SELECT product_code
//             FROM user_product_interactions
//             WHERE customer_id = ?
//             GROUP BY product_code;
//         `, [customerId]);

//         const productCodes = customerProducts.map(row => row.product_code);

//         if (productCodes.length === 0) {
//             return res.json([]); // No products interacted with, return empty array
//         }

//         // Fetch other customers who interacted with the same products
//         const [similarCustomers] = await db.query(`
//             SELECT DISTINCT customer_id
//             FROM user_product_interactions
//             WHERE product_code IN (?)
//               AND customer_id != ?;
//         `, [productCodes, customerId]);

//         const similarCustomerIds = similarCustomers.map(row => row.customer_id);

//         if (similarCustomerIds.length === 0) {
//             return res.json([]); // No similar customers, return empty array
//         }

//         // Fetch detailed information about products interacted with by similar customers
//         const [recommendedProducts] = await db.query(`
//             SELECT DISTINCT p.product_code, p.product_name, p.price, p.description, p.quantity
//             FROM user_product_interactions i
//             JOIN product p ON i.product_code = p.product_code
//             WHERE i.customer_id IN (?)
//               AND i.product_code NOT IN (?)
//             GROUP BY p.product_code;
//         `, [similarCustomerIds, productCodes]);

//         res.json(recommendedProducts);
//     } catch (error) {
//         console.error('Error recommending products:', error);
//         res.status(500).send('Error recommending products');
//     }
// });


// router.get('/recommend-products/:customerId', async (req, res) => {
//     const customerId = req.params.customerId;
//     console.log('Customer ID:', customerId);

//     try {
//         // Fetch products interacted with by the current customer
//         const [customerProducts] = await db.query(`
//             SELECT product_code
//             FROM user_product_interactions
//             WHERE customer_id = ?
//             GROUP BY product_code;
//         `, [customerId]);

//         const productCodes = customerProducts.map(row => row.product_code);

//         // Fetch popular products interacted with by all users excluding the current customer's products
//         const [popularProducts] = await db.query(`
//             SELECT p.product_code, p.product_name, p.price, p.description, p.quantity, COUNT(i.product_code) AS interaction_count
//             FROM user_product_interactions i
//             JOIN product p ON i.product_code = p.product_code
//             WHERE i.product_code NOT IN (?)
//               AND p.quantity != 0
//             GROUP BY p.product_code, p.product_name, p.price, p.description, p.quantity
//             ORDER BY interaction_count DESC;
//         `, [productCodes]);


//         res.json(popularProducts);
//     } catch (error) {
//         console.error('Error recommending products:', error);
//         res.status(500).send('Error recommending products');
//     }
// });


router.get('/recommend-products', async (req, res) => {
    try {
        // Fetch the top 4 cart interactions per product code
        const [rankedInteractions] = await db.query(`
            WITH RankedInteractions AS (
    SELECT
        p.product_code,
        p.product_name,
        p.price,
        p.quantity,
        ui.interaction_count,
        ui.interaction_type,
        ROW_NUMBER() OVER (
            PARTITION BY p.product_code
            ORDER BY ui.interaction_count DESC
        ) AS rn
    FROM
        user_product_interactions ui
    INNER JOIN
        product p ON ui.product_code = p.product_code
    WHERE
        ui.interaction_type = 'cart'
)
SELECT
    product_code,
    product_name,
    quantity,
    price,
    interaction_count,
    interaction_type
FROM
    RankedInteractions
WHERE
    rn <= 4
ORDER BY
    interaction_count DESC
LIMIT 4;

        `);

        res.json(rankedInteractions);
    } catch (error) {
        console.error('Error recommending products:', error);
        res.status(500).send('Error recommending products');
    }
});


module.exports = router;
