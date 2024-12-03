import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import ReportSalesComponent from '../components/ReportSalesComponent';
import { saveAs } from 'file-saver';

const Reports = () => {
    const [productReports, setProductReports] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const currentYear = new Date().getFullYear();

    const years = [];
    for (let year = 2000; year <= currentYear; year++) {
        years.push(year);
    }
    years.reverse();

    useEffect(() => {
        const fetchProductReports = async () => {
            setLoading(true);
            setError(false); // Reset error state on each fetch attempt
            try {
                const response = await axios.get('http://localhost:5001/product-reports-per-month');

                // Check if the response contains data
                if (response.data && response.data.data) {
                    setProductReports(response.data.data);

                    // Store the data in localStorage
                    localStorage.setItem('productReports', JSON.stringify(response.data.data));
                } else {
                    console.warn("No data found in response.");
                    setProductReports([]);
                }
            } catch (error) {
                console.error('Error fetching product reports:', error.message || error);
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
        const reportDate = new Date(report.period);

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


    const exportReport = async (month, year) => {
        try {
            // Retrieve data from localStorage
            const storedReports = JSON.parse(localStorage.getItem('productReports'));

            if (!storedReports || storedReports.length === 0) {
                alert('No data found in localStorage to export.');
                return;
            }

            // Send the data to the backend to generate the report
            const response = await axios.post('http://localhost:5001/product-reports-export', {
                month,
                year,
                data: storedReports
            }, {
                responseType: 'blob'
            });

            const fileName = `product-report-${month}-${year}.xlsx`;
            saveAs(new Blob([response.data]), fileName);
        } catch (error) {
            console.error('Error exporting report:', error.message);
            alert('Failed to export report. Please try again.');
        }
    };


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
                                    <button onClick={() => exportReport(selectedMonth, selectedYear)}>
                                        <i class='bx bx-export'></i> Export Report
                                    </button>
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
                                                {/* <th><input type='checkbox' /></th> */}
                                                <th>Period</th>
                                                <th>Product Code</th>
                                                <th>Product Name</th>
                                                <th>Quantity</th>
                                                <th>Total Sales (PHP)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredReports.map((report, index) => (
                                                <tr key={index}>
                                                    {/* <td><input type='checkbox' /></td> */}
                                                    <td>{report.period}</td>
                                                    <td>{report.product_code}</td>
                                                    <td>{report.product_name}</td>
                                                    <td>{report.total_quantity}</td>
                                                    <td>₱ {parseFloat(report.total_sales).toFixed(2)}</td>
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
