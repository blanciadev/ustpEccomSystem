const express = require('express');
const router = express.Router();
const db = require('../db');
const { addToQueue } = require('./queue'); // Adjust path as needed


// Helper function to convert ISO 8601 to MySQL DATETIME format
const convertToMySQLDateTime = (isoDate) => {
    const date = new Date(isoDate);
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Middleware to authenticate and get user information from token
const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        // Fetch the token from the database
        const [rows] = await db.query('SELECT * FROM tokens WHERE token = ?', [token]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const tokenData = rows[0];
        // Check if the token is expired
        if (new Date(tokenData.expires_at) < new Date()) {
            return res.status(401).json({ message: 'Token expired' });
        }

        // Fetch user details based on the token
        const [userRows] = await db.query('SELECT * FROM customer WHERE customer_id = ?', [tokenData.user_id]);

        if (userRows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = userRows[0]; // Attach user info to request
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Route to get customer ID
router.get('/get-customer-id', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        res.json({ customer_id: user.customer_id });
    } catch (error) {
        console.error('Error fetching customer ID:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// Route to insert a new order
router.post('/insert-order', async (req, res) => {
    const { customer_id, order_date, order_details, total_price } = req.body;

    console.log('Received order data:', { customer_id, order_date, order_details, total_price });

    if (!customer_id || !order_date || !order_details || !Array.isArray(order_details) || !total_price) {
        const missingFields = [];
        if (!customer_id) missingFields.push('customer_id');
        if (!order_date) missingFields.push('order_date');
        if (!order_details) missingFields.push('order_details');
        if (!Array.isArray(order_details)) missingFields.push('order_details (should be an array)');
        if (!total_price) missingFields.push('total_price');

        const errorMessage = 'Invalid request data: ' + missingFields.join(', ');
        console.log(errorMessage);
        return res.status(400).json({ error: errorMessage });
    }

    try {
        const formattedOrderDate = convertToMySQLDateTime(order_date);
        console.log('Formatted order_date:', formattedOrderDate);

        await db.query('START TRANSACTION');

        // Check if customer exists
        const [customerResult] = await db.query('SELECT COUNT(*) AS count FROM `customer` WHERE `customer_id` = ?', [customer_id]);
        if (customerResult[0].count === 0) {
            console.log('Customer does not exist:', customer_id);
            await db.query('ROLLBACK');
            return res.status(400).json({ error: 'Customer does not exist' });
        }

        // Insert new order
        const [orderResult] = await db.query(`
            INSERT INTO \`order\` (customer_id, order_date, total_price)
            VALUES (?, ?, ?)
        `, [customer_id, formattedOrderDate, total_price]);

        const order_id = orderResult.insertId;
        console.log('New order inserted with ID:', order_id);

        const productUpdateIds = []; // Array to collect product IDs for status update
        const productIdsInProcess = []; // Array to collect products already in process

        for (const detail of order_details) {
            const { product_id, quantity, totalprice, payment_date, payment_method, payment_status } = detail;

            if (!product_id || !quantity || totalprice == null || !payment_date || !payment_method || !payment_status) {
                console.log('Invalid order detail:', detail);
                await db.query('ROLLBACK');
                return res.status(400).json({ error: 'Invalid order detail' });
            }

            // Insert into order details table
            await db.query(`
                INSERT INTO \`order_details\` (order_id, product_id, quantity, total_price, payment_date, payment_method, payment_status, order_status, order_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
            `, [order_id, product_id, quantity, totalprice, convertToMySQLDateTime(payment_date), payment_method, payment_status]);

            // Add product_id to productUpdateIds for status update
            productUpdateIds.push(product_id);

            // Insert the order interaction (no need to check if it exists)
            await db.query(`
                INSERT INTO user_product_interactions (customer_id, product_code, interaction_type)
                VALUES (?, ?, 'order')
            `, [customer_id, product_id]);
        }

        // Fetch cart items with status 'Order In Process' for the customer
        const [cartItemsInProcess] = await db.query(`
            SELECT product_code
            FROM \`cart_items\`
            WHERE customer_id = ? AND product_code IN (${productUpdateIds.map(() => '?').join(', ')})
            AND status = 'Order In Process'
        `, [customer_id, ...productUpdateIds]);

        // Extract product_codes that are already in process
        if (cartItemsInProcess.length > 0) {
            productIdsInProcess.push(...cartItemsInProcess.map(item => item.product_code));
        }

        // Filter out products that are already in process from productUpdateIds
        const productIdsToUpdate = productUpdateIds.filter(product_id => !productIdsInProcess.includes(product_id));

        // Update status for products not already in process
        if (productIdsToUpdate.length > 0) {
            const statusQuery = `
                UPDATE \`cart_items\`
                SET status = 'Order In Process'
                WHERE product_code IN (${productIdsToUpdate.map(() => '?').join(', ')})
                AND customer_id = ?
            `;
            await db.query(statusQuery, [...productIdsToUpdate, customer_id]);
            console.log('Updated product status for items not already in process.');
        }

        await db.query('COMMIT');
        console.log('Transaction committed successfully');

        res.status(201).json({ message: 'Order placed successfully', order_id });
    } catch (error) {
        console.error('Error inserting order:', error.message);
        await db.query('ROLLBACK');
        res.status(500).json({ error: 'Failed to place order. Please try again.' });
    }
});





// Route to update customer details based on customer_id
router.post('/update-customer-details/:customer_id', authenticateToken, async (req, res) => {
    try {
        const user = req.user; // Get the authenticated user
        const { address, region, postal_code, phone_number } = req.body; // Extract data from request body
        const { customer_id } = req.params; // Get customer_id from URL parameters

        console.log(`Request received to update customer details for ID: ${customer_id}`);

        // Ensure the required fields are provided
        if (!address || !region || !postal_code || !phone_number) {
            console.log('Validation error: All fields are required');
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if customer details exist
        const [customerDetails] = await db.query('SELECT * FROM customer WHERE customer_id = ?', [customer_id]);
        console.log(`Customer details found: ${JSON.stringify(customerDetails)}`);

        if (customerDetails.length > 0) {
            // If customer details exist, update the fields
            const updateQuery = `
                UPDATE customer 
                SET street_name = ?, region = ?, postal_code = ?, phone_number = ?
                WHERE customer_id = ?
            `;
            console.log(`Executing update query: ${updateQuery}`);

            const [updateResult] = await db.query(updateQuery, [
                address,
                region,
                postal_code,
                phone_number,
                customer_id
            ]);

            if (updateResult.affectedRows > 0) {
                console.log(`Customer details updated successfully for ID: ${customer_id}`);
                res.status(200).json({ message: 'Customer details updated successfully' });
            } else {
                console.log(`Update failed for customer ID: ${customer_id}`);
                throw new Error('Failed to update customer details');
            }
        } else {
            console.log(`Customer not found for ID: ${customer_id}`);
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        console.error('Error updating customer details:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Route to get order history for a user with optional status filter
router.get('/order-history', authenticateToken, async (req, res) => {
    try {
        const { customer_id } = req.user; // Get customer_id from authenticated user
        const { status } = req.query; // Get the order status from query parameter

        // Base query to fetch order history along with product details
        let query = `
            SELECT
                o.order_id, 
                o.order_date, 
                o.total_price AS order_total, 
                od.product_id, 
                p.product_name, 
                p.price,
                od.quantity, 
                od.order_status,
                od.total_price AS item_total, 
                od.payment_method
            FROM
                \`order\` o
            INNER JOIN
                \`order_details\` od
            ON 
                o.order_id = od.order_id
            INNER JOIN
                \`product\` p
            ON 
                od.product_id = p.product_code
            WHERE
                o.customer_id = ?
        `;

        // Append filter condition if status is provided
        if (status) {
            query += ` AND od.order_status = ?`;
        }

        query += ` ORDER BY o.order_date DESC`;

        // Execute query
        const [orders] = await db.query(query, status ? [customer_id, status] : [customer_id]);

        // Process the results to group products by order_id
        const groupedOrders = orders.reduce((acc, order) => {
            if (!acc[order.order_id]) {
                acc[order.order_id] = {
                    order_id: order.order_id,
                    order_date: order.order_date,
                    order_total: order.order_total,
                    order_status: order.order_status, // Include order_status here
                    products: []
                };
            }
            acc[order.order_id].products.push({
                product_name: order.product_name,
                price: order.price,
                quantity: order.quantity,
                item_total: order.item_total
            });
            return acc;
        }, {});


        res.json(Object.values(groupedOrders));

    } catch (error) {
        console.error('Error fetching order history:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Route to cancel an order
router.post('/cancel-order', authenticateToken, async (req, res) => {
    try {
        const { order_id } = req.body; // Get order_id from request body

        // Update order status to 'Cancelled'
        await db.query(`
            UPDATE \`order_details\`
            SET order_status = 'Cancelled'
            WHERE order_id = ?
        `, [order_id]);

        res.json({ message: 'Order has been cancelled' });
    } catch (error) {
        console.error('Error cancelling order:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



module.exports = router;
