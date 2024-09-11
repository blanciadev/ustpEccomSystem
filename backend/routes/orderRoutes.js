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
    const { customer_id, order_date, order_details } = req.body;

    // Log user input
    console.log('Received order data:', { customer_id, order_date, order_details });

    // Validate request data
    if (!customer_id || !order_date || !order_details || !Array.isArray(order_details)) {
        const errorMessage = 'Invalid request data: ';
        const missingFields = [];
        if (!customer_id) missingFields.push('customer_id');
        if (!order_date) missingFields.push('order_date');
        if (!order_details) missingFields.push('order_details');
        if (!Array.isArray(order_details)) missingFields.push('order_details (should be an array)');

        console.log(errorMessage + missingFields.join(', '));
        return res.status(400).json({ error: errorMessage + missingFields.join(', ') });
    }

    try {
        // Convert ISO 8601 date to MySQL DATETIME format
        const formattedOrderDate = convertToMySQLDateTime(order_date);
        console.log('Formatted order_date:', formattedOrderDate);

        // Start a transaction
        console.log('Starting transaction...');
        await db.query('START TRANSACTION');

        // Check if the customer exists
        console.log('Checking if customer exists...');
        const [customerResult] = await db.query('SELECT COUNT(*) AS count FROM `customer` WHERE `customer_id` = ?', [customer_id]);
        if (customerResult[0].count === 0) {
            console.log('Customer does not exist:', customer_id);
            await db.query('ROLLBACK');
            return res.status(400).json({ error: 'Customer does not exist' });
        }

        // Insert the new order
        console.log('Inserting new order...');
        const [orderResult] = await db.query(`
            INSERT INTO \`order\` (customer_id, order_date)
            VALUES (?, ?)
        `, [customer_id, formattedOrderDate]);

        const order_id = orderResult.insertId;
        console.log('New order inserted with ID:', order_id);

        // Prepare to insert order details
        console.log('Inserting order details...');
        const orderDetailsPromises = [];

        for (const detail of order_details) {
            if (!detail.product_id || !detail.quantity || isNaN(detail.quantity)) {
                console.log('Invalid order detail:', detail);
                throw new Error('Invalid order detail: ' + JSON.stringify(detail));
            }
            console.log('Inserting order detail:', detail);

            // Insert order detail
            orderDetailsPromises.push(
                db.query(`
                    INSERT INTO \`order_details\` (order_id, product_id, quantity)
                    VALUES (?, ?, ?)
                `, [order_id, detail.product_id, detail.quantity])
            );

            // Add status update to queue
            console.log('Adding product status update to queue...');
            addToQueue(detail.product_id, 'Order Process');
        }

        // Execute all order detail inserts
        await Promise.all(orderDetailsPromises);
        console.log('All order details inserted successfully.');

        // Commit the transaction
        console.log('Committing transaction...');
        await db.query('COMMIT');
        console.log('Transaction committed successfully.');

        res.status(201).json({ order_id });
    } catch (error) {
        // Rollback the transaction in case of error
        console.log('Rolling back transaction due to error:', error);
        await db.query('ROLLBACK');
        console.error('Error inserting order:', error);
        res.status(500).json({ error: 'Error inserting order', details: error.message });
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
