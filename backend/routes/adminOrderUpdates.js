const express = require('express');
const router = express.Router();
const db = require('../db');



// Route to update order status
router.put('/update-order-status/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    // Check if status is provided
    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    try {
        // Begin transaction to ensure consistency
        await db.query('START TRANSACTION');

        // Update the order status in the order_details table
        const result = await db.query(
            'UPDATE order_details SET order_status = ?, order_update = NOW() WHERE order_id = ?',
            [status, orderId]
        );

        // Check if the order was found and updated
        if (result.affectedRows === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ message: 'Order not found' });
        }


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

        const order_status_final = 'Completed'
        console.log('Order Status', order_status);

        // Validate input
        if (!order_id || !payment_method || !order_status || !payment_status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // SQL query to update the payment details
        const query = `
            UPDATE order_details
            SET payment_method = ?, order_status = ?, order_update = NOW() , payment_status = ?
            WHERE order_id = ?
        `;

        // Execute the query for payment details
        const [result] = await db.query(query, [payment_method, order_status_final, payment_status, order_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // SQL query to update the shipment details
        const shipmentUpdate = `
            UPDATE shipment
            SET shipment_status = ?
            WHERE order_id = ?
        `;

        // Execute the query for shipment details
        const [shipment] = await db.query(shipmentUpdate, ['Delivered', order_id]);

        if (shipment.affectedRows === 0) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        // If both updates are successful, send a single response
        res.json({ message: 'Payment and shipment details updated successfully' });

    } catch (error) {
        console.error('Error updating payment details:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});




module.exports = router;
