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
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [loading, setLoading] = useState(true); // New loading state
    const [error, setError] = useState(false); // New error state
    const currentYear = new Date().getFullYear();

    // Generate a continuous range of years and reverse it to show the latest first
    const years = [];
    for (let year = 2000; year <= currentYear; year++) {
        years.push(year);
    }
    years.reverse(); // This will sort the years from latest to oldest

    // Fetch product report data when the component mounts
    useEffect(() => {
        const fetchProductReports = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5001/product-reports-per-month');
                setProductReports(response.data.data);
            } catch (error) {
                console.error('Error fetching product reports:', error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProductReports();
    }, []);

    // Function to handle search input change
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Handle month and year selection change
    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    // Filter reports based on search query, selected month, and selected year
    const filteredReports = productReports.filter((report) => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const reportDate = new Date(report.period); // Assuming report.period is in a date format

        // Check if the properties exist before using toLowerCase
        const matchesSearchQuery =
            (report.period && report.period.toLowerCase().includes(lowerCaseQuery)) ||
            (report.product_code && report.product_code.toLowerCase().includes(lowerCaseQuery)) ||
            (report.product_name && report.product_name.toLowerCase().includes(lowerCaseQuery)) ||
            (report.size && report.size.toLowerCase().includes(lowerCaseQuery));

        const matchesMonth = selectedMonth ? reportDate.getMonth() === parseInt(selectedMonth) : true;
        const matchesYear = selectedYear ? reportDate.getFullYear() === parseInt(selectedYear) : true;

        return matchesSearchQuery && matchesMonth && matchesYear;
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
                                <button>
                                    Export Data
                                </button>
                                <div className='options'>
                                    <div className='col'>
                                        <select value={selectedMonth} onChange={handleMonthChange} className='form-select'>
                                            <option value=''>Select Month</option>
                                            <option value='0'>January</option>
                                            <option value='1'>February</option>
                                            <option value='2'>March</option>
                                            <option value='3'>April</option>
                                            <option value='4'>May</option>
                                            <option value='5'>June</option>
                                            <option value='6'>July</option>
                                            <option value='7'>August</option>
                                            <option value='8'>September</option>
                                            <option value='9'>October</option>
                                            <option value='10'>November</option>
                                            <option value='11'>December</option>
                                        </select>
                                    </div>
                                    <div className='col'>
                                        <select value={selectedYear} onChange={handleYearChange} className='form-select'>
                                            <option value=''>Select Year</option>
                                            {years.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Conditional rendering for loading, no data, and table */}
                            <div className='report-table'>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center">Loading...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="8" className="text-center">Error loading data. Please try again later.</td>
                                    </tr>
                                ) : filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center">No reports found for the selected filters.</td>
                                    </tr>
                                ) : (
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
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
