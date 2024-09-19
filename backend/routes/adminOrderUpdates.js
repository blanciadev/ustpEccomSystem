const express = require('express');
const router = express.Router();
const db = require('../db');



// Route to update order status and subtract quantity if status is 'To Ship'
router.put('/update-order-status/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { status, products } = req.body; // Get status and products from request body

    // Check if status is provided
    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    try {
        // Begin transaction to ensure consistency
        await db.query('START TRANSACTION');

        // Update the order status in the order_details table
        const result = await db.query(
            'UPDATE order_details SET order_status = ? WHERE order_id = ?',
            [status, orderId]
        );

        // Check if the order was found and updated
        if (result.affectedRows === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ message: 'Order not found' });
        }

        // If the status is 'To Ship', subtract the quantity from the product table
        if (status === 'To Ship') {
            for (const product of products) {
                const { product_id, quantity } = product;

                // Check if the product has sufficient stock
                const [productResult] = await db.query(
                    'SELECT quantity FROM product WHERE product_code = ?',
                    [product_id]
                );

                if (productResult.length === 0) {
                    await db.query('ROLLBACK');
                    return res.status(404).json({ message: `Product ID ${product_id} not found` });
                }

                if (productResult[0].quantity < quantity) {
                    await db.query('ROLLBACK');
                    return res.status(400).json({
                        message: `Not enough stock for product ID ${product_id}. Available: ${productResult[0].quantity}`,
                    });
                }

                // Subtract the quantity from the product table
                const updateResult = await db.query(
                    'UPDATE product SET quantity = quantity - ? WHERE product_code = ?',
                    [quantity, product_id]
                );

                if (updateResult.affectedRows === 0) {
                    await db.query('ROLLBACK');
                    return res.status(404).json({ message: `Failed to update stock for product ID ${product_id}` });
                }
            }
        }

        // Commit the transaction after all updates
        await db.query('COMMIT');

        // Respond with success
        res.status(200).json({ message: 'Order status and product quantities updated successfully' });
    } catch (error) {
        // Rollback transaction in case of error
        await db.query('ROLLBACK');
        console.error('Error updating order status:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


router.post('/update-payment-details', async (req, res) => {
    try {
        const { order_id, payment_method, order_status, payment_status } = req.body;

        // Validate input
        if (!order_id || !payment_method || !order_status || !payment_status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // SQL query to update the payment details
        const query = `
            UPDATE order_details
            SET payment_method = ?, order_status = ?, payment_status = ?
            WHERE order_id = ?
        `;

        // Execute the query
        const [result] = await db.query(query, [payment_method, order_status, payment_status, order_id]);

        // Check if the update was successful
        if (result.affectedRows > 0) {
            res.json({ message: 'Payment details updated successfully' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating payment details:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});



module.exports = router;
