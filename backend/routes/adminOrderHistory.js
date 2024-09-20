const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT category_id, category_name FROM category');
        res.json({ categories: rows });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
});


// Update Product Route
router.put('/admin-update-products/:product_code', async (req, res) => {
    const { product_code } = req.params;
    const { product_name, description, category_id, price, quantity, size, expiration_date, product_status, product_image } = req.body;



    // SQL query to update product details
    const query = `
        UPDATE product
        SET
            product_name = ?,
            description = ?,
            category_id = ?,
            price = ?,
            quantity = ?,
            size = ?,
            expiration_date = ?,
            product_status = ?,
            product_image = ?,
            product_update = NOW()
        WHERE product_code = ?;
    `;

    try {
        // Execute the query
        const [result] = await db.query(query, [
            product_name,
            description,
            category_id,
            price,
            quantity,
            size,
            expiration_date,
            product_status,
            product_image,
            product_code
        ]);

        // Check if the update was successful
        if (result.affectedRows > 0) {
            console.log('Product updated successfully', { product_code });
            res.json({ message: 'Product updated successfully' });
        } else {
            console.warn('Product not found', { product_code });
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error updating product details', { product_code, error: error.message });
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


router.get('/admin-order-history-component', async (req, res) => {
    try {
        const { status } = req.query;

        // Base query for fetching order details for today's date using order_date
        let query = `
            SELECT 
                order_details.order_status,
                COUNT(*) AS order_count
            FROM 
                \`order\`
            INNER JOIN 
                order_details ON \`order\`.order_id = order_details.order_id
            WHERE 
                DATE(\`order\`.order_date) = CURDATE()  -- Filter orders by today's date from the order_date column
            GROUP BY 
                order_details.order_status
        `;

        if (status) {
            query += ` AND order_details.order_status = ?`;  // Add status filter if provided
        }

        const queryParams = status ? [status] : [];

        const [orders] = await db.query(query, queryParams);

        console.log('Fetched orders:', orders);

        // Construct response object with only counts
        const statusCounts = orders.reduce((acc, order) => {
            acc[order.order_status] = (acc[order.order_status] || 0) + order.order_count;
            return acc;
        }, {});

        res.json({
            statusCounts: {
                Completed: statusCounts['Completed'] || 0,
                'To Process': statusCounts['Pending'] || 0,
                'To Ship': statusCounts['To Ship'] || 0,
                'To Receive': statusCounts['To Receive'] || 0,
                Cancelled: statusCounts['Cancelled'] || 0,
                'Return/Refund': statusCounts['Return/Refund'] || 0,
                'In Transit': statusCounts['In Transit'] || 0,
                Returned: statusCounts['Returned'] || 0,
            }
        });

    } catch (error) {
        console.error('Error fetching order history:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


router.get('/admin-order-history-total-component', async (req, res) => {
    try {
        const { status } = req.query;

        // Base query for fetching total order details without filtering by date
        let query = `
            SELECT 
                order_details.order_status,
                COUNT(*) AS order_count
            FROM 
                \`order\`
            INNER JOIN 
                order_details ON \`order\`.order_id = order_details.order_id
            GROUP BY 
                order_details.order_status
        `;

        if (status) {
            query += ` WHERE order_details.order_status = ?`;  // Add status filter if provided
        }

        const queryParams = status ? [status] : [];

        const [orders] = await db.query(query, queryParams);

        console.log('Fetched orders:', orders);

        // Construct response object with only counts
        const statusCounts = orders.reduce((acc, order) => {
            acc[order.order_status] = (acc[order.order_status] || 0) + order.order_count;
            return acc;
        }, {});

        res.json({
            statusCounts: {
                Completed: statusCounts['Completed'] || 0,
                Pending: statusCounts['Pending'] || 0,
                'To Ship': statusCounts['To Ship'] || 0,
                'To Receive': statusCounts['To Receive'] || 0,
                Cancelled: statusCounts['Cancelled'] || 0,
                'Return/Refund': statusCounts['Return/Refund'] || 0,
                'In Transit': statusCounts['In Transit'] || 0,
                Returned: statusCounts['Returned'] || 0,
            }
        });

    } catch (error) {
        console.error('Error fetching order history:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


router.get('/sales', async (req, res) => {
    try {
        // Query the order_details table for completed orders, grouped by the month of the order_date
        const [rows] = await db.query(`
            SELECT 
                MONTH(order_date) AS month,       -- Extract the month from the order_date
                COUNT(*) AS completed_sales,      -- Count the number of completed orders
                SUM(total_price) AS total_sales_amount  -- Sum the total price for the completed sales
            FROM 
                order_details
            WHERE 
                order_status = 'Completed'        -- Only count completed orders
            GROUP BY 
                MONTH(order_date)                 -- Group by month of the order_date
            ORDER BY 
                MONTH(order_date)                 -- Sort by the month
        `);

        res.json({ insights: rows });  // Send the result back to the frontend
    } catch (error) {
        console.error('Error fetching sales data:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
