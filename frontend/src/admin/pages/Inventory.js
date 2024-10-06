import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import InventoryCountComponent from '../components/InventoryCountComponent';

const Inventory = () => {
   
    return (
        <div className='dash-con'>
        <AdminNav />
        <div className='dash-board'>
            <div className='dash-header'>
                <div className='header-title'>
                    <i class='bx bx-clipboard'></i>
                    <h1>Inventory</h1>
                </div>
                <AdminHeader />
            </div>
            <div className='body'>
            <div className='user-con'>
                <InventoryCountComponent/>
                    <div className='report-list'>
                        <div className='cheader'>
                            <div className='search'>
                                <form>
                                <input type='search' placeholder='Search...'/>
                                </form>
                            </div>

                           
                        </div>
                        <div className='order-table'>
                            <table className='table table-hover'>
                                <thead className='bg-light sticky-top'>
                                <tr>
                                            <th><input type='checkbox' /></th>
                                            <th>Product Code</th>
                                            <th>Product Name</th>
                                            <th>Category</th>
                                            <th>Size</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total Amount</th>
                                            <th>Date</th>
                                        </tr>
                                </thead>
                                <tbody>
                                 
                                    <tr>
                                        <td><input type='checkbox' /></td>
                                            <td>Order ID</td>
                                            <td>Customer ID</td>
                                            <td>Order Date</td>
                                            <td>Status</td>
                                            <td>Order Date</td>
                                            <td>Status</td>
                                            <td>Order Date</td>
                                            <td>Status</td>
                                    </tr>
                                
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
                       
        </div>
    );
};

export default Inventory;
