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

router.get('/products', async (req, res) => {
    try {
        // Fetch all products and their categories
        const [rows] = await db.query(`
            SELECT p.product_id, p.product_code, p.product_name, p.price ,p.description, p.quantity, c.category_name, p.product_image
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

// Add this new route to your router
router.get('/products/:productCode', async (req, res) => {
    const { productCode } = req.params; // Get the product code from the request parameters

    try {
        // Query to fetch the product based on the product code
        const [rows] = await db.query(`
            SELECT p.product_id, p.product_code, p.product_name, p.price, p.description, p.quantity, c.category_name, p.product_image
            FROM product p
            INNER JOIN category c ON p.category_id = c.category_id
            WHERE p.product_code = ?
        `, [productCode]);

        // Check if product exists
        if (rows.length === 0) {
            return res.status(404).send('Product not found');
        }

        // Respond with the product details
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send('Error fetching product');
    }
});



// Route to get top products from different categories
router.get('/products-top-mix-picks', async (req, res) => {
    try {
        // Fetch top products from different categories
        const [rows] = await db.query(`
       SELECT
	p.product_id, 
	p.product_code, 
	p.product_name, 
	p.price, 
	p.description, 
	p.quantity, 
	c.category_name, 
	COUNT(DISTINCT user_product_interactions.product_code) AS interaction_count, 
	p.product_image
FROM
	product AS p
	JOIN
	category AS c
	ON 
		p.category_id = c.category_id
	JOIN
	user_product_interactions
	ON 
		p.product_code = user_product_interactions.product_code
WHERE
	user_product_interactions.interaction_type = 'Order'
GROUP BY
	p.product_id, 
	p.product_code, 
	p.product_name, 
	p.price, 
	p.description, 
	p.quantity, 
	c.category_name
ORDER BY
	interaction_count DESC;


        `);

        // Respond with top picked products by category
        res.json(rows);
    } catch (error) {
        console.error('Error fetching top user picks by category:', error);
        res.status(500).send('Error fetching top user picks by category');
    }
});



// Route to get top 4 user-picked products for interaction view
router.get('/products-top-picks', async (req, res) => {
    try {
        // Fetch the top 4 products based on the highest interaction count
        const [rows] = await db.query(`
         SELECT
	p.product_id, 
	p.product_code, 
	p.product_name, 
	p.price, 
	p.description, 
	p.quantity, 
	c.category_name, 
	COUNT(DISTINCT user_product_interactions.product_code) AS interaction_count, 
	p.product_image
FROM
	product AS p
	JOIN
	category AS c
	ON 
		p.category_id = c.category_id
	JOIN
	user_product_interactions
	ON 
		p.product_code = user_product_interactions.product_code
WHERE
	user_product_interactions.interaction_type = 'view'
GROUP BY
	p.product_id, 
	p.product_code, 
	p.product_name, 
	p.price, 
	p.description, 
	p.quantity, 
	c.category_name
ORDER BY
	interaction_count DESC
LIMIT 4;`);

        // Respond with top picked products
        res.json(rows);
    } catch (error) {
        console.error('Error fetching top user picks:', error);
        res.status(500).send('Error fetching top user picks');
    }
});

// for cart recommended
router.get('/recommend-products', async (req, res) => {
    try {
        // Fetch the top 4 cart interactions per product code
        const [rankedInteractions] = await db.query(`
           SELECT
	p.product_id, 
	p.product_code, 
	p.product_name, 
	p.price, 
	p.description, 
	p.quantity, 
	c.category_name, 
	COUNT(DISTINCT user_product_interactions.product_code) AS interaction_count, 
	p.product_image
FROM
	product AS p
	JOIN
	category AS c
	ON 
		p.category_id = c.category_id
	JOIN
	user_product_interactions
	ON 
		p.product_code = user_product_interactions.product_code
WHERE
	user_product_interactions.interaction_type = 'order'
GROUP BY
	p.product_id, 
	p.product_code, 
	p.product_name, 
	p.price, 
	p.description, 
	p.quantity, 
	c.category_name
ORDER BY
	interaction_count DESC
    ;
        `);

        res.json(rankedInteractions);
    } catch (error) {
        console.error('Error recommending products:', error);
        res.status(500).send('Error recommending products');
    }
});


router.post('/products-recommendations', async (req, res) => {
    const { product_code } = req.body;

    console.log('Received request to fetch recommendations for product_code:', product_code);

    try {
        // Fetch the category_id of the product based on product_code
        console.log(`Querying for product with product_code: ${product_code}`);
        const [selectedProductRows] = await db.query(
            `SELECT category_id, product_id FROM product WHERE product_code = ?`,
            [product_code]
        );

        if (selectedProductRows.length === 0) {
            console.log('No product found for the provided product_code:', product_code);
            return res.status(404).json({ error: 'Product not found' });
        }

        const { category_id, product_id } = selectedProductRows[0];
        console.log(`Product found. Category ID: ${category_id}, Product ID: ${product_id}`);

        // Fetch products from the same category, excluding the selected product
        console.log(`Querying for recommended products in category: ${category_id} excluding product_id: ${product_id}`);
        const [recommendedProducts] = await db.query(`
            SELECT
	p.product_id, 
	p.category_id, 
	p.product_code, 
	p.product_name, 
	p.price, 
	p.description, 
	p.quantity, 
	p.product_image
FROM
	product AS p
            WHERE p.category_id = ? AND p.product_id != ?
        `, [category_id, product_id]);

        console.log(`Found ${recommendedProducts.length} recommended products`);

        // Respond with recommended products
        res.json(recommendedProducts);
    } catch (error) {
        console.error('Error fetching recommended products:', error);
        res.status(500).send('Error fetching recommendations');
    }
});





module.exports = router;
