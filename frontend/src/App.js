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


function App() {
  const [loginStatus, setLoginStatus] = useState('');  // Store login status
  const [error, setError] = useState('');  // Store error message (if any)

  
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
      </Routes>
    </BrowserRouter>



  );
}

export default App;
