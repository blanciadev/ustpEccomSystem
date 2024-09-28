import React from 'react';
import { useLocation } from 'react-router-dom';
import '../admin.css';

const AdminNav = () => {
  const location = useLocation();

  return (
    <div className='nav-con'>
      <div className='nav-img'>
        <img
          src='https://i.pinimg.com/736x/91/a3/05/91a30517c00978fd864dedea942f6048.jpg'
          alt='Logo'
        />
      </div>
      <div className='nav-links'>
        <a
          href='/admin/dashboard'
          className={location.pathname === '/admin/dashboard' ? 'active' : ''}
        >
          Dashboard
        </a>
        <a
          href='/admin/orders'
          className={location.pathname === '/admin/orders' ? 'active' : ''}
        >
          Orders
        </a>
        <a
          href='/admin/payments'
          className={location.pathname === '/admin/payments' ? 'active' : ''}
        >
          Payments
        </a>
        <a
          href='/admin/shipments'
          className={location.pathname === '/admin/shipments' ? 'active' : ''}
        >
          Shipments
        </a>
        <a
          href='/admin/products'
          className={location.pathname === '/admin/products' ? 'active' : ''}
        >
          Products
        </a>
        <a
          href='/admin/inventory'
          className={location.pathname === '/admin/inventory' ? 'active' : ''}
        >
          Inventory
        </a>
        <a
          href='/admin/reports'
          className={location.pathname === '/admin/reports' ? 'active' : ''}
        >
          Reports
        </a>
        <a
          href='/admin/manage-users'
          className={location.pathname === '/admin/manage-users' ? 'active' : ''}
        >
          Users
        </a>
      </div>
    </div>
  );
};

export default AdminNav;
