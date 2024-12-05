const express = require('express');
const router = express.Router();
const db = require('../db');


// INSERT NEW BUNDLE UPDATE 
let bundleIdCounter = 0;

const generateUniqueBundleId = async () => {
    let isUnique = false;
    let customBundleId;

    while (!isUnique) {
        customBundleId = `BUNDLE-${bundleIdCounter}`;
        bundleIdCounter += 1;

        // Check if this bundle_id already exists
        const [rows] = await db.query('SELECT bundle_id FROM bundles WHERE bundle_id = ?', [customBundleId]);

        if (rows.length === 0) {
            isUnique = true;
        }
    }
    return customBundleId;
};

router.post('/bundles', async (req, res) => {
    const { selectedProducts, discount } = req.body;
    console.log('----- BUNDLE INSERT ------');

    // Generate a unique bundle ID
    const customBundleId = await generateUniqueBundleId();

    // Calculate custom price
    const totalPrice = selectedProducts.reduce((acc, product) => acc + parseFloat(product.discountedPrice), 0);
    const customPrice = totalPrice.toFixed(2);

    try {
        await db.query(
            'INSERT INTO bundles (bundle_id, custom_price, discount) VALUES (?, ?, ?)',
            [customBundleId, customPrice, discount]
        );

        // Insert each product and update its status and discount
        for (const product of selectedProducts) {
            await db.query(
                'INSERT INTO bundle_products (bundle_id, product_code, discounted_price) VALUES (?, ?, ?)',
                [customBundleId, product.product_code, product.discountedPrice]
            );

            await db.query(
                'UPDATE product SET product_status = ?, product_discount = ? WHERE product_code = ?',
                ['Bundled', discount, product.product_code]
            );
        }

        res.status(201).json({ message: 'Bundle created successfully', bundleId: customBundleId });
    } catch (error) {
        console.error('Error creating bundle:', error);
        res.status(500).json({ error: 'Failed to create bundle' });
    }
});


// Fetch product bundles by product's category (excluding the product itself)
router.post('/product-bundles', async (req, res) => {
    const { product_code } = req.body;

    try {
        // First, find the category of the given product_code
        const [product] = await db.query(
            `SELECT category_id FROM product WHERE product_code = ?`,
            [product_code]
        );

        if (product.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const category_id = product[0].category_id;

        // Query to find bundles that contain products in the same category, excluding the given product_code
        const [bundles] = await db.query(
            `SELECT
                    b.bundle_id, 
                    b.discount, 
                    bp.product_code, 
                    bp.discounted_price, 
                    p.product_name, 
                    p.price, 
                    (bp.discounted_price - (bp.discounted_price * b.discount / 100)) AS final_price, 
                    p.product_image
                FROM
                    bundles AS b
                    JOIN
                    bundle_products AS bp
                    ON 
                        b.bundle_id = bp.bundle_id
                    JOIN
                    product AS p
                    ON 
                        bp.product_code = p.product_code
                WHERE
                    p.category_id =  ?`,
            [category_id, product_code]
        );

        if (bundles.length === 0) {
            return res.status(404).json({ message: 'No bundles found for this category' });
        }

        // Sending the calculated fields in the response
        res.json(bundles);
    } catch (err) {
        console.error('Error fetching product bundles:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch product bundles (general display of bundled products)
router.get('/product-bundles-general', async (req, res) => {
    try {
        const [bundles] = await db.query(
            `SELECT
    b.bundle_id, 
    b.discount, 
    bp.product_code, 
    bp.discounted_price, 
    p.product_name, 
    p.price, 
    (bp.discounted_price - (bp.discounted_price * b.discount / 100)) AS final_price, 
    p.product_image, 
    p.quantity
FROM
    bundles AS b
    JOIN bundle_products AS bp
        ON b.bundle_id = bp.bundle_id
    JOIN product AS p
        ON bp.product_code = p.product_code
WHERE
    p.quantity > 0;
`
        );

        if (bundles.length === 0) {
            return res.status(404).json({ message: 'No bundles found.' });
        }

        res.json(bundles);
    } catch (err) {
        console.error('Error fetching product bundles:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/products-no-bundle', async (req, res) => {
    try {
        // Fetch all products and their categories
        const [rows] = await db.query(`
            SELECT p.product_id, p.product_code, p.product_name, p.price ,p.description, p.quantity, c.category_name, p.product_image,  p.product_discount, 
                p.product_status
            FROM product p
            INNER JOIN category c ON p.category_id = c.category_id
            WHERE product_status = 'Active'
        `);

        // Respond with product details including categories
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});

router.get('/products-disable-bundle', async (req, res) => {
    try {
        // Fetch all products and their categories
        const [rows] = await db.query(`
            SELECT
	p.product_id, 
	p.product_code, 
	p.product_name, 
	p.price, 
	p.description, 
	p.quantity, 
	c.category_name, 
	p.product_image, 
	p.product_discount, 
	p.product_status, 
	bundle_products.bundle_id
FROM
	product AS p
	INNER JOIN
	category AS c
	ON 
		p.category_id = c.category_id
	INNER JOIN
	bundle_products
	ON 
		p.product_code = bundle_products.product_code
WHERE
	product_status = 'Bundled'
        `);

        // Respond with product details including categories
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});


router.post('/remove-discount/:productCode', async (req, res) => {
    const { productCode } = req.params;

    console.log(`Received request to remove discount from product with code: ${productCode}`);

    try {

        const [result] = await db.query(
            `UPDATE product SET product_discount = 0, product_status = 'Active' WHERE product_code = ?`,
            [productCode]
        );


        console.log(`Database query result: `, result);


        if (result.affectedRows === 0) {
            console.log(`No product found with code: ${productCode} or no discount to remove`);
            return res.status(404).send('Product not found or no discount to remove');
        }


        console.log(`Discount successfully removed from product with code: ${productCode}`);
        res.status(200).send('Discount removed successfully');
    } catch (error) {

        console.error('Error removing discount:', error);
        res.status(500).send('Error removing discount');
    }
});





module.exports = router;
