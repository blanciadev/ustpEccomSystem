const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');



// Set up Multer to store images in memory
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        console.log('File type validation:', {
            mimetype: file.mimetype,
            extname: path.extname(file.originalname),
        });

        if (mimetype && extname) {
            console.log('Valid file type detected:', file.originalname);
            return cb(null, true);
        }
        console.error('Invalid file type:', file.mimetype, file.originalname);
        cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'));
    },
});

// Profile image upload endpoint
router.post('/upload-profile-image', upload.single('profile_img'), async (req, res) => {
    console.log('--- New Upload Request ---');
    const { customer_id } = req.query;

    // Log customer ID and request details
    console.log('Upload request received:', {
        customer_id: customer_id,
        timestamp: new Date().toISOString(),
        headers: req.headers,
        queryParams: req.query,
    });

    // Check if a file is uploaded
    if (!req.file) {
        console.error('No file uploaded. Returning 400 response.');
        return res.status(400).send({ error: 'No file uploaded.' });
    }

    // Debug file info
    console.log('Uploaded file details:', {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
    });

    // Validate if the file is too small
    if (req.file.size < 1000) {
        console.error('File is too small or possibly corrupted. Returning 400 response.');
        return res.status(400).send({ error: 'File too small or possibly corrupted.' });
    }

    try {
        // Log processing the image for DB insertion
        console.log('Processing the uploaded image for customer ID:', customer_id);

        // Directly use the image buffer from multer
        const imageBuffer = req.file.buffer;

        // Log the buffer size to ensure it's valid
        console.log('Image buffer size:', imageBuffer.length);

        // Insert image into MySQL as LONG BLOB
        const sql = 'UPDATE users SET profile_img = ? WHERE customer_id = ?';
        console.log('Executing SQL query:', sql);

        // Perform the database update
        db.query(sql, [imageBuffer, customer_id], (err, result) => {
            if (err) {
                console.error('Database update failed:', {
                    error: err.message,
                    stack: err.stack,
                });
                return res.status(500).send({ error: 'Database update failed.' });
            }

            // Log success and DB result
            console.log('Profile image updated successfully for customer ID:', customer_id);
            console.log('Database response:', result);

            res.status(200).send({ message: 'Profile image updated successfully.' });
        });
    } catch (error) {
        console.error('Error during image processing or database update:', {
            error: error.message,
            stack: error.stack,
        });
        res.status(500).send({ error: 'Failed to upload image.' });
    }
});








router.post('/customer-insight', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) AS user_count
            FROM 
                tokens
            WHERE 
                created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
                AND created_at < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
        `);

        res.json({ insights: rows });
    } catch (error) {
        console.error('Error fetching customer insights:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/get-customer-details', async (req, res) => {
    const customerId = req.params.customer_id;

    try {
        const [rows] = await db.query('SELECT COUNT(*) AS itemCount FROM cart WHERE customer_id = ?', [customerId]);
        res.json({ itemCount: rows[0].itemCount });
    } catch (error) {
        console.error('Error fetching cart item count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/users-details', (req, res) => {
    const { customer_id } = req.body;
    const sql = 'SELECT * FROM users WHERE customer_id = ?';
  
    db.query(sql, [customer_id], (err, result) => {
      // Handle database errors
      if (err) {
        console.error('Database query error:', err); // Log the error for debugging
        return res.status(500).send({ error: 'Error fetching user details.' });
      }
  
      // Check if user was found
      if (result.length === 0) {
        return res.status(404).send({ error: 'User not found.' });
      }
  
      // Convert the profile_img from BLOB to Base64 if it exists
      if (result[0].profile_img) {
        // Ensure profile_img is a Buffer before conversion
        if (Buffer.isBuffer(result[0].profile_img)) {
          const profileImgBase64 = result[0].profile_img.toString('base64'); // Convert to Base64
          result[0].profile_img = profileImgBase64;
        } else {
          console.warn('Profile image is not a Buffer:', result[0].profile_img);
          result[0].profile_img = null; // Set to null if it's not in the expected format
        }
      } else {
        result[0].profile_img = null; // Fallback if no image is found
      }
  
      // Log the final user details to debug
      console.log('User Details:', result[0]);
  
      // Return user details
      res.status(200).send(result[0]);
    });
  });
  


module.exports = router;
