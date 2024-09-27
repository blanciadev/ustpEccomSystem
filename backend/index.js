const express = require('express');
const app = express();
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');

// const crypto = require('crypto'); // For generating random tokens

// Angela Port
// const PORT = process.env.PORT || 5001;

//Kurt Port
const PORT = process.env.PORT || 5000;

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


const customerData = require('./routes/customerData.js');
const handleLogout = require('./routes/handlelogout.js');

app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//routes
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

app.use('/', handleLogout);






// Token validation
app.get('/validate-token', async (req, res) => {
    // Extract token from 'Authorization' header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Validate token and fetch associated customer information
        const [rows] = await db.query(`
            SELECT c.first_name, c.last_name, c.email
            FROM tokens t
            JOIN customer c ON t.user_id = c.customer_id
            WHERE t.token = ?
              AND t.expires_at > NOW()
        `, [token]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const customer = rows[0];
        res.json({
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email
        });
    } catch (err) {
        console.error('Error during token validation:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
