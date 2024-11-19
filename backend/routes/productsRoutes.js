const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/products', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.product_id, p.product_code, p.product_name, p.price ,p.description, p.quantity, p.size, c.category_name, p.product_image,  p.product_discount, 
                p.product_status
            FROM product p
            INNER JOIN category c ON p.category_id = c.category_id
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});


// Route to get top 4 user-picked products for interaction view
router.get('/products-top-picks', async (req, res) => {
    try {
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

        res.json(rows);
    } catch (error) {
        console.error('Error fetching top user picks:', error);
        res.status(500).send('Error fetching top user picks');
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
				p.product_discount, 
                p.product_image,
                p.product_status
            FROM
                product AS p
            WHERE 
                p.category_id = ?
                AND p.product_code != ?
            ORDER BY
                CASE 
                    WHEN p.product_status = 'Discounted' THEN 1 
                    ELSE 2 
                END
        `, [category_id, product_id]);

        console.log(`Found ${recommendedProducts.length} recommended products`);

        // Respond with recommended products
        res.json(recommendedProducts);
    } catch (error) {
        console.error('Error fetching recommended products:', error);
        res.status(500).send('Error fetching recommendations');
    }
});

router.get('/sticky-components', async (req, res) => {
    const { hairType, hairTexture, hairVirgin, hairColor, hairRebonded } = req.query;

    console.log('--------- STICKY COMPONENT -------');
    console.log('Received parameters:', req.query);

    try {
        // Base query to fetch active products
        let query = 'SELECT * FROM product WHERE product_status IN ("active", "Discounted")';

        // List of possible search terms
        const searchTerms = [];
        const queryParams = [];

        // Check each parameter and add to searchTerms array if provided
        if (hairType) {
            searchTerms.push('LOWER(description) LIKE ?');
            queryParams.push(`%${hairType.toLowerCase()}%`);
        }

        if (hairTexture) {
            searchTerms.push('LOWER(description) LIKE ?');
            queryParams.push(`%${hairTexture.toLowerCase()}%`);
        }

        if (hairVirgin) {
            searchTerms.push('LOWER(description) LIKE ?');
            queryParams.push(`%${hairVirgin.toLowerCase()}%`);
        }

        if (hairColor) {
            searchTerms.push('LOWER(description) LIKE ?');
            queryParams.push(`%${hairColor.toLowerCase()}%`);
        }

        if (hairRebonded) {
            searchTerms.push('LOWER(description) LIKE ?');
            queryParams.push(`%${hairRebonded.toLowerCase()}%`);
        }

        if (searchTerms.length > 0) {
            query += ' AND (' + searchTerms.join(' OR ') + ')';
        }

        query += ' LIMIT 5';

        console.log('Final query to execute:', query);
        console.log('Query parameters:', queryParams);

        const [products] = await db.query(query, queryParams);

        console.log('Fetched products:', products);

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).send('Server error');
    }
});


router.get('/products-bundle-recommendation', async (req, res) => {
    console.log('--- BUNDLE PRODUCTS ---');

    try {
        // Fetch all products and their categories
        const [rows] = await db.query(`
         SELECT
            p.product_id,
            p.category_id,
            p.product_code,
            p.product_name,
            p.price,
            p.description,
            p.quantity,
            p.product_discount,
            p.product_image,
            p.product_status 
        FROM
            product AS p 
        WHERE
            p.product_status = 'Discounted' 
        ORDER BY
            CASE
                WHEN p.product_status = 'Discounted' THEN 1 
                ELSE 2 
            END
        LIMIT 4;  

    `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});


module.exports = router;
