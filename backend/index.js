const express = require('express');
const app = express();
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv');
dotenv.config();

// Set your Google Client ID
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Port configuration
const PORT = process.env.PORT || 5001;

// Importing routes
const cartRoutes = require('./routes/cartRoutes');
const customerSignUpRoutes = require('./routes/customerSignUpRoutes');
const customerLoginRoutes = require('./routes/customerLoginRoutes');
const productRoutes = require('./routes/productsRoutes.js');
const OrderRoutes = require('./routes/orderRoutes.js');
const viewTransactionsRoute = require('./routes/viewTransactionsRoute.js');
const userInteraction = require('./routes/userInteraction.js');
const adminOrderHistory = require('./routes/adminOrderHistory.js');
const adminOrderUpdates = require('./routes/adminOrderUpdates.js');
const adminProduct = require('./routes/adminProduct.js');
const adminProductUpdate = require('./routes/adminProductUpdates.js');
const AdminBundleOrder = require('./routes/AdminBundleOrder.js');
const AdminUsersRoutes = require('./routes/AdminUsersRoutes.js');
const token = require('./routes/tokenValidation.js');
const customerData = require('./routes/customerData.js');
const handleLogout = require('./routes/handlelogout.js');
const nodemailer = require('./routes/NodeMailer.js');



app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



const crypto = require('crypto');
const TOKEN_EXPIRATION_TIME = 3600000; // 1 hour

app.post('/verify-token', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    console.error('Token Validation', token);

    const payload = ticket.getPayload();
    const email = payload.email; // Get the email from the payload

    // Query the database to check if the user exists
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      // User exists, retrieve their data
      const user = rows[0];

      // Check if a token already exists for the user
      const [existingTokenRows] = await db.query('SELECT * FROM tokens WHERE user_id = ? AND token_status = ?', [user.customer_id, 'Active']);

      if (existingTokenRows.length > 0) {
        const existingToken = existingTokenRows[0];

        // Check if the token has expired
        const now = new Date();
        if (new Date(existingToken.expires_at) > now) {
          return res.status(200).json({
            message: 'User verified',
            payload: payload,
            status: 'registered',
            token: token,
            user_id: user.customer_id,
            username: user.username,
            first_name: user.first_name,
            role_type: user.role_type,
            profile_img: user.profile_img,
          });
        }

        // If token expired, delete the old token
        await db.query('DELETE FROM tokens WHERE id = ?', [existingToken.id]);
      }


      // Insert the new token into the tokens table with an expiration time
      await db.query('INSERT INTO tokens (user_id, token, token_status, expires_at) VALUES (?, ?, ?, ?)', [
        user.customer_id,
        token,
        'Active',
        new Date(Date.now() + TOKEN_EXPIRATION_TIME),
      ]);


      // Respond with user data and the newly generated token
      return res.status(200).json({
        message: 'User verified',
        payload: payload,
        status: 'registered',
        token: token,
        user_id: user.customer_id,
        username: user.username,
        first_name: user.first_name,
        role_type: user.role_type,
        profile_img: user.profile_img,
      });
    } else {
      // User does not exist
      return res.status(200).json({
        message: 'User not registered',
        payload,
        status: 'unregistered',
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(400).json({ message: 'Invalid token' });
  }
});


app.post('/google-signup', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Google token is required' });
  }

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID, // Ensure this matches your Google OAuth Client ID
    });

    const payload = ticket.getPayload();
    const googleEmail = payload.email;
    const firstName = payload.given_name || '';
    const lastName = payload.family_name || '';

    // Check if the user already exists
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [googleEmail]);

    if (rows.length > 0) {
      const user = rows[0];

      // Check for existing active tokens for this user
      const [activeTokens] = await db.query(
        'SELECT * FROM tokens WHERE user_id = ? AND token_status = ?',
        [user.customer_id, 'Active']
      );

      const now = new Date();
      if (activeTokens.length > 0) {
        const activeToken = activeTokens[0];

        // If the token is still valid, return user details
        if (new Date(activeToken.expires_at) > now) {
          return res.status(200).json({
            message: 'User verified',
            status: 'registered',
            user_id: user.customer_id,
            username: user.username,
            first_name: user.first_name,
            role_type: user.role_type,
            profile_img: user.profile_img,
            token: activeToken.token,
          });
        }

        // Remove expired token
        await db.query('DELETE FROM tokens WHERE id = ?', [activeToken.id]);
      }

      // Insert a new token for the user
      const newToken = generateToken(); // Function to generate a new token
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_TIME);

      await db.query('INSERT INTO tokens (user_id, token, token_status, expires_at) VALUES (?, ?, ?, ?)', [
        user.customer_id,
        newToken,
        'Active',
        expiresAt,
      ]);

      return res.status(200).json({
        message: 'User verified',
        status: 'registered',
        user_id: user.customer_id,
        username: user.username,
        first_name: user.first_name,
        role_type: user.role_type,
        profile_img: user.profile_img,
        token: newToken,
      });
    } else {
      // If user doesn't exist, register a new user
      const [result] = await db.query(
        'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
        [firstName, lastName, googleEmail, null] // Password is null for Google signup
      );

      const newUserId = result.insertId;

      // Create a new token for the newly registered user
      const newToken = generateToken(); // Function to generate a new token
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_TIME);

      await db.query('INSERT INTO tokens (user_id, token, token_status, expires_at) VALUES (?, ?, ?, ?)', [
        newUserId,
        newToken,
        'Active',
        expiresAt,
      ]);

      return res.status(201).json({
        message: 'User registered successfully',
        status: 'registered',
        user_id: newUserId,
        first_name: firstName,
        last_name: lastName,
        email: googleEmail,
        token: newToken, // Include the token in the response
        role_type: 'Customer', // Set default role if applicable
        profile_img: payload.picture || '', // Include profile picture if available
      });
    }
  } catch (error) {
    console.error('Token verification error or signup error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to generate a unique token
function generateToken() {
  return require('crypto').randomBytes(48).toString('hex');
}

// Routes
const routes = [
  cartRoutes, customerSignUpRoutes, customerLoginRoutes, productRoutes,
  OrderRoutes, viewTransactionsRoute, userInteraction, adminOrderHistory,
  adminOrderUpdates, adminProduct, adminProductUpdate, AdminBundleOrder,
  AdminUsersRoutes, token, customerData, handleLogout, nodemailer
];

routes.forEach(route => {
  app.use('/api', route);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


