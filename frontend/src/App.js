import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Transactions/Checkout'
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

import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import Verification from './pages/ForgotPassword/Verification'
import ChangePassword from './pages/ForgotPassword/ChangePassword'
import UserProfile from './pages/Transactions/UserProfile';
import ToastNotification from './components/ToastNotification';


function App() {
  const [loginStatus, setLoginStatus] = useState('');
  const [error, setError] = useState('');


  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect any undefined route to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route index element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/user/purchase" element={<OrderHistory />} />
        <Route path='/admin/dashboard' element={<Dashboard />}></Route>
        <Route path='/shop' element={<Shop />}></Route>

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/user/purchase" element={<OrderHistory />} />
        <Route path="/user" element={<UserProfile />} />


        <Route path='/admin/dashboard' element={<Dashboard />}></Route>
        <Route path='/admin/orders' element={<Orders />}></Route>
        <Route path='/admin/payments' element={<Payments />}></Route>
        <Route path='/admin/shipments' element={<Shipments />}></Route>
        <Route path='/admin/products' element={<Products />}></Route>
        <Route path='/admin/inventory' element={<Inventory />}></Route>
        <Route path='/admin/reports' element={<Reports />}></Route>
        <Route path='/admin/manage-users' element={<Users />}></Route>


        <Route path='/forgot-password' element={<ForgotPassword />}></Route>
        <Route path='/verify' element={<Verification />}></Route>
        <Route path='/change-password' element={<ChangePassword />}></Route>

        <Route path='/sticky' element={<ToastNotification />}></Route>


      </Routes>
    </BrowserRouter>



  );
}

export default App;
