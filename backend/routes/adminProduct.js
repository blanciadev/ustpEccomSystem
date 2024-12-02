const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');


router.get('/admin-products-inventory', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.product_id, p.product_code, p.product_name, p.price, p.description, p.quantity, c.category_name, p.product_image
            FROM product p
            INNER JOIN category c ON p.category_id = c.category_id
        `);

        if (req.query.export === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Products');

            worksheet.columns = [
                { header: 'Product ID', key: 'product_id', width: 15 },
                { header: 'Product Code', key: 'product_code', width: 20 },
                { header: 'Product Name', key: 'product_name', width: 30 },
                { header: 'Price', key: 'price', width: 15 },
                { header: 'Description', key: 'description', width: 40 },
                { header: 'Quantity', key: 'quantity', width: 10 },
                { header: 'Category', key: 'category_name', width: 20 },
                { header: 'Product Image', key: 'product_image', width: 30 },
            ];

            rows.forEach(row => {
                worksheet.addRow(row);
            });

            worksheet.getRow(1).font = { bold: true };

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');

            await workbook.xlsx.write(res);

            res.end();
        } else {
            res.json(rows);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});


router.get('/admin-products-with-interaction', async (req, res) => {
    try {

        const LOW_STOCK_THRESHOLD = 10;
        const LOW_INTERACTION_THRESHOLD = 1;

        const [[{ total }]] = await db.query(`
            SELECT COUNT(DISTINCT p.product_code) AS total
            FROM product AS p
            INNER JOIN user_product_interactions AS upi
            ON p.product_code = upi.product_code
            WHERE upi.interaction_type = 'cart'
            AND upi.interaction_timestamp >= NOW() - INTERVAL 30 DAY
        `);

        const [products] = await db.query(`
            SELECT DISTINCT p.product_name
            FROM product AS p
            INNER JOIN user_product_interactions AS upi
            ON p.product_code = upi.product_code
            WHERE upi.interaction_type = 'cart'
            AND upi.interaction_timestamp >= NOW() - INTERVAL 30 DAY
        `);

        const [[{ totalQuantity }]] = await db.query(`
            SELECT SUM(quantity) AS totalQuantity
            FROM product
        `);

        const [[{ lowStockCount }]] = await db.query(`
            SELECT COUNT(*) AS lowStockCount
            FROM product
            WHERE quantity <= ?
        `, [LOW_STOCK_THRESHOLD]);

        const [[{ lowStockQuantity }]] = await db.query(`
            SELECT SUM(quantity) AS lowStockQuantity
            FROM product
            WHERE quantity <= ?
        `, [LOW_STOCK_THRESHOLD]);

        const [unpopularProducts] = await db.query(`
            SELECT p.product_name
            FROM product AS p
            LEFT JOIN user_product_interactions AS upi
            ON p.product_code = upi.product_code
            WHERE upi.interaction_type IS NULL 
            OR upi.interaction_type = 'view'
        `);

        const [[{ outOfStockCount }]] = await db.query(`
            SELECT COUNT(*) AS outOfStockCount
            FROM product
            WHERE quantity = 0
        `);

        const [[{ outOfStockQuantity }]] = await db.query(`
            SELECT SUM(quantity) AS outOfStockQuantity
            FROM product
            WHERE quantity = 0
        `);

        const [[{ discontinuedCount }]] = await db.query(`
            SELECT COUNT(*) AS discontinuedCount
            FROM product
            WHERE product_status = 'discontinued'
        `);

        const [[{ discontinuedQuantity }]] = await db.query(`
            SELECT SUM(quantity) AS discontinuedQuantity
            FROM product
            WHERE product_status = 'discontinued'
        `);

        res.json({
            total,
            totalQuantity,
            products: products.map(product => product.product_name),
            lowStockCount,
            lowStockQuantity,
            unpopularProducts: unpopularProducts.map(product => product.product_name),
            outOfStockCount,
            outOfStockQuantity,
            discontinuedCount,
            discontinuedQuantity
        });
    } catch (error) {
        console.error('Error fetching products data:', error);
        res.status(500).send('Error fetching products');
    }
});


router.get('/top-products', async (req, res) => {
    try {
        const MAX_PROGRESS = 100;
        const [topProducts] = await db.query(`
            SELECT
                p.product_code AS id, 
                p.product_name AS product, 
                p.quantity AS available_quantity, 
                COALESCE(SUM(od.quantity), 0) AS cart_quantity,
                p.product_image
            FROM
                product AS p
            LEFT JOIN
                order_details AS od ON p.product_code = od.product_id
            LEFT JOIN
                user_product_interactions AS upi ON p.product_code = upi.product_code AND upi.interaction_type = 'Cart' 
            GROUP BY
                p.product_code, 
                p.product_name, 
                p.quantity, 
                p.product_image
            ORDER BY
                cart_quantity DESC
            LIMIT 4;
        `);

        // Send response with top products data
        res.json({
            products: topProducts.map(product => {
                const progress = product.available_quantity > 0
                    ? Math.min((product.cart_quantity / product.available_quantity) * MAX_PROGRESS, MAX_PROGRESS)
                    : 0;

                return {
                    id: product.id,
                    product: product.product,
                    interaction_count: progress,
                    available_quantity: product.available_quantity,
                    cart_quantity: product.cart_quantity,
                    product_image: product.product_image
                };
            })
        });
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).send('Error fetching top products');
    }
});



router.get('/shipments', async (req, res) => {
    console.log('Received request to fetch all shipments.');

    try {

        const [shipments] = await db.query('SELECT * FROM shipment');

        if (shipments.length === 0) {
            console.log('No shipments found.');
            return res.status(404).json({ error: 'No shipments found' });
        }


        if (req.query.export === 'true') {
            console.log('Preparing to export shipments to Excel.');

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Shipments');

            worksheet.columns = [
                { header: 'Shipment ID', key: 'shipment_id', width: 15 },
                { header: 'Order ID', key: 'order_id', width: 15 },
                { header: 'Shipment Date', key: 'shipment_date', width: 20 },
                { header: 'Address', key: 'address', width: 30 },
                { header: 'City', key: 'city', width: 20 },
                { header: 'Phone Number', key: 'phoneNumber', width: 15 },
                { header: 'Postal Code', key: 'postalCode', width: 15 },
                { header: 'Shipment Status', key: 'shipment_status', width: 20 },
            ];


            shipments.forEach(shipment => {
                worksheet.addRow({
                    shipment_id: shipment.shipment_id,
                    order_id: shipment.order_id,
                    shipment_date: shipment.shipment_date,
                    address: shipment.address,
                    city: shipment.city,
                    phoneNumber: shipment.phoneNumber,
                    postalCode: shipment.postalCode,
                    shipment_status: shipment.shipment_status,
                });
            });


            res.setHeader('Content-Disposition', 'attachment; filename=shipments.xlsx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            // Write the Excel file to the response
            await workbook.xlsx.write(res);
            return res.end();
        }

        console.log('Retrieved shipments:', shipments);
        res.status(200).json({ shipments });
    } catch (error) {
        console.error('Error retrieving shipments:', error.message);
        res.status(500).json({ error: 'Failed to retrieve shipments. Please try again.' });
    }
});

// Route to get today's sales
router.get('/sales-for-today', async (req, res) => {
    try {
        const query = `
            SELECT
                COUNT(order_details.order_id) AS total_completed_orders, 
                SUM(order_details.total_price) AS total_completed_sales, 
                SUM(order_details.quantity) AS total_products_sold
            FROM
                order_details
            WHERE
                order_details.order_status = 'Completed' 
                AND DATE(order_details.order_date) = CURDATE();
        `;

        // Execute the query without a callback, as it returns a promise
        const [results] = await db.execute(query);

        // Ensure salesData is an object
        const salesData = results[0] || {};
        res.json({
            total_sales: salesData.total_completed_sales || 0,
            total_orders: salesData.total_completed_orders || 0,
            total_products_sold: salesData.total_products_sold || 0,
        });
    } catch (error) {
        console.error('Error retrieving sales data:', error.message);
        res.status(500).json({ error: 'Failed to retrieve sales data. Please try again.' });
    }
});


// Route to get product reports per month
router.get('/product-reports-per-month', async (req, res) => {
    try {
        const query = `
       SELECT
    product.product_code, 
    product.product_name, 
    SUM(order_details.quantity) AS total_quantity,  
    SUM(order_details.total_price) AS total_amount,
    (SUM(order_details.quantity) * SUM(order_details.total_price)) AS total_sales, 
    DATE_FORMAT(order_details.order_date, '%b %Y') AS period
    FROM 
        order_details
    JOIN 
        product ON order_details.product_id = product.product_code
    WHERE 
        order_details.order_status = 'Completed'
    GROUP BY 
        period, product.product_code, product.product_name
    ORDER BY 
        period DESC;

        `;

        const [results] = await db.execute(query);

        res.json({
            data: results
        });
    } catch (error) {
        console.error('Error retrieving product reports:', error.message);
        res.status(500).json({ error: 'Failed to retrieve product reports. Please try again.' });
    }
});

// Route to receive product reports data and generate Excel file
router.post('/product-reports-export', async (req, res) => {
    try {
        const { month, year, data } = req.body;

        if (!month || !year || !data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ error: 'Month, year, and valid data are required.' });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Product Report');

        worksheet.columns = [
            { header: 'Period', key: 'period', width: 15 },
            { header: 'Product Code', key: 'product_code', width: 15 },
            { header: 'Product Name', key: 'product_name', width: 25 },
            { header: 'Total Quantity', key: 'total_quantity', width: 15 },
            { header: 'Total Sales (PHP)', key: 'total_sales', width: 20 },
        ];

        data.forEach(result => {
            worksheet.addRow({
                period: result.period,
                product_code: result.product_code,
                product_name: result.product_name,
                total_quantity: result.total_quantity,
                total_sales: parseFloat(result.total_sales).toFixed(2), // Format sales to two decimal places
            });
        });


        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=product-report-${month}-${year}.xlsx`
        );

        // Write the workbook to the response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error generating product report:', error.message);
        res.status(500).json({ error: 'Failed to generate product report. Please try again.' });
    }
});




module.exports = router;
