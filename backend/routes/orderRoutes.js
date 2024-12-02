const express = require('express');
const router = express.Router();
const db = require('../db');
const { addToQueue } = require('./queue');


const convertToMySQLDateTime = (isoDate) => {
    const date = new Date(isoDate);
    return date.toISOString().slice(0, 19).replace('T', ' ');
};


const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM tokens WHERE token = ?', [token]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const tokenData = rows[0];

        if (new Date(tokenData.expires_at) < new Date()) {
            return res.status(401).json({ message: 'Token expired' });
        }


        const [userRows] = await db.query('SELECT * FROM users WHERE customer_id = ?', [tokenData.user_id]);
        if (userRows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = userRows[0];
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


// Function to generate a unique 6-digit order ID
const generateOrderId = async () => {
    let orderId;
    let isUnique = false;

    while (!isUnique) {
        orderId = Math.floor(100000 + Math.random() * 900000);

        const [result] = await db.query('SELECT COUNT(*) AS count FROM `order` WHERE `order_id` = ?', [orderId]);
        isUnique = result[0].count === 0;
    }

    return orderId;
};


// Route to insert a new order
router.post('/insert-order', async (req, res) => {
    const {
        customer_id,
        order_date,
        order_details,
        total_price,
        fullName,
        phoneNumber,
        streetname,
        address,
        region,
        postalCode,
    } = req.body;
    const paymentMethod = 'COD'
    console.log('Received order data:', { customer_id, order_date, order_details, total_price, fullName, phoneNumber, address, region, postalCode, });

    // Validate incoming request data
    if (!customer_id || !order_date || !order_details || !Array.isArray(order_details) || !total_price || !fullName || !phoneNumber || !address || !region || !postalCode) {
        const missingFields = [];
        if (!customer_id) missingFields.push('customer_id');
        if (!order_date) missingFields.push('order_date');
        if (!order_details) missingFields.push('order_details');
        if (!Array.isArray(order_details)) missingFields.push('order_details (should be an array)');
        if (!total_price) missingFields.push('total_price');
        if (!fullName) missingFields.push('fullName');
        if (!phoneNumber) missingFields.push('phoneNumber');
        if (!address) missingFields.push('address');
        if (!streetname) missingFields.push('streetname');
        if (!region) missingFields.push('region');
        if (!postalCode) missingFields.push('postalCode');


        const errorMessage = 'Invalid request data: ' + missingFields.join(', ');
        console.log('Error:', errorMessage);
        return res.status(400).json({ error: errorMessage });
    }

    try {
        const formattedOrderDate = convertToMySQLDateTime(order_date);
        console.log('Formatted order_date:', formattedOrderDate);

        console.log('Starting transaction...');
        console.log('---------------- 124 START TRANSACTION --------------------');
        await db.query('START TRANSACTION');

        const [customerResult] = await db.query('SELECT COUNT(*) AS count FROM `users` WHERE `customer_id` = ?', [customer_id]);
        console.log('Customer check result:', customerResult);
        if (customerResult[0].count === 0) {
            console.log('Customer does not exist:', customer_id);
            await db.query('ROLLBACK');
            return res.status(400).json({ error: 'Customer does not exist' });
        }

        const order_id = await generateOrderId();
        console.log('------------------------------------');
        console.log('New order ID generated:', order_id);

        const [orderResult] = await db.query(`
            INSERT INTO \`order\` (order_id, customer_id, order_date, total_price)
            VALUES (?, ?, ?, ?)
        `, [order_id, customer_id, formattedOrderDate, total_price]);
        console.log('------------------------------------');
        console.log('Order inserted with result:', orderResult);

        const cartItemsUpdateIds = [];


        for (const detail of order_details) {
            const { product_id, quantity, totalprice, payment_date, payment_method, payment_status, cart_items } = detail;

            if (!product_id || !quantity || !totalprice || !payment_method || !payment_status) {
                console.log('------------ 156 ERROR ------------');
                console.log('Invalid order detail:', detail);
                await db.query('ROLLBACK');
                return res.status(400).json({ error: 'Invalid order detail' });
            }

            const formattedPaymentDate = payment_date ? convertToMySQLDateTime(payment_date) : null;

            await db.query(`
                INSERT INTO \`order_details\` (order_id, product_id, quantity, total_price, payment_date, payment_method, payment_status, order_status, order_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
            `, [order_id, product_id, quantity, totalprice, formattedPaymentDate, payment_method, payment_status]);

            console.log('------------------- 170 INSERT ORDER DETAILS -----------------');
            console.log('Inserted order detail:', { order_id, product_id, quantity, totalprice, formattedPaymentDate, payment_method, payment_status });

            cartItemsUpdateIds.push(cart_items);
            console.log('Added cart_items_id to cartItemsUpdateIds:', cart_items);
            console.log('------------------------------------');

            const updateQuantityQuery = `
                UPDATE \`product\`
                SET quantity = quantity - ?
                WHERE product_code = ?
                `;
            const result = await db.query(updateQuantityQuery, [quantity, product_id]);

            if (result[0].affectedRows > 0) {
                console.log('---------------- 191 PRODUCT QUANTITY UPDATE --------------------');
                console.log(`Successfully updated product quantity for product_id ${product_id}.`);
            } else {
                console.log('-------------- 194 ERROR ------------------');
                console.log(`No product quantity was updated; please check the provided product_id: ${product_id}.`);
            }
        }


        console.log('Final cartItemsUpdateIds:', cartItemsUpdateIds);

        if (cartItemsUpdateIds.length > 0) {
            console.log('Updating cart items status to "Order In Process"...');

            const statusQuery = `
                    UPDATE \`cart_items\`
                    SET status = 'Order In Process'
                    WHERE cart_items_id IN (${cartItemsUpdateIds.map(() => '?').join(', ')})
                    AND customer_id = ?
                `;
            console.log('---------------- 192 UPDATE QUERY --------------------');
            console.log('Executing update query for IDs:', cartItemsUpdateIds);

            const result = await db.query(statusQuery, [...cartItemsUpdateIds, customer_id]);
            console.log('Update result:', result);

            if (result.affectedRows > 0) {
                console.log('------------------ 200 SUCCESSFULL UPDATE ------------------');
                console.log(`Successfully updated ${result.affectedRows} cart item(s) to "Order In Process".`);
            } else {
                console.log('No cart items were updated; please check the provided IDs and customer ID.');
            }
        } else {
            console.log('No cart items to update; the cartItemsUpdateIds array is empty.');
        }


        await db.query(`
            INSERT INTO shipment (order_id, customer_id, shipment_date, streetname, address, city, shipment_status, phoneNumber, postalCode)
            VALUES (?, ?, NOW(), ?,?, ?, 'Pending', ?, ?)
        `, [order_id, customer_id, streetname, address, region, phoneNumber, postalCode]);
        console.log('----------------- 215 INSERT SHIPMENT -------------------');
        console.log('Inserted shipment details for order ID:', order_id);

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
        const user = req.user;
        const { address, region, postal_code, phone_number } = req.body;
        const { customer_id } = req.params;

        console.log(`Request received to update customer details for ID: ${customer_id}`);

        if (!address || !region || !postal_code || !phone_number) {
            console.log('Validation error: All fields are required');
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [customerDetails] = await db.query('SELECT * FROM users WHERE customer_id = ?', [customer_id]);
        console.log(`Customer details found: ${JSON.stringify(customerDetails)}`);

        if (customerDetails.length > 0) {
            const updateQuery = `
                UPDATE users 
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
        const { customer_id } = req.user;
        const { status } = req.query;

        let query = `
            SELECT
                o.order_id, 
                o.order_date, 
                o.total_price AS order_total, 
                od.product_id, 
                p.product_name,
                p.product_image,
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

        if (status) {
            query += ` AND od.order_status = ?`;
        }

        query += ` ORDER BY o.order_date DESC`;

        const [orders] = await db.query(query, status ? [customer_id, status] : [customer_id]);

        const groupedOrders = orders.reduce((acc, order) => {
            if (!acc[order.order_id]) {
                acc[order.order_id] = {
                    order_id: order.order_id,
                    order_date: order.order_date,
                    order_total: order.order_total,
                    order_status: order.order_status,
                    products: []
                };
            }
            acc[order.order_id].products.push({
                product_name: order.product_name,
                product_image: order.product_image,
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



// Route to get order history for a user with optional status filter
router.get('/order-history-display', authenticateToken, async (req, res) => {
    try {
        const { customer_id } = req.user;
        const { status } = req.query;

        let query = `
            SELECT
                o.order_id, 
                o.order_date, 
                od.order_update, 
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

        if (status) {
            query += ` AND od.order_status = ?`;
        }

        query += ` ORDER BY o.order_date DESC`;

        const [orders] = await db.query(query, status ? [customer_id, status] : [customer_id]);

        const groupedOrders = orders.reduce((acc, order) => {
            if (!acc[order.order_id]) {
                acc[order.order_id] = {
                    order_id: order.order_id,
                    order_date: order.order_date,
                    order_total: order.order_total,
                    order_status: order.order_status,
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
        const { order_id } = req.body;
        console.log('Cancelling Order');
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