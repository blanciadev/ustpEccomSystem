import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
const Transactions = () => {
  return (
    <div className='dash-con'>
      <AdminNav />
      <div className='dash-board'>
        <div className='dash-header'>
          <div className='header-title'>
            <i className='bx bxs-package'></i>
            <h1>Orders</h1>
          </div>
          <AdminHeader />
        </div>
        <div className='body'>
          <div className='admin-order'>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
