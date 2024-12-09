const express = require('express');
const app = express();
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');


app.use(cors());
dotenv.config();

// Set your Google Client ID
const GOOGLE_CLIENT_ID = '604163930378-hefd54geho5pkurgd149svlovu50j81t.apps.googleusercontent.com';
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
const adminUsersRoutes = require('./routes/adminUsersRoutes.js');
const token = require('./routes/tokenValidation.js');
const customerData = require('./routes/customerData.js');
const handleLogout = require('./routes/handlelogout.js');
const nodemailer = require('./routes/NodeMailer.js');




// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const crypto = require('crypto');
const TOKEN_EXPIRATION_TIME = 5400000;
app.post('/api/verify-token', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    console.log('Google token verified. User payload:', payload);

    // Query the database for the user
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      const user = rows[0];

      // Check for and delete any existing active token for the user
      await db.query('DELETE FROM tokens WHERE user_id = ? AND token_status = ?', [user.customer_id, 'Active']);
      console.log('Existing active token deleted.');

      // Generate a new token
      const newToken = crypto.randomBytes(64).toString('hex');

      // Insert new token into the tokens table
      await db.query('INSERT INTO tokens (user_id, token, token_status, expires_at) VALUES (?, ?, ?, ?)', [
        user.customer_id,
        newToken,
        'Active',
        new Date(Date.now() + TOKEN_EXPIRATION_TIME),
      ]);

      return res.status(200).json({
        status: 'registered',
        payload: {
          user_id: user.customer_id,
          username: user.username,
          first_name: user.first_name,
          role_type: user.role_type,
          profile_img: user.profile_img,
        },
        token: newToken,
      });
    } else {
      // User does not exist, return unregistered status
      return res.status(200).json({
        status: 'unregistered',
        payload: { email, name, picture },
      });
    }
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(500).json({ message: 'Failed to verify token' });
  }
});

app.post('/api/google-signup', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    console.log('No token provided');
    return res.status(400).json({ message: 'Google token is required' });
  }

  try {
    console.log('Verifying Google token...');
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleEmail = payload.email;
    const firstName = payload.given_name || '';
    const lastName = payload.family_name || '';

    console.log(`Google token verified for email: ${googleEmail}`);

    // Check if the user exists in the database
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [googleEmail]);

    let responsePayload = {};

    if (rows.length > 0) {
      const user = rows[0];
      console.log(`User found in database: ${googleEmail}`);

      // Check for existing active token for this user and delete it if it exists
      await db.query('DELETE FROM tokens WHERE user_id = ? AND token_status = ?', [user.customer_id, 'Active']);
      console.log('Existing active token deleted.');

      // Generate a new token
      const newToken = generateToken();
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_TIME);

      // Insert new token into the tokens table
      await db.query('INSERT INTO tokens (user_id, token, token_status, expires_at) VALUES (?, ?, ?, ?)', [
        user.customer_id,
        newToken,
        'Active',
        expiresAt,
      ]);

      responsePayload = {
        message: 'User verified',
        status: 'registered',
        user_id: user.customer_id,
        username: user.username,
        first_name: user.first_name,
        role_type: user.role_type,
        profile_img: user.profile_img,
        token: newToken,
      };

    } else {
      console.log(`User not found. Registering new user: ${googleEmail}`);

      const defaultPassword = 'password';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const [result] = await db.query(
        'INSERT INTO users (first_name, last_name, email, password, role_type) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, googleEmail, hashedPassword, 'Customer']
      );

      const newUserId = result.insertId;
      console.log(`New user created with ID: ${newUserId}`);

      const newToken = generateToken();
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_TIME);

      // Insert the new token into the tokens table
      await db.query('INSERT INTO tokens (user_id, token, token_status, expires_at) VALUES (?, ?, ?, ?)', [
        newUserId,
        newToken,
        'Active',
        expiresAt,
      ]);

      console.log('New user successfully registered and token generated.');

      responsePayload = {
        message: 'User registered successfully',
        status: 'registered',
        user_id: newUserId,
        first_name: firstName,
        last_name: lastName,
        email: googleEmail,
        token: newToken,
        role_type: 'Customer',
        profile_img: payload.picture || '',
      };
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Token verification error or signup error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


function generateToken() {
  return require('crypto').randomBytes(48).toString('hex');
}

// Routes
const routes = [
  cartRoutes, customerSignUpRoutes, customerLoginRoutes, productRoutes,
  OrderRoutes, viewTransactionsRoute, userInteraction, adminOrderHistory,
  adminOrderUpdates, adminProduct, adminProductUpdate, AdminBundleOrder,
  token, customerData, handleLogout, nodemailer,
  adminUsersRoutes
];

routes.forEach(route => {
  app.use('/api', route);
});

app.use("/", (req, res) => {
  res.send("Server is Running. ");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


