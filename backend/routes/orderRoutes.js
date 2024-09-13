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

        const [customerResult] = await db.query('SELECT COUNT(*) AS count FROM `customer` WHERE `customer_id` = ?', [customer_id]);
        if (customerResult[0].count === 0) {
            console.log('Customer does not exist:', customer_id);
            await db.query('ROLLBACK');
            return res.status(400).json({ error: 'Customer does not exist' });
        }

        const [orderResult] = await db.query(`
            INSERT INTO \`order\` (customer_id, order_date, total_price)
            VALUES (?, ?, ?)
        `, [customer_id, formattedOrderDate, total_price]);

        const order_id = orderResult.insertId;
        console.log('New order inserted with ID:', order_id);

        const productUpdateIds = []; // Array to collect product IDs

        for (const detail of order_details) {
            const { product_id, quantity, totalprice, payment_date, payment_method, payment_status } = detail;
            if (!product_id || !quantity || totalprice == null || !payment_date || !payment_method || !payment_status) {
                console.log('Invalid order detail:', detail);
                await db.query('ROLLBACK');
                return res.status(400).json({ error: 'Invalid order detail' });
            }

            await db.query(`
                INSERT INTO \`order_details\` (order_id, product_id, quantity, total_price, payment_date, payment_method, payment_status)
                VALUES (?, ?, ?, ?, null, ?, ?)
            `, [order_id, product_id, quantity, totalprice, convertToMySQLDateTime(payment_date), payment_method, payment_status]);

            productUpdateIds.push(product_id); // Add to product update list
        }

        if (productUpdateIds.length > 0) {
            const statusQuery = `
                UPDATE \`cart_items\`
                SET status = 'Order In Process'
                WHERE product_code IN (${productUpdateIds.map(() => '?').join(', ')})
            `;
            await db.query(statusQuery, productUpdateIds);
            console.log('Batch product status update completed.');
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

module.exports = router;
