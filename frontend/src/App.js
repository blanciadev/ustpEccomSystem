import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './client/pages/Home';
import Login from './client/pages/Login/Login';
import Signup from './client/pages/Signup/Signup';
import Cart from './client/pages/Cart/Cart';
import Checkout from './client/pages/Transactions/Checkout'
import OrderHistory from './client/pages/Transactions/OrderHistory';
import Dashboard from './admin/Dashboard';

import Shop from './client/pages/Cart/shop';


import Orders from './admin/pages/Orders';
import Payments from './admin/pages/Payments';
import Shipments from './admin/pages/Shipments';
import Products from './admin/pages/Products';
import Inventory from './admin/pages/Inventory';
import Reports from './admin/pages/Reports';

import Users from './admin/pages/Users';

import ForgotPassword from './client/pages/ForgotPassword/ForgotPassword'
import Verification from './client/pages/ForgotPassword/Verification'
import ChangePassword from './client/pages/ForgotPassword/ChangePassword'


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

        <Route path="/cart" element={<Cart/>}/>
        <Route path="/checkout" element={<Checkout/>}/>
        <Route path="/user/purchase" element={<OrderHistory/>}/>
        <Route path='/admin/dashboard' element={<Dashboard/>}></Route>
        <Route path='/admin/orders' element={<Orders/>}></Route>
        <Route path='/admin/payments' element={<Payments/>}></Route>
        <Route path='/admin/shipments' element={<Shipments/>}></Route>
        <Route path='/admin/products' element={<Products/>}></Route>
        <Route path='/admin/inventory' element={<Inventory/>}></Route>
        <Route path='/admin/reports' element={<Reports/>}></Route>
        <Route path='/admin/manage-users' element={<Users/>}></Route>

        
        <Route path='/forgot-password' element={<ForgotPassword/>}></Route>
        <Route path='/verify' element={<Verification/>}></Route>
        <Route path='/change-password' element={<ChangePassword/>}></Route>
        


      </Routes>
    </BrowserRouter>



  );
}

export default App;
