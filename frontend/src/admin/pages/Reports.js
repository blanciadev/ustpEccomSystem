import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import ReportSalesComponent from '../components/ReportSalesComponent';

const Reports = () => {
    const [productReports, setProductReports] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch product report data when the component mounts
    useEffect(() => {
        const fetchProductReports = async () => {
            try {
                const response = await axios.get('http://localhost:5001/product-reports-per-month');
                setProductReports(response.data.data);
            } catch (error) {
                console.error('Error fetching product reports:', error);
            }
        };

        fetchProductReports();
    }, []);

    // Function to handle search input change
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Filtered reports based on the search query
    const filteredReports = productReports.filter((report) => {
        const lowerCaseQuery = searchQuery.toLowerCase();

        // Check if the properties exist before using toLowerCase
        return (
            (report.period && report.period.toLowerCase().includes(lowerCaseQuery)) ||
            (report.product_code && report.product_code.toLowerCase().includes(lowerCaseQuery)) ||
            (report.product_name && report.product_name.toLowerCase().includes(lowerCaseQuery)) ||
            (report.size && report.size.toLowerCase().includes(lowerCaseQuery))
        );
    });

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
                                        <input
                                            type='search'
                                            placeholder='Search...'
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                        />
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
                                            <th>Total Sales (PHP)</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReports.map((report, index) => (
                                            <tr key={index}>
                                                <td><input type='checkbox' /></td>
                                                <td>{report.period}</td>
                                                <td>{report.product_code}</td>
                                                <td>{report.product_name}</td>
                                                <td>{report.size}</td>
                                                <td>{report.total_quantity}</td>
                                                <td>PHP {parseFloat(report.total_sales).toFixed(2)}</td>
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
