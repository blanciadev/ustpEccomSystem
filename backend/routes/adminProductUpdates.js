const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const sharp = require('sharp');

// Set up multer for file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to generate a unique product code
const generateProductCode = async () => {
    const query = `SELECT MAX(CAST(SUBSTRING(product_code, 2) AS UNSIGNED)) AS maxCode FROM product WHERE product_code LIKE 'P%'`;
    const [rows] = await db.query(query);

    const maxCode = rows[0].maxCode || 0;
    const newCode = `P${String(maxCode + 1).padStart(3, '0')}`;

    return newCode;
};

// Route to add a product
router.post('/add-product', async (req, res) => {
    try {
        console.log('Request body:', req.body);

        const { productName, description, category, price, quantity, expirationDate, size, imageURL } = req.body;

        // Log all the product details for debugging
        console.log('Product details:');
        console.log('Name:', productName);
        console.log('Description:', description);
        console.log('Category ID:', category);
        console.log('Price:', price);
        console.log('Quantity:', quantity);
        console.log('Expiration Date:', expirationDate);
        console.log('Size:', size);
        console.log('Image URL:', imageURL); // Ensure image URL is correctly logged

        // Generate unique product code
        const productCode = await generateProductCode();
        console.log('Generated product code:', productCode);

        // SQL query to insert product data into the database, including the image URL
        const query = `
            INSERT INTO product (product_name, description, category_id, price, quantity, expiration_date, product_code, size, product_image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [productName, description, category, price, quantity, expirationDate, productCode, size, imageURL];

        console.log('Executing query:', query);
        console.log('With values:', values);

        await db.query(query, values);

        console.log('Product added successfully');
        res.status(200).send('Product added successfully');
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Error adding product');
    }
});



// Route to get product categories
router.get('/product-category', async (req, res) => {
    try {
        let query = `
        SELECT
            category.category_id, 
            category.category_name
        FROM
            category
        `;

        const [rows] = await db.query(query);
        // Respond with product categories
        res.json(rows);
        console.error('output', rows);
    } catch (error) {
        console.error('Error fetching product categories:', error);
        res.status(500).send('Error fetching product categories');
    }
});

router.put('/admin-update-products/:product_code', async (req, res) => {
    const { product_code } = req.params;
    const updateData = req.body;

    console.log(`Received request to update product with code: ${product_code}`);

    // SQL query with parameter placeholders
    const query = `
        UPDATE products
        SET
            product_name = COALESCE(NULLIF($1, ''), product_name),
            description = COALESCE(NULLIF($2, ''), description),
            category_id = COALESCE(NULLIF($3, ''), category_id),
            price = COALESCE(NULLIF($4, ''), price),
            quantity = COALESCE(NULLIF($5, ''), quantity)
        WHERE product_code = $6;
    `;

    // Extract values from the updateData object
    const values = [
        updateData.product_name,
        updateData.description,
        updateData.category_id,
        updateData.price,
        updateData.quantity,
        product_code
    ];

    try {
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            console.log(`Product with code: ${product_code} not found for update`);
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log(`Product with code: ${product_code} updated successfully`);
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error(`Error updating product details for code: ${product_code}`, error);
        res.status(500).json({ message: 'Server Error' });
    }
});


router.get('/admin-products', async (req, res) => {
    try {
        // Fetch all products and their categories
        const [rows] = await db.query(`
            SELECT p.product_id, p.product_code, p.product_name, p.price ,p.description, p.quantity, c.category_name, p.product_image
            FROM product p
            INNER JOIN category c ON p.category_id = c.category_id
        `);

        // Respond with product details including categories
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});


module.exports = router;
