import './App.css';
import './transition.css';
import React, { useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Home from './public/pages/Home';
import Login from './public/pages/Login';
import Signup from './public/pages/Signup';

import ForgotPassword from './public/pages/ForgotPassword/ForgotPassword';
import Verification from './public/pages/ForgotPassword/Verification';
import ChangePassword from './public/pages/ForgotPassword/ChangePassword';

import Cart from './client/pages/Cart/Cart';
import Checkout from './client/pages/Transactions/Checkout';
import OrderHistory from './client/pages/Transactions/OrderHistory';
import Shop from './client/pages/Cart/shop';
import UserProfile from './client/pages/Transactions/UserProfile';

import Dashboard from './admin/Dashboard';
import Orders from './admin/pages/Orders';
import Payments from './admin/pages/Payments';
import Shipments from './admin/pages/Shipments';
import Products from './admin/pages/Products';
import Inventory from './admin/pages/Inventory';
import Reports from './admin/pages/Reports';
import Users from './admin/pages/Users';
import Settings from './admin/pages/Settings';
import Sales from './admin/pages/Sales';
import Transactions from './admin/pages/Transaction';
import AdminHistory from './admin/pages/AdminHistory';

function App() {
  const [loginStatus, setLoginStatus] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="fade" timeout={300}>
        <Routes location={location}>
          {/* Define Routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route index element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/user/purchase" element={<OrderHistory />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/payments" element={<Payments />} />
          <Route path="/admin/shipments" element={<Shipments />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/inventory" element={<Inventory />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/manage-users" element={<Users />} />
          <Route path="/admin/profile" element={<Settings />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/admin/reports/sales" element={<Sales />} />
          <Route path="/admin/reports/order-history" element={<AdminHistory />} />
          <Route path="/admin/reports/transactions" element={<Transactions />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

export default App;
