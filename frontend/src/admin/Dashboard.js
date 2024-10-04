import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './admin.css';
import AdminNav from './components/AdminNav';
import OrderSummary from './components/OrderSummary';
import CustomerInsight from './components/CustomerInsight';
import SalesOrders from './components/SalesOrders';
import PaymentInsight from './components/PaymentInsight';
import AverageOrders from './components/AverageOrders';
import OrderProcessing from './components/OrderProcessing';
import TopProduct from './components/TopProduct';
import AdminHeader from './components/AdminHeader';


const Dashboard = () => {
    return (
        <div className='dash-con'>
            <AdminNav />
            <div className='dash-board'>
                <div className='dash-header'>
                    <div className='header-title'>
                        <i className='bx bxs-dashboard'></i>
                        <h1>Dashboard</h1>
                    </div>

                    <AdminHeader />

                </div>
                <div className='dash-body'>
                        <OrderSummary />
                        <CustomerInsight />
                        <SalesOrders />
                        <PaymentInsight />
                        <AverageOrders />
                        <OrderProcessing />
                        <TopProduct />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
