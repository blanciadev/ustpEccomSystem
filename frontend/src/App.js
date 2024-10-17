import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Transactions/Checkout';
import OrderHistory from './pages/Transactions/OrderHistory';
import Dashboard from './admin/Dashboard';
import Shop from './pages/Cart/shop';
import Orders from './admin/pages/Orders';
import Payments from './admin/pages/Payments';
import Shipments from './admin/pages/Shipments';
import Products from './admin/pages/Products';
import Inventory from './admin/pages/Inventory';
import Reports from './admin/pages/Reports';
import Users from './admin/pages/Users';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Verification from './pages/ForgotPassword/Verification';
import ChangePassword from './pages/ForgotPassword/ChangePassword';
import UserProfile from './pages/Transactions/UserProfile';
import ToastNotification from './components/ToastNotification';

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const [loginStatus, setLoginStatus] = useState('');
  const [error, setError] = useState('');

  // Private Route Wrapper (example usage)
  const PrivateRoute = ({ element: Element, ...rest }) => {
    return loginStatus ? <Element {...rest} /> : <Navigate to="/login" replace />;
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/user/purchase" element={<OrderHistory />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/sticky" element={<ToastNotification />} />

          {/* Private Routes (for logged-in users only) */}
          <Route path="/user" element={<PrivateRoute element={UserProfile} />} />
          <Route path="/admin/dashboard" element={<PrivateRoute element={Dashboard} />} />
          <Route path="/admin/orders" element={<PrivateRoute element={Orders} />} />
          <Route path="/admin/payments" element={<PrivateRoute element={Payments} />} />
          <Route path="/admin/shipments" element={<PrivateRoute element={Shipments} />} />
          <Route path="/admin/products" element={<PrivateRoute element={Products} />} />
          <Route path="/admin/inventory" element={<PrivateRoute element={Inventory} />} />
          <Route path="/admin/reports" element={<PrivateRoute element={Reports} />} />
          <Route path="/admin/manage-users" element={<PrivateRoute element={Users} />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
