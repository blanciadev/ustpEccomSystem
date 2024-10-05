import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../admin.css';

const OrderSummary = () => {
    const [orderCounts, setOrderCounts] = useState({});

    useEffect(() => {
        const fetchOrderCounts = async () => {
            try {
                const response = await axios.get('http://localhost:5001/admin-order-history-component');
                setOrderCounts(response.data.statusCounts);
            } catch (error) {
                console.error('Error fetching order counts:', error);
            }
        };

        fetchOrderCounts();
    }, []);

    return (
        <div className='order-summary'>
            <div className='order-summary__header'>
                <div className='order-summary__title'>
                    <h5>Today's Orders</h5>
                    <p>Order Summary</p>
                </div>
            </div>

            <div className='order-summary__summ '>
                <div className='order-summary__delivered'>
                    <div>
                        <i className='bx bxs-package'></i>
                    </div>
                    <h6>{orderCounts.Completed || 0}</h6> {/* number of COMPLETED orders */}
                    <p><strong>Completed</strong></p>
                </div>

                <div className='order-summary__pending'>
                    <div>
                        <i className='bx bx-time'></i>
                    </div>
                    <h6>{orderCounts['To Process'] || 0}</h6> {/* number of PENDING orders */}
                    <p><strong>To Process</strong></p>
                </div>

                <div className='order-summary__intransit'>
                    <div>
                        <i className='bx bxs-truck'></i>
                    </div>
                    <h6>{orderCounts['To Ship'] || 0}</h6> {/* number of To Ship orders */}
                    <p><strong>To Ship</strong></p>
                </div>

                <div className='order-summary__cancelled'>
                    <div>
                        <i className='bx bxs-x-circle'></i>
                    </div>
                    <h6>{orderCounts.Cancelled || 0}</h6> {/* number of CANCELLED orders */}
                    <p><strong>Cancelled</strong></p>
                </div>

                <div className='order-summary__returned'>
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
