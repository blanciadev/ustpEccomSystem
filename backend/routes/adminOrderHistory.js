const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');

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
        const { status, searchTerm, exportToExcel, page = 1 } = req.query;
        const pageSize = 10;  // Define the number of results per page
        const offset = (page - 1) * pageSize;

        let query = `
        SELECT
            \`order\`.*, 
            product.product_name, 
            order_details.order_details_id, 
            order_details.product_id, 
            order_details.order_date, 
            order_details.order_update, 
            order_details.payment_method, 
            order_details.total_price AS order_details_total_price, 
            order_details.quantity, 
            order_details.payment_status, 
            product.price, 
            product.product_image, 
            users.customer_id, 
            users.first_name, 
            users.last_name, 
            users.email, 
            users.phone_number, 
            users.street_name, 
            users.region, 
            users.postal_code, 
            order_details.order_status, 
            \`order\`.total_price AS order_total_price, 
            shipment.streetname, 
            shipment.address, 
            shipment.city
        FROM
            \`order\`
        INNER JOIN
            order_details ON \`order\`.order_id = order_details.order_id
        INNER JOIN
            product ON order_details.product_id = product.product_code
        INNER JOIN
            users ON \`order\`.customer_id = users.customer_id
        INNER JOIN
            shipment ON \`order\`.order_id = shipment.order_id
        WHERE
            order_details.order_status <> 'Completed'
        `;

        // Add where clause if status or searchTerm is provided
        const conditions = [];
        if (status) {
            conditions.push('order_details.payment_status = ?');
        }
        if (searchTerm) {
            conditions.push(`(users.first_name LIKE ? OR users.last_name LIKE ? OR \`order\`.order_id LIKE ?)`);
        }

        if (conditions.length) {
            query += ' AND ' + conditions.join(' AND ');
        }

        query += ` ORDER BY \`order\`.order_date DESC LIMIT ? OFFSET ?`;

        const queryParams = [
            ...(status ? [status] : []),
            ...(searchTerm ? [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`] : []),
            pageSize,
            offset
        ];

        const [orders] = await db.query(query, queryParams);

        // Group orders by order_id without recalculating total_price
        const groupedOrders = orders.reduce((acc, order) => {
            if (!acc[order.order_id]) {
                acc[order.order_id] = {
                    order_id: order.order_id,
                    order_date: order.order_date,
                    order_total: order.order_total_price,
                    order_status: order.order_status,
                    order_update: order.order_update,
                    payment_status: order.payment_status,
                    payment_method: order.payment_method,
                    customer_id: order.customer_id,
                    customer_first_name: order.first_name,
                    customer_last_name: order.last_name,
                    customer_email: order.email,
                    customer_phone: order.phone_number,
                    customer_address: {
                        street_name: order.street_name,
                        region: order.region,
                        postal_code: order.postal_code,
                    },
                    shipment: {
                        streetname: order.streetname,
                        address: order.address,
                        city: order.city
                    },
                    products: []
                };
            }
            // Add the current product to the products array
            acc[order.order_id].products.push({
                order_details_id: order.order_details_id,
                payment_date: order.payment_date,
                product_id: order.product_id,
                product_name: order.product_name,
                product_image: order.product_image,
                price: order.price,
                quantity: order.quantity,
                item_total: order.total_price,
                payment_status: order.payment_status,
                payment_method: order.payment_method,
            });

            return acc;
        }, {});

        const ordersArray = Object.values(groupedOrders);


        // If the exportToExcel query parameter is set, generate and send Excel file
        if (exportToExcel === 'true') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Orders');

            // Add column headers
            worksheet.columns = [
                { header: 'Order ID', key: 'order_id', width: 10 },
                { header: 'Customer ID', key: 'customer_id', width: 25 },
                { header: 'Order Date', key: 'order_date', width: 15 },
                { header: 'Order Status', key: 'order_status', width: 15 },
                { header: 'Payment Status', key: 'payment_status', width: 15 },
                { header: 'Payment Method', key: 'payment_method', width: 15 },
                { header: 'Total Price', key: 'total_price', width: 15 },
            ];

            // Add rows
            ordersArray.forEach(order => {
                worksheet.addRow({
                    order_id: order.order_id,
                    customer_id: `${order.customer_id}`,
                    order_date: new Date(order.order_date).toLocaleDateString(),
                    order_status: order.order_status,
                    payment_status: order.payment_status,
                    payment_method: order.payment_method,
                    total_price: order.order_total,
                });
            });

            // Send the Excel file
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

            await workbook.xlsx.write(res);
            res.end();
            return;
        }

        // Send JSON response with orders
        res.json({ orders: ordersArray });

    } catch (error) {
        console.error('Error fetching order history:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});



router.get('/admin-order-history-payment', async (req, res) => {
    try {
        const { status, searchTerm, exportToExcel } = req.query;

        let query = `
        SELECT 
            \`order\`.*, 
            product.product_name, 
            order_details.order_details_id, 
            order_details.product_id, 
            order_details.order_date, 
            order_details.order_update, 
            order_details.payment_method, 
            order_details.total_price AS order_details_total_price, 
	        
            order_details.quantity, 
            order_details.payment_status, 
            product.price, 
            users.customer_id, 
            users.first_name, 
            users.last_name, 
            users.email, 
            users.phone_number, 
            users.street_name, 
            users.region, 
            users.postal_code, 
            order_details.order_status, 
            \`order\`.total_price AS order_total_price
        FROM
            \`order\`
        INNER JOIN order_details ON \`order\`.order_id = order_details.order_id
        INNER JOIN product ON order_details.product_id = product.product_code
        INNER JOIN users ON \`order\`.customer_id = users.customer_id
     
    `;

        // Add where clause if status or searchTerm is provided
        const conditions = [];
        if (status) {
            conditions.push('order_details.payment_status = ?');
        }
        if (searchTerm) {
            conditions.push(`(users.first_name LIKE ? OR users.last_name LIKE ? OR \`order\`.order_id LIKE ?)`);
        }

        if (conditions.length) {
            query += ' AND ' + conditions.join(' AND ');
        }

        query += ` ORDER BY \`order\`.order_date DESC`; // Removed LIMIT and OFFSET

        const queryParams = [
            ...(status ? [status] : []),
            ...(searchTerm ? [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`] : [])
        ];

        const [orders] = await db.query(query, queryParams);

        // Group orders by order_id without recalculating total_price
        const groupedOrders = orders.reduce((acc, order) => {
            if (!acc[order.order_id]) {
                acc[order.order_id] = {
                    order_id: order.order_id,
                    order_date: order.order_date,
                    order_total: order.order_total_price,
                    order_status: order.order_status,
                    order_update: order.order_update,
                    payment_status: order.payment_status,
                    payment_method: order.payment_method,
                    customer_id: order.customer_id,
                    customer_first_name: order.first_name,
                    customer_last_name: order.last_name,
                    customer_email: order.email,
                    customer_phone: order.phone_number,
                    customer_address: {
                        street_name: order.street_name,
                        region: order.region,
                        postal_code: order.postal_code,
                    },
                    products: []
                };
            }
            console.log(order.order_total_price);
            // Add the current product to the products array
            acc[order.order_id].products.push({
                order_details_id: order.order_details_id,
                payment_date: order.payment_date,
                product_id: order.product_id,
                product_name: order.product_name,
                price: order.price,
                quantity: order.quantity,
                item_total: order.total_price,
                payment_status: order.payment_status,
                order_total: acc[order.order_id].order_total,
            });

            return acc;
        }, {});

        const ordersArray = Object.values(groupedOrders);

        // If the exportToExcel query parameter is set, generate and send Excel file
        if (exportToExcel === 'true') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Orders');

            // Add column headers
            worksheet.columns = [
                { header: 'Order ID', key: 'order_id', width: 10 },
                { header: 'Customer ID', key: 'customer_id', width: 25 },
                { header: 'Order Date', key: 'order_date', width: 15 },
                { header: 'Order Status', key: 'order_status', width: 15 },
                { header: 'Payment Status', key: 'payment_status', width: 15 },
                { header: 'Payment Method', key: 'payment_method', width: 15 },
                { header: 'Total Price', key: 'total_price', width: 15 },
            ];

            // Add rows
            ordersArray.forEach(order => {
                worksheet.addRow({
                    order_id: order.order_id,
                    customer_id: `${order.customer_id}`,
                    order_date: new Date(order.order_date).toLocaleDateString(),
                    order_status: order.order_status,
                    payment_status: order.payment_status,
                    payment_method: order.payment_method,
                    total_price: order.order_total,
                });
            });

            // Send the Excel file
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

            await workbook.xlsx.write(res);
            res.end();
            return;
        }

        // Send JSON response with orders
        res.json({ orders: ordersArray });

    } catch (error) {
        console.error('Error fetching order history:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

router.get('/admin-order-history-general', async (req, res) => {
    try {
        const { status, searchTerm, exportToExcel, page = 1 } = req.query;
        const pageSize = 20;  // Define the number of results per page
        const offset = (page - 1) * pageSize;

        // Define the query for fetching order history and newly created products in the last week
        let query = `
       SELECT
    product.product_name, 
    order_details.order_details_id, 
    order_details.product_id, 
    order_details.order_date, 
    order_details.payment_method, 
    order_details.total_price AS order_details_total_price, 
    order_details.quantity AS order_quantity, 
    order_details.payment_status, 
    product.price, 
    order_details.order_status, 
    \`order\`.total_price AS order_total_price, 
    shipment.shipment_id, 
    category.category_name, 
    product.quantity AS product_quantity, 
    \`order\`.order_id, 
    users.customer_id, 
    product.product_code, 
    product.created_at, 
    product.product_update
FROM
    \`order\`.
    INNER JOIN order_details ON \`order\`.order_id = order_details.order_id
    INNER JOIN product ON order_details.product_id = product.product_code
    INNER JOIN users ON \`order\`.customer_id = users.customer_id
    INNER JOIN shipment ON \`order\`.order_id = shipment.order_id
    INNER JOIN category ON product.category_id = category.category_id
UNION ALL
(
   
    SELECT
        product.product_name, 
        NULL AS order_details_id, 
        product.product_code AS product_id, 
        NULL AS order_date, 
        NULL AS payment_method, 
        NULL AS order_details_total_price, 
        NULL AS order_quantity, 
        NULL AS payment_status, 
        product.price, 
        NULL AS order_status, 
        NULL AS order_total_price, 
        NULL AS shipment_id, 
        category.category_name, 
        product.quantity AS product_quantity, 
        NULL AS order_id, 
        product.customer_id, 
        product.product_code, 
        product.created_at, 
        product.product_update
    FROM
        product
        INNER JOIN category ON product.category_id = category.category_id
    WHERE
        product.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
)
ORDER BY
    created_at DESC
LIMIT ? OFFSET ?

        `;

        // Add filters to the query if necessary
        const conditions = [];
        if (status) {
            conditions.push('order_details.payment_status = ?');
        }
        if (searchTerm) {
            conditions.push(`(users.first_name LIKE ? OR users.last_name LIKE ? OR \`order\`.order_id LIKE ?)`);
        }

        if (conditions.length) {
            query = query.replace('ORDER BY created_at DESC', `WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`);
        }

        // Prepare query parameters
        const queryParams = [
            ...(status ? [status] : []),
            ...(searchTerm ? [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`] : []),
            pageSize,
            offset
        ];

        // Execute the query
        const [orders] = await db.query(query, queryParams);

        // Group orders by order_id without recalculating total_price
        const groupedOrders = orders.reduce((acc, order) => {
            if (!acc[order.order_id]) {
                acc[order.order_id] = {
                    order_id: order.order_id,
                    order_date: order.order_date,
                    order_total: order.order_total_price,
                    order_status: order.order_status,
                    order_update: order.order_update,
                    payment_status: order.payment_status,
                    payment_method: order.payment_method,
                    shipment_id: order.shipment_id,
                    customer_id: order.customer_id,
                    customer_first_name: order.first_name,
                    customer_last_name: order.last_name,
                    customer_email: order.email,
                    customer_phone: order.phone_number,
                    customer_address: {
                        street_name: order.street_name,
                        region: order.region,
                        postal_code: order.postal_code,
                    },
                    products: []
                };
            }

            // Add the current product to the products array, including both quantities
            acc[order.order_id].products.push({
                order_details_id: order.order_details_id,
                payment_date: order.payment_date,
                product_id: order.product_id,
                product_name: order.product_name,
                product_code: order.product_code,
                category_name: order.category_name,
                product_quantity: order.product_quantity,
                order_quantity: order.order_quantity,
                price: order.price,
                quantity: order.order_quantity,
                item_total: order.order_details_total_price,
                payment_status: order.payment_status,
                payment_method: order.payment_method,
                product_customer_id: order.product_customer_id,
            });

            return acc;
        }, {});

        const ordersArray = Object.values(groupedOrders);

        // Export to Excel if requested
        if (exportToExcel === 'true') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Orders');

            worksheet.columns = [
                { header: 'Product Code', key: 'product_code', width: 15 },
                { header: 'Product Name', key: 'product_name', width: 30 },
                { header: 'Category', key: 'category_name', width: 20 },
                { header: 'Order Quantity', key: 'order_quantity', width: 15 },
                { header: 'Price', key: 'price', width: 15 },
                { header: 'Total Price', key: 'total_price', width: 15 },
                { header: 'Date', key: 'order_date', width: 20 },
                { header: 'Current Quantity', key: 'current_quantity', width: 15 },
                { header: 'Running Balance', key: 'running_balance', width: 20 },
                { header: 'Order ID', key: 'order_id', width: 10 },
                { header: 'Customer ID', key: 'customer_id', width: 15 },
                { header: 'Shipment ID', key: 'shipment_id', width: 15 },
                { header: 'Payment Status', key: 'payment_status', width: 15 },
            ];

            ordersArray.forEach(order => {
                order.products.forEach(product => {
                    worksheet.addRow({
                        product_code: product.product_code,
                        product_name: product.product_name,
                        category_name: product.category_name,
                        order_quantity: product.order_quantity,
                        price: product.price,
                        total_price: product.item_total,
                        order_date: new Date(order.order_date).toLocaleDateString(),
                        current_quantity: product.product_quantity,
                        running_balance: product.product_quantity - product.order_quantity,
                        order_id: order.order_id,
                        customer_id: `${order.customer_id}`,
                        shipment_id: order.shipment_id,
                        payment_status: product.payment_status,
                    });
                });
            });

            // Send the Excel file
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

            await workbook.xlsx.write(res);
            res.end();
            return;
        }

        // Return the order data in JSON format
        res.json({ orders: ordersArray });

    } catch (error) {
        console.error('Error fetching order history:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});



router.post('/admin-order-payment-export', async (req, res) => {
    try {
        const ordersData = req.body.orders;

        // Log ordersData to check the format and content
        console.log('Received ordersData:', ordersData);


        if (!ordersData || !Array.isArray(ordersData)) {
            return res.status(400).json({ message: 'Invalid data provided for export.' });
        }

        // Proceed with creating the Excel file if data is valid
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders');

        worksheet.columns = [
            { header: 'Order ID', key: 'order_id', width: 10 },
            { header: 'Customer ID', key: 'customer_id', width: 25 },
            { header: 'Payment Date', key: 'order_update', width: 15 },
            { header: 'Payment Method', key: 'payment_method', width: 15 },
            { header: 'Payment Status', key: 'payment_status', width: 15 },
        ];

        // Populate rows with data
        ordersData.forEach(order => {
            worksheet.addRow({
                order_id: order.order_id,
                customer_id: order.customer_id,
                order_update: order.order_update ? new Date(order.order_update).toLocaleDateString() : 'N/A',
                payment_method: order.payment_method,
                payment_status: order.payment_status,

            });

        });

        // Send the Excel file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating Excel file:', error.message);
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
            DATE(order_details.order_date) = CURDATE()
        GROUP BY 
            order_details.order_status;
    `;


        if (status) {
            query += ` AND order_details.order_status = ?`;
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
                Returned: statusCounts['Return/Refund'] || 0,
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
            query += ` WHERE order_details.order_status = ?`;
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
                MONTH(order_date) AS month,      
                COUNT(*) AS completed_sales,     
                SUM(total_price) AS total_sales_amount  
            FROM 
                order_details
            WHERE 
                order_status = 'Completed'        
            GROUP BY 
                MONTH(order_date)                
            ORDER BY 
                MONTH(order_date)               
        `);

        res.json({ insights: rows });
    } catch (error) {
        console.error('Error fetching sales data:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/payment-insight', async (req, res) => {
    try {
        const query = `
            SELECT 
                MONTH(order_date) AS order_month,
                MONTHNAME(order_date) AS month_name,
                COUNT(*) AS completed_orders_count
            FROM 
                order_details
            WHERE 
                order_status = 'Completed' 
                AND payment_status = 'Order Paid'
            GROUP BY 
                MONTH(order_date), MONTHNAME(order_date)
            ORDER BY 
                order_month;
        `;

        const result = await db.query(query);

        const monthlyCounts = Array.isArray(result) && result.length > 0
            ? result[0].map(row => ({
                month: row.month_name, // Use the month_name field
                count: row.completed_orders_count,
            }))
            : [];

        res.json({ monthlyCounts });
    } catch (error) {
        console.error('Error fetching payment insights:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




module.exports = router;