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


router.get('/admin-order-history', async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT
                \`order\`.*, 
                product.product_name, 
                order_details.product_id, 
                order_details.payment_method, 
                order_details.total_price, 
                order_details.quantity, 
                order_details.payment_status, 
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
                    product_id: order.product_id,
                    order_date: order.order_date,
                    order_total: order.order_total,
                    order_status: order.order_status,
                    payment_status: order.payment_status,
                    payment_method: order.payment_method,
                    customer_id: order.customer_id,
                    customer_first_name: order.first_name,
                    customer_last_name: order.last_name,
                    products: []
                };
            }
            acc[order.order_id].products.push({
                product_id: order.product_id,  
                product_name: order.product_name,
                price: order.price,
                quantity: order.quantity,
                item_total: order.total_price,
                payment_status: order.payment_status,
                payment_method: order.payment_method,
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
