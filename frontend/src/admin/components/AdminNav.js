import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../admin.css';

const AdminNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // Get the user's role from localStorage
    const roleType = localStorage.getItem('role');

    // Redirect non-admin users to the home page
    if (roleType !== 'Admin') {
      navigate('/');
    }
    return () => {
        window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);  // Update state based on screen width
  };

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
         {isMobile ? (
            <i class="bx bxs-dashboard"></i>
         ):(
            <i class="bx bxs-dashboard"></i>,
          <span>Dashboard</span>
         )
        }   
        
        </a>
        <a
          href='/admin/orders'
          className={location.pathname === '/admin/orders' ? 'active' : ''}
        >
        {isMobile ? (
            <i class="bx bxs-package"></i>
         ):(
            <i class="bx bxs-package"></i>,
            <span>Orders</span>
         )
        }   
        
        </a>
        <a
          href='/admin/payments'
          className={location.pathname === '/admin/payments' ? 'active' : ''}
        >
        {isMobile ? (
            <i class="bx bxs-wallet"></i>
         ):(
            <i class="bx bxs-wallet"></i>,
            <span>Payments</span>
         )
        } 
        </a>
        <a
          href='/admin/shipments'
          className={location.pathname === '/admin/shipments' ? 'active' : ''}
        >
        {isMobile ? (
            <i class="bx bxs-truck"></i>
         ):(
            <i class="bx bxs-truck"></i>,
            <span>Shipments</span>
         )
        } 
        </a>
        <a
          href='/admin/products'
          className={location.pathname === '/admin/products' ? 'active' : ''}
        >
        {isMobile ? (
            <i class="bx bxs-spa"></i>
         ):(
            <i class="bx bxs-spa"></i>,
            <span>Products</span>
         )
        } 
        </a>
        <a
          href='/admin/inventory'
          className={location.pathname === '/admin/inventory' ? 'active' : ''}
        >
        {isMobile ? (
            <i class="bx bx-clipboard"></i>
         ):(
            <i class="bx bx-clipboard"></i>,
            <span>Inventory</span>
         )
        } 
        </a>
        <a
          href='/admin/reports'
          className={location.pathname === '/admin/reports' ? 'active' : ''}
        >
        {isMobile ? (
            <i class="bx bxs-report"></i>
         ):(
            <i class="bx bxs-report"></i>,
            <span>Reports</span>
         )
        } 
        </a>
        <a
          href='/admin/manage-users'
          className={location.pathname === '/admin/manage-users' ? 'active' : ''}
        >
        {isMobile ? (
            <i class="bx bxs-user-account" style={{textAlign:'center'}}></i>
         ):(
            <i class="bx bxs-user-account"></i>,
            <span>Users</span>
         )
        } 
        </a>
      </div>
    </div>
  );
};

export default AdminNav;
