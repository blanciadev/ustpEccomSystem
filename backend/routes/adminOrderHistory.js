const express = require('express');
const router = express.Router();
const db = require('../db');

// Route to update order status
router.put('/update-order-status/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    try {
        // Update the order status in the database
        const result = await db.query(
            'UPDATE order_details SET order_status = ? WHERE order_id = ?',
            [status, orderId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

router.get('/admin-order-history', async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT
                \`order\`.*, 
                product.product_name, 
                order_details.payment_method, 
                order_details.total_price, 
                order_details.quantity, 
                product.price, 
                customer.customer_id,   
                customer.first_name, 
                customer.last_name, 
                customer.email, 
                customer.phone_number, 
                customer.street_name, 
                customer.region, 
                customer.postal_code,
                order_details.order_status
            FROM
                \`order\`
            INNER JOIN order_details
                ON \`order\`.order_id = order_details.order_id
            INNER JOIN product
                ON order_details.product_id = product.product_code
            INNER JOIN customer
                ON \`order\`.customer_id = customer.customer_id
        `;

        if (status) {
            query += ` WHERE order_details.order_status = ?`;
        }

        query += ` ORDER BY \`order\`.order_date DESC`;

        const queryParams = status ? [status] : [];

        const [orders] = await db.query(query, queryParams);

        console.log('Fetched orders:', orders);

        const groupedOrders = orders.reduce((acc, order) => {
            if (!acc[order.order_id]) {
                acc[order.order_id] = {
                    order_id: order.order_id,
                    order_date: order.order_date,
                    order_total: order.order_total,
                    order_status: order.order_status,
                    customer_id: order.customer_id,
                    customer_first_name: order.first_name,
                    customer_last_name: order.last_name,
                    products: []
                };
            }
            acc[order.order_id].products.push({
                product_name: order.product_name,
                price: order.price,
                quantity: order.quantity,
                item_total: order.total_price
            });
            return acc;
        }, {});

        res.json({ orders: Object.values(groupedOrders) });

    } catch (error) {
        console.error('Error fetching order history:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;
