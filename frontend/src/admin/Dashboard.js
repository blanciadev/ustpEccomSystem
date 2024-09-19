import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './admin.css'
import AdminNav from './components/AdminNav'
import OrderSummary from './components/OrderSummary'
import CustomerInsight from './components/CustomerInsight'
import SalesOrders from './components/SalesOrders'
import PaymentInsight from './components/PaymentInsight';
import AverageOrders from './components/AverageOrders';
import OrderProcessing from './components/OrderProcessing';
import TopProduct from './components/TopProduct';
import AdminHeader from './components/AdminHeader';


const Dashboard = () => {
  return (
    <div className='dash-con'>
        <AdminNav/>
        <div className='dash-board'>
            <div className='dash-header'>
                <div className='header-title'>
                    <i class='bx bxs-dashboard' ></i>
                    <h1>Dashboard</h1>
                </div>

                <AdminHeader/>

                <div className='header-user'>
                    <div className='noti'>
                        <div className='bell-con'>
                            <i class='bx bxs-bell-ring'></i>
                        </div>
                    </div>
                    <div className='admin-profile'>
                        <img src='https://t3.ftcdn.net/jpg/06/17/13/26/360_F_617132669_YptvM7fIuczaUbYYpMe3VTLimwZwzlWf.jpg'/>
                        
                        <Dropdown>
                        <Dropdown.Toggle as="p" variant='link' className='admin-text'>
                                Ma. Leonille Therese D. Silfavan {/* Admin Name */}
                        </Dropdown.Toggle>

                        <Dropdown.Menu style={{marginTop: '22px'}}>
                        <Dropdown.Item href='#/profile'>Profile</Dropdown.Item>
                        <Dropdown.Item href='#/settings'>Settings</Dropdown.Item>
                        <Dropdown.Item href='#/logout'>Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                        
                    </div>
                </div>

            </div>
            <div className='dash-body'>

                <div className='col-one'>
                    <OrderSummary/>
                    <CustomerInsight/>
                    <SalesOrders/>
                </div>
                <div className='col-two'>
                    <PaymentInsight/>
                    <div className='two-col'>
                        <AverageOrders/>
                        <OrderProcessing/>
                    </div>
                    <TopProduct/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Dashboard