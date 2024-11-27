import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../admin.css';


import logo from '../../assets/img/logo.png'

const AdminNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 769);
  const [isDropdownOpen, setIsDropdownOpen] = useState(
    JSON.parse(localStorage.getItem('isDropdownOpen')) || false
  );

  useEffect(() => {

    window.addEventListener('resize', handleResize);
    const roleType = localStorage.getItem('role');


    if (roleType !== 'Admin') {
      navigate('/');
    }
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 769);
  };

  const toggleDropdown = () => {
    const newDropdownState = !isDropdownOpen;
    setIsDropdownOpen(newDropdownState);
    localStorage.setItem('isDropdownOpen', JSON.stringify(newDropdownState)); 
  }
  return (
    <div className='nav-con mt-4 mb-4 '>

      <div className='nav-img mt-4 mb-4'>
        <img
          src={logo}
          alt='Logo'
          style={{width: '100px', height: '100px'}}
          className='mb-4'
        />
      </div>
      <div className='nav-links'>
        <a
          href='/admin/dashboard'
          className={location.pathname === '/admin/dashboard' ? 'active' : ''}
        >
          {isMobile ? (
            <i class="bx bxs-dashboard"></i>
          ) : (
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
          ) : (
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
          ) : (
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
          ) : (
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
          ) : (
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
          ) : (
            <i class="bx bx-clipboard"></i>,
            <span>Inventory</span>
          )
          }
        </a>

        <a
          href='/admin/manage-users'
          className={location.pathname === '/admin/manage-users' ? 'active' : ''}
        >
          {isMobile ? (
            <i class="bx bxs-user-account" style={{ textAlign: 'center' }}></i>
          ) : (
            <i class="bx bxs-user-account"></i>,
            <span>Users</span>
          )
          }
        </a>

        <a
          onClick={(e) => {
            e.preventDefault();
            toggleDropdown();
          }}
          
          className={`dropdown-toggle ${isDropdownOpen  ? 'active2' : ''}`}
        >
          <i className='bx bxs-report'></i>
          {!isMobile && <span>Reports</span>}
        </a>

        {isDropdownOpen && (
          <div className='dropdown-content'>
            <a
              href='/admin/reports/sales'
              className={location.pathname === '/admin/reports/sales' ? 'active' : ''}
            >
              <i class='bx bx-line-chart'></i>
              Sales
            </a>
            <a
              href='/admin/reports/order-history'
              className={
                location.pathname === '/admin/reports/order-history' ? 'active' : ''
              }
            >
              <i class='bx bx-history' ></i>
              Order History
            </a>
            <a
              href='/admin/reports/transactions'
              className={
                location.pathname === '/admin/reports/transactions' ? 'active' : ''
              }
            >
              <i class='bx bx-transfer-alt' ></i>
              Transactions
            </a>
          </div>
        )}

        
      </div>
    </div>
  );
};
export default AdminNav;
