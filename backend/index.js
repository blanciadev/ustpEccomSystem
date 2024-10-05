const express = require('express');
const app = express();
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');

// const crypto = require('crypto'); // For generating random tokens

// Angela Port
const PORT = process.env.PORT || 5001;

//Kurt Port
// const PORT = process.env.PORT || 5000;

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
app.use('/', AdminUsersRoutes);

app.use('/', handleLogout);

app.use('/', token);



// DUPLICATE KAG REQUEST SA API GAMIT SAIMO PORT PERO DILI NMO I DILETE ANG ORIGINAL API 
// BANTOG WALA KAI MAKITA NA PITURE KAI ANG API PORT SAYOP

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
