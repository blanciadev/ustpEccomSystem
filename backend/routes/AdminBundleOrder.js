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


let bundleIdCounter = 0; // Initialize a counter for custom bundle IDs

// Function to generate a simple unique bundle ID
const generateSimpleBundleId = () => {
    bundleIdCounter += 1; // Increment the counter for each new bundle
    return `BUNDLE-${bundleIdCounter}`; // Return the new unique ID
};

router.post('/bundles', async (req, res) => {
    const { selectedProducts, discount } = req.body; // Get selected products and discount from request
    console.log('----- BUNDLE INSERT ------');

    // Generate a simple unique bundle ID
    const customBundleId = generateSimpleBundleId();

    // Calculate custom price based on selected products and discount
    const totalPrice = selectedProducts.reduce((acc, product) => acc + product.price, 0);
    const customPrice = discount ? totalPrice - (totalPrice * discount / 100) : totalPrice;

    console.log('Calculated Custom Price:', customPrice, 'Discount:', discount);

    // Insert the bundle into the bundles table
    try {
        const result = await db.query(
            'INSERT INTO bundles (bundle_id, custom_price, discount) VALUES (?, ?, ?)',
            [customBundleId, customPrice, discount] // Use the custom bundle ID here
        );

        // Insert each product into the bundle_products table
        for (const product of selectedProducts) {
            await db.query(
                'INSERT INTO bundle_products (bundle_id, product_code) VALUES (?, ?)',
                [customBundleId, product.product_code] // Use the custom bundle ID here
            );
        }

        res.status(201).json({ message: 'Bundle created successfully', bundleId: customBundleId });
    } catch (error) {
        console.error('Error creating bundle:', error);
        res.status(500).json({ error: 'Failed to create bundle' });
    }
});






module.exports = router;
