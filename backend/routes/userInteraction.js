
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/products-interaction', async (req, res) => {
    const { product_code, customerId, interaction_type } = req.query;

    if (!product_code || !customerId || !interaction_type) {
        return res.status(400).json({ error: 'Product code, customer ID, and interaction type are required' });
    }

    try {
        console.log('Processing interaction:', { product_code, customerId, interaction_type });

        // Get the product ID based on the product code
        const [productResult] = await db.query(`
            SELECT product_id
            FROM product
            WHERE product_code = ?
        `, [product_code]);

        if (productResult.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product_id = productResult[0].product_id;

        // Check if an interaction already exists
        const [existingInteraction] = await db.query(`
            SELECT interaction_count
            FROM user_product_interactions
            WHERE customer_id = ? AND product_code = ? AND interaction_type = ?
        `, [customerId, product_code, interaction_type]);

        if (existingInteraction.length > 0) {
            // Update the interaction count if it exists
            await db.query(`
                UPDATE user_product_interactions
                SET interaction_count = interaction_count + 1
                WHERE customer_id = ? AND product_code = ? AND interaction_type = ?
            `, [customerId, product_code, interaction_type]);
        } else {
            // Insert a new interaction if it does not exist
            await db.query(`
                INSERT INTO user_product_interactions (customer_id, product_code, interaction_type, interaction_count)
                VALUES (?, ?, ?, 1)
            `, [customerId, product_code, interaction_type]);
        }

        // Optionally, update the interaction count in the product table
        await db.query(`
            UPDATE product
            SET interaction_count = interaction_count + 1
            WHERE product_id = ?
        `, [product_id]);

        res.json({ success: true, message: 'Product interaction updated and logged' });
    } catch (error) {
        console.error('Error updating product interaction:', error);
        res.status(500).json({ error: 'Error updating product interaction' });
    }
});


module.exports = router;
