const express = require('express');
const app = express();
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library'); // Import the Google OAuth client

// Set your Google Client ID
const GOOGLE_CLIENT_ID = '604163930378-hefd54geho5pkurgd149svlovu50j81t.apps.googleusercontent.com'; // Replace with your actual Google Client ID

// Create a new OAuth2 client
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

      // Generate a new random token
      //  const token = crypto.randomBytes(64).toString('hex');

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




// Routes
app.use('/', cartRoutes);
app.use('/', customerSignUpRoutes);
app.use('/', customerLoginRoutes);
app.use('/', productRoutes);
app.use('/', OrderRoutes);
app.use('/', viewTransactionsRoute);
app.use('/', userInteraction);
app.use('/', adminOrderHistory);
app.use('/', adminOrderUpdates);
app.use('/', adminProduct);
app.use('/', adminProductUpdate);
app.use('/', AdminBundleOrder);
app.use('/', customerData);
app.use('/', AdminUsersRoutes);
app.use('/', handleLogout);
app.use('/', token);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
