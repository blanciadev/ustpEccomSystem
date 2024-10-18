import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../admin.css';

const AdminNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 769);

  useEffect(() => {

    window.addEventListener('resize', handleResize);
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
    setIsMobile(window.innerWidth <= 769);  // Update state based on screen width
  };

  return (
    <div className='nav-con'>
      <div className='nav-img'>
        <img
          src='https://scontent.fcgy2-2.fna.fbcdn.net/v/t39.30808-6/309663016_472407468238901_2439729538350357694_n.png?_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHkaWoh0NeJOgZZ6d3YXYb1oX31niLe-56hffWeIt77noexsEmKXN3bXRjYsP7inglwvA8imWTOstpqXY8AVb1V&_nc_ohc=f5YixnsisdIQ7kNvgGtmFvf&_nc_zt=23&_nc_ht=scontent.fcgy2-2.fna&_nc_gid=AEQqzBrO4GzSWrnFE7-E_kE&oh=00_AYAfTV-I96cqn2FCrQRTLel7NfNELFSAzsewGkSEwBSmSA&oe=671787EB'
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
