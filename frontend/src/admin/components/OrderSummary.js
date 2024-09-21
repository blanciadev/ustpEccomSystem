import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../admin.css';

const OrderSummary = () => {
    const [orderCounts, setOrderCounts] = useState({});

    useEffect(() => {
        const fetchOrderCounts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/admin-order-history-component');
                setOrderCounts(response.data.statusCounts);
            } catch (error) {
                console.error('Error fetching order counts:', error);
            }
        };

        fetchOrderCounts();
    }, []);

    return (
        <div className='todays-order'>
            <div className='header'>
                <div className='title'>
                    <h5>Today's Orders</h5>
                    <p>Order Summary</p>
                </div>
                <div className='see-all'>
                    <button>See all</button>
                </div>
            </div>

            <div className='summ'>
                <div className='completed'>
                    <div>
                        <i className='bx bxs-package'></i>
                    </div>
                    <h6>{orderCounts.Completed || 0}</h6> {/* number of COMPLETED orders */}
                    <p><strong>Completed</strong></p>
                </div>

                <div className='pending'>
                    <div>
                        <i className='bx bx-time'></i>
                    </div>
                    <h6>{orderCounts['To Process'] || 0}</h6> {/* number of PENDING orders */}
                    <p><strong>To Process</strong></p>
                </div>

                <div className='intransit'>
                    <div>
                        <i className='bx bxs-truck'></i>
                    </div>
                    <h6>{orderCounts['In Transit'] || 0}</h6> {/* number of INTRANSIT orders */}
                    <p><strong>In Transit</strong></p>
                </div>

                <div className='cancelled'>
                    <div>
                        <i className='bx bxs-x-circle'></i>
                    </div>
                    <h6>{orderCounts.Cancelled || 0}</h6> {/* number of CANCELLED orders */}
                    <p><strong>Cancelled</strong></p>
                </div>

                <div className='returned'>
                    <div>
                        <i className='bx bx-reset'></i>
                    </div>
                    <h6>{orderCounts.Returned || 0}</h6> {/* number of RETURNED orders */}
                    <p><strong>Returned</strong></p>
                </div>
            </div>
        </div>
    );
}

export default OrderSummary;
