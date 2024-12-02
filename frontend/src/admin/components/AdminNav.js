import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../admin.css';


import logo from '../../assets/img/logo.png'


import { RxDashboard } from "react-icons/rx";
import { IoBagHandleOutline } from "react-icons/io5";
import { MdOutlinePayments } from "react-icons/md";
import { LiaShippingFastSolid } from "react-icons/lia";
import { AiOutlineProduct } from "react-icons/ai";
import { MdOutlineInventory } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { GoGraph } from "react-icons/go";
import { LuHistory } from "react-icons/lu";
import { GrTransaction } from "react-icons/gr";



const AdminNav = () => {
  const roleType = localStorage.getItem('role');
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
          style={{ width: '100px', height: '100px' }}
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
            
            <span><RxDashboard className='mb-1 me-2'/>Dashboard</span>
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
            
            <span><IoBagHandleOutline className='mb-1 me-2'/>Orders</span>
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
            
            <span><MdOutlinePayments className='mb-1 me-2'/>Payments</span>
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
            
            <span><LiaShippingFastSolid className='mb-1 me-2'/>Shipments</span>
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
          
            <span><AiOutlineProduct className='mb-1 me-2'/>Products</span>
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
            
            <span><MdOutlineInventory className='mb-1 me-2'/>Inventory</span>
          )
          }
        </a>

        {roleType === 'Admin' && (
          <a
            href='/admin/manage-users'
            className={location.pathname === '/admin/manage-users' ? 'active' : ''}
          >
            {isMobile ? (
              <i className="bx bxs-user-account" style={{ textAlign: 'center' }}></i>
            ) : (
              <>
                
                <span><FiUsers className='mb-1 me-2'/>Users</span>
              </>
            )}
          </a>
        )}

        <a
          onClick={(e) => {
            e.preventDefault();
            toggleDropdown();
          }}

          className={`dropdown-toggle ${isDropdownOpen ? 'active2' : ''}`}
        >
          
          {!isMobile && <span><HiOutlineDocumentReport   className='mb-1 me-2'/>Reports</span>}
        </a>

        {isDropdownOpen && (
          <div className='dropdown-content'>
            <a
              href='/admin/reports/sales'
              className={location.pathname === '/admin/reports/sales' ? 'active' : ''}
            >
              <GoGraph className='mb-1 me-2'/>
              Sales
            </a>
            <a
              href='/admin/reports/order-history'
              className={
                location.pathname === '/admin/reports/order-history' ? 'active' : ''
              }
            >
              <LuHistory className='mb-1 me-2'/>
              Order History
            </a>
            <a
              href='/admin/reports/transactions'
              className={
                location.pathname === '/admin/reports/transactions' ? 'active' : ''
              }
            >
              <GrTransaction className='mb-1 me-2'/>
              Transactions
            </a>
          </div>
        )}


      </div>
    </div>
  );
};
export default AdminNav;
