import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SalesSummaryComponent = () => {

    const [salesData, setSalesData] = useState({
        total_sales: 0,
        total_orders: 0,
        total_products_sold: 0,
    });


    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await axios.get('http://localhost:5001/sales-for-today');
                setSalesData(response.data);
            } catch (error) {
                console.error('Error fetching sales data:', error);
            }
        };

        fetchSalesData();
    }, []);

    return (
        <div className='todays-sales'>
            <div className='header'>
                <div className='title'>
                    <h5>Today's Sales</h5>
                    <p>Sales Summary</p>
                </div>
            </div>

            <div className='summ'>
                <div className='red'>
                    <div>
                        <i className='bx bxs-bar-chart-square'></i>
                    </div>
                    <h6>₱{salesData.total_sales}</h6>
                    <p><strong>Total Sales</strong></p>
                </div>

                <div className='yellow'>
                    <div>
                        <i className='bx bx-clipboard'></i>
                    </div>
                    <h6>{salesData.total_orders}</h6>
                    <p><strong>Total Orders</strong></p>
                </div>

                <div className='green'>
                    <div>
                        <i className='bx bxs-purchase-tag-alt bx-rotate-90'></i>
                    </div>
                    <h6>{salesData.total_products_sold}</h6>
                    <p><strong>Products Sold</strong></p>
                </div>
            </div>
        </div>
    );
}

export default SalesSummaryComponent;
