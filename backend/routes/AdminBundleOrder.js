const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/discount-product', async (req, res) => {
    try {
        // Fetch all products and their cart quantities
        const [rows] = await db.query(`
           SELECT
    p.product_code AS id, 
    p.product_name, 
    p.category_name,
    p.price,
    p.product_status,
    p.available_quantity, 
    p.product_image,
    p.cart_quantity
FROM (
    SELECT
        p.product_code, -- Keep product_code in the subquery
        p.product_name,
        p.price,
        p.product_status,
        c.category_name,
        p.quantity AS available_quantity,
        COALESCE(SUM(od.quantity), 0) AS cart_quantity,
        p.product_image
    FROM
        product p
    LEFT JOIN
        order_details od ON p.product_code = od.product_id
    LEFT JOIN
        user_product_interactions upi ON p.product_code = upi.product_code AND upi.interaction_type = 'View'
    INNER JOIN
        category c ON p.category_id = c.category_id
    GROUP BY
        p.product_code,
        p.product_name,
        p.product_status,
        p.price,
        c.category_name,
        p.quantity,
        p.product_image
) AS p
INNER JOIN (
    SELECT
        p.category_name,
        MIN(p.cart_quantity) AS min_cart_quantity,
        MIN(p.product_code) AS min_product_id -- Change to product_code
    FROM (
        SELECT
            c.category_name,
            p.product_code,
            COALESCE(SUM(od.quantity), 0) AS cart_quantity
        FROM
            product p
        LEFT JOIN
            order_details od ON p.product_code = od.product_id
        INNER JOIN
            category c ON p.category_id = c.category_id
        GROUP BY
            c.category_name, p.product_code
    ) p
    GROUP BY
        p.category_name
) AS min_cart
ON p.category_name = min_cart.category_name
AND p.cart_quantity = min_cart.min_cart_quantity
AND p.product_code = min_cart.min_product_id 
ORDER BY p.category_name ASC;

        `);

        // Respond with product details in JSON format
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});


router.post('/discount-product-update', async (req, res) => {
    const { appliedDiscounts } = req.body;

    // Log the incoming request body
    console.log('Received request body:', req.body);

    // Validate input
    if (!appliedDiscounts || appliedDiscounts.length === 0) {
        console.error('Validation error: applied discounts are missing or invalid.');
        return res.status(400).json({ message: 'Applied discounts are required.' });
    }

    try {
        // Prepare arrays to hold SQL components and values
        const statusUpdates = [];
        const discountUpdates = [];
        const productCodes = [];

        // Iterate through each discount to build the SQL statements and values
        appliedDiscounts.forEach(({ productCode, discount }) => {
            // Add the product code to the productCodes array
            productCodes.push(productCode);

            // Check if the discount is 0 to set product status to 'Active'
            if (discount === 0) {
                statusUpdates.push(`WHEN product_code = '${productCode}' THEN 'active'`);
                discountUpdates.push(`WHEN product_code = '${productCode}' THEN 0`);
            } else {
                statusUpdates.push(`WHEN product_code = '${productCode}' THEN 'Discounted'`);
                discountUpdates.push(`WHEN product_code = '${productCode}' THEN ${discount}`);
            }
        });

        // Create the SQL query
        const sql = `
            UPDATE product
            SET 
                product_status = CASE ${statusUpdates.join(' ')} END,
                product_discount = CASE ${discountUpdates.join(' ')} END
            WHERE product_code IN (${productCodes.map(code => `'${code}'`).join(', ')})
        `;

        console.log('Executing SQL query:', sql);

        // Execute the query
        const result = await db.query(sql);

        console.log('Query execution result:', result);
        res.status(200).json({ message: 'Products updated successfully.' });
    } catch (error) {
        console.error('Error updating products:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// INSERT NEW BUNDLE UPDATE 

let bundleIdCounter = 0; // Initialize a counter for custom bundle IDs

const generateUniqueBundleId = async () => {
    let isUnique = false;
    let customBundleId;

    while (!isUnique) {
        customBundleId = `BUNDLE-${bundleIdCounter}`;
        bundleIdCounter += 1; // Increment counter

        // Check if this bundle_id already exists
        const [rows] = await db.query('SELECT bundle_id FROM bundles WHERE bundle_id = ?', [customBundleId]);

        if (rows.length === 0) {
            isUnique = true; // If no matching rows, it's unique
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
                (bp.discounted_price - (bp.discounted_price * b.discount / 100)) AS final_price
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
                p.category_id = ?`,
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
  
    // Log the incoming request with the product code
    console.log(`Received request to remove discount from product with code: ${productCode}`);
  
    try {
      // Attempt to update the product discount
      const [result] = await db.query(
        `UPDATE product SET product_discount = 0, product_status = 'Active' WHERE product_code = ?`,
        [productCode]
      );
      
      // Log the result of the update operation
      console.log(`Database query result: `, result);
  
      // If no rows were affected, log and send a 404 response
      if (result.affectedRows === 0) {
        console.log(`No product found with code: ${productCode} or no discount to remove`);
        return res.status(404).send('Product not found or no discount to remove');
      }
  
      // Log success and send the response
      console.log(`Discount successfully removed from product with code: ${productCode}`);
      res.status(200).send('Discount removed successfully');
    } catch (error) {
      // Log the error and send a 500 response
      console.error('Error removing discount:', error);
      res.status(500).send('Error removing discount');
    }
  });
  
  



module.exports = router;
