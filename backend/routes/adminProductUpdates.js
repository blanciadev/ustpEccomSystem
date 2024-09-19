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
router.post('/add-product', upload.single('image'), async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file info:', req.file);

        const { productName, description, category, price, quantity, expirationDate, size } = req.body;

        let compressedImage = null;
        if (req.file) {
            // Compress the image using sharp
            compressedImage = await sharp(req.file.buffer)
                .resize(800) // Resize to 800px wide (adjust as needed)
                .jpeg({ quality: 80 }) // Compress the image with 80% quality (adjust as needed)
                .toBuffer();
        }

        console.log('Product details:');
        console.log('Name:', productName);
        console.log('Description:', description);
        console.log('Category ID:', category);
        console.log('Price:', price);
        console.log('Quantity:', quantity);
        console.log('Expiration Date:', expirationDate);
        console.log('Size:', size);
        console.log('Image data size:', compressedImage ? compressedImage.length : 'No image');

        // Generate unique product code
        const productCode = await generateProductCode();
        console.log('Generated product code:', productCode);

        const query = `
            INSERT INTO product (product_name, description, category_id, price, quantity, expiration_date, product_image, product_code, size)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [productName, description, category, price, quantity, expirationDate, compressedImage, productCode, size];

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

module.exports = router;
