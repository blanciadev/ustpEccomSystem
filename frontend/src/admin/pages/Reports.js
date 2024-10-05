import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import ReportSalesComponent from '../components/ReportSalesComponent';

const Reports = () => {
    const [productReports, setProductReports] = useState([]);

    // Fetch product report data when the component mounts
    useEffect(() => {
        const fetchProductReports = async () => {
            try {
                const response = await axios.get('http://localhost:5001/product-reports-per-month');
                setProductReports(response.data.data); // Set the fetched data
            } catch (error) {
                console.error('Error fetching product reports:', error);
            }
        };

        fetchProductReports();
    }, []);

    return (
        <div className='dash-con'>
            <AdminNav />
            <div className='dash-board'>
                <div className='dash-header'>
                    <div className='header-title'>
                        <i className='bx bxs-report'></i>
                        <h1>Reports</h1>
                    </div>
                    <AdminHeader />
                </div>
                <div className='body'>
                    <div className='user-con'>
                        <ReportSalesComponent />
                        <div className='report-list'>
                            <div className='cheader'>
                                <div className='search'>
                                    <form>
                                        <input type='search' placeholder='Search...' />
                                    </form>
                                </div>
                            </div>

                            {/* ORDER TABLE WILL BE THE PRODUCT DETAILS */}
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
                                            <th>Total Sales (PHP)</th> {/* Update header to reflect Total Sales */}
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productReports.map((report, index) => (
                                            <tr key={index}>
                                                <td><input type='checkbox' /></td>
                                                <td>{report.period}</td>
                                                <td>{report.product_code}</td>
                                                <td>{report.product_name}</td>
                                                <td>{report.size}</td>
                                                <td>{report.total_quantity}</td> {/* Display total quantity */}
                                                <td>PHP {parseFloat(report.total_sales).toFixed(2)}</td> {/* Display total_sales instead of total_amount */}
                                                <td><button>Export</button></td>
                                            </tr>
                                        ))}
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

export default Reports;
