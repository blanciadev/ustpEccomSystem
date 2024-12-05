const express = require('express');
const app = express();
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv');


app.use(cors());
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
// const AdminUsersRoutes = require('./routes/AdminUsersRoutes.js');
const token = require('./routes/tokenValidation.js');
const customerData = require('./routes/customerData.js');
const handleLogout = require('./routes/handlelogout.js');
const nodemailer = require('./routes/NodeMailer.js');




// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const crypto = require('crypto');
const TOKEN_EXPIRATION_TIME = 3600000;


app.post('/verify-token', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    console.error('Token Validation', token);

    const payload = ticket.getPayload();
    const email = payload.email;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      const user = rows[0];

      const [existingTokenRows] = await db.query('SELECT * FROM tokens WHERE user_id = ? AND token_status = ?', [user.customer_id, 'Active']);

      if (existingTokenRows.length > 0) {
        const existingToken = existingTokenRows[0];

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

        await db.query('DELETE FROM tokens WHERE id = ?', [existingToken.id]);
      }


      await db.query('INSERT INTO tokens (user_id, token, token_status, expires_at) VALUES (?, ?, ?, ?)', [
        user.customer_id,
        token,
        'Active',
        new Date(Date.now() + TOKEN_EXPIRATION_TIME),
      ]);


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
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleEmail = payload.email;
    const firstName = payload.given_name || '';
    const lastName = payload.family_name || '';

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [googleEmail]);

    if (rows.length > 0) {
      const user = rows[0];

      const [activeTokens] = await db.query(
        'SELECT * FROM tokens WHERE user_id = ? AND token_status = ?',
        [user.customer_id, 'Active']
      );

      const now = new Date();
      if (activeTokens.length > 0) {
        const activeToken = activeTokens[0];

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

        await db.query('DELETE FROM tokens WHERE id = ?', [activeToken.id]);
      }


      const newToken = generateToken();
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
      const [result] = await db.query(
        'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
        [firstName, lastName, googleEmail, null]);

      const newUserId = result.insertId;

      const newToken = generateToken();
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
        token: newToken,
        role_type: 'Customer',
        profile_img: payload.picture || '',
      });
    }
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
  token, customerData, handleLogout, nodemailer
  // AdminUsersRoutes,
];

routes.forEach(route => {
  app.use('/api', route);
});

app.use("/", (req, res) => {
  res.send("Server is Running. ");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
