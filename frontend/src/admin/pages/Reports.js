import React from 'react'

import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css'
import AdminNav from '../components/AdminNav'
import AdminHeader from '../components/AdminHeader';
import ReportSalesComponent from '../components/ReportSalesComponent';

const Reports = () => {
    return (
        <div className='dash-con'>
            <AdminNav />
            <div className='dash-board'>
                <div className='dash-header'>
                    <div className='header-title'>
                        <i class='bx bxs-report'></i>
                        <h1>Reports</h1>
                    </div>
                    <AdminHeader />
                </div>
                <div className='body'>
                <div className='user-con'>
                    <ReportSalesComponent/>
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
                                        <th>Period</th>
                                        <th>Product Code</th>
                                        <th>Product Name</th>
                                        <th>Size</th>
                                        <th>Quantity</th>
                                        <th>Total Amount</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                     
                                        <tr>
                                            <td><input type='checkbox' /></td>
                                            <td>Aug 2024</td>
                                            <td>Product Code</td>
                                            <td>Product Name</td>
                                            <td>Size</td>
                                            <td>Quantity</td>
                                            <td>Total Amount of sales</td>
                                            <td><button>Export</button></td>
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

export default Reports