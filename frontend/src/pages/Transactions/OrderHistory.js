import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from '../../components/Navigation';
import './Transaction.css';
import Purchase from '../../components/Purchase';
import UserSideNav from '../../components/UserSideNav';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/order-history', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrders(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className='order-con'>
      <Navigation/>
      <div className='order-box'>
        <div className='user'>
          <UserSideNav/>
        </div>
        <div className='purchase'>
          <div className='purchase-box'>
            <div className='purchase-header'>
              <h3>Order History</h3>
            </div>
            <div className='purchase-body'>
              <div className='purchase-btncon'>
                <button>All</button>
                <button>To Ship</button>
                <button>To Receive</button>
                <button>Completed</button>
                <button>Cancelled</button>
                <button>Return/Refund</button>
              </div>
              <div className='order'>
                {orders.length === 0 ? (
                  <p>No orders found</p>
                ) : (
                  orders.map(order => (
                    <Purchase key={order.order_id} order={order} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
