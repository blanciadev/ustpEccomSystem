import './App.css';
import './transition.css'
import React, { useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

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
import Settings from './admin/pages/Settings';

function App() {
  const [loginStatus, setLoginStatus] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        classNames="fade"
        timeout={300}
      >
        <Routes location={location}>
          {/* Redirect any undefined route to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route index element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/user/purchase" element={<OrderHistory />} />
          <Route path='/admin/dashboard' element={<Dashboard />} />
          <Route path='/shop' element={<Shop />} />
          <Route path='/admin/orders' element={<Orders />} />
          <Route path='/admin/payments' element={<Payments />} />
          <Route path='/admin/shipments' element={<Shipments />} />
          <Route path='/admin/products' element={<Products />} />
          <Route path='/admin/inventory' element={<Inventory />} />
          <Route path='/admin/reports' element={<Reports />} />
          <Route path='/admin/manage-users' element={<Users />} />
          <Route path='/admin/profile' element={<Settings />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/verify' element={<Verification />} />
          <Route path='/change-password' element={<ChangePassword />} />
          <Route path='/sticky' element={<ToastNotification />} />
          <Route path="/user" element={<UserProfile />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

export default App;
