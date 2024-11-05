const express = require('express');
const router = express.Router();
const db = require('../db');

// router.get('/products-interaction', async (req, res) => {
//     const { product_code, customerId, interaction_type } = req.query;

//     // Log the incoming request payload
//     console.log('Request payload:', { product_code, customerId, interaction_type });

//     // Validate input
//     if (!product_code || !customerId || !interaction_type) {
//         console.log('Validation failed: Product code, customer ID, and interaction type are required');
//         return res.status(400).json({
//             error: 'Product code, customer ID, and interaction type are required'
//         });
//     }

//     try {
//         // Log the query and parameters before execution
//         console.log('Executing query with parameters:', {
//             customerId,
//             product_code,
//             interaction_type
//         });

//         await db.query(`
//             INSERT INTO user_product_interactions (customer_id, product_code, interaction_type, created_at, updated_at)
//             VALUES (?, ?, ?, NOW(), NOW())
//         `, [customerId, product_code, interaction_type]);

//         console.log('Product interaction recorded successfully');
//         return res.status(200).json({ message: 'Product interaction recorded successfully' });
//     } catch (error) {
//         console.error('Error updating product interaction:', error);
//         return res.status(500).json({ error: 'Error updating product interaction' });
//     }
// });


router.get('/products-interaction', async (req, res) => {
    const { product_code, customerId, interaction_type } = req.query;

    // Log the incoming request payload
    console.log('Request payload:', { product_code, customerId, interaction_type });

    // Validate input
    if (!customerId || !interaction_type) {
        console.log('Validation failed: Customer ID and interaction type are required');
        return res.status(400).json({
            error: 'Customer ID and interaction type are required'
        });
    }

    const productCodes = Array.isArray(product_code) ? product_code : [product_code];

    try {
        console.log('Executing query with parameters:', {
            customerId,
            productCodes,
            interaction_type
        });

        const uniqueProductCodes = [...new Set(productCodes)];

        const insertPromises = [];

        for (const productCode of uniqueProductCodes) {
            const [rows] = await db.query(`
                SELECT * FROM user_product_interactions 
                WHERE customer_id = ? 
                  AND product_code = ? 
                  AND interaction_type = ? 
                  AND DATE(created_at) = CURDATE()
            `, [customerId, productCode, interaction_type]);

            if (rows.length === 0) {
                insertPromises.push(db.query(`
                    INSERT INTO user_product_interactions (customer_id, product_code, interaction_type, created_at, updated_at)
                    VALUES (?, ?, ?, NOW(), NOW())
                `, [customerId, productCode, interaction_type]));
            } else {
                console.log(`Duplicate interaction found for customer_id: ${customerId}, product_code: ${productCode}, interaction_type: ${interaction_type}. Skipping insertion.`);
            }
        }

        await Promise.all(insertPromises);

        console.log('Product interactions recorded successfully');
        return res.status(200).json({ message: 'Product interactions recorded successfully' });
    } catch (error) {
        console.error('Error updating product interaction:', error);
        return res.status(500).json({ error: 'Error updating product interaction' });
    }
});




module.exports = router;
