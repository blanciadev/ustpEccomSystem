const express = require('express');
const app = express();
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');

const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file


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

app.use(cors({
    origin: 'REACT_APP_API_URL=http://localhost:3000/', // Specify your frontend domain
    credentials: true,
}));

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


// Middleware
app.use(cors({
    origin: 'http://your-frontend-domain.com', // Specify your frontend domain
    credentials: true,
  }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Passport configuration
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    // Save user profile to the database or find existing user
    try {
      // Implement user saving logic here
      return done(null, profile);
    } catch (error) {
      return done(error, null);
    }
  }));
  
  // Authentication routes
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => res.redirect('/')
  );
  
  app.get('/logout', (req, res) => {
    req.logout(err => {
      if (err) return next(err);
      res.redirect('/');
    });
  });
  
  // Route to check if user is logged in
  app.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
