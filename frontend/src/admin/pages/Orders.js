import React, { useState, useEffect } from 'react'; // Include useEffect here
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';
import OrderModal from '../components/OrderModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [statusOptions, setStatusOptions] = useState([
    'To Ship', 'To Receive', 'Completed', 'Cancelled', 'Return/Refund', 'Pending'
  ]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalShow, setModalShow] = useState(false);

  // Fetch orders data from API
  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin-order-history', {
        params: { status }
      });
      console.log('Fetched orders:', response.data.orders);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setModalShow(false);
    fetchOrders(); // Refresh orders when modal closes
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  return (
    <div className='dash-con'>
      <AdminNav />
      <div className='dash-board'>
        <div className='dash-header'>
          <div className='header-title'>
            <i className='bx bxs-package'></i>
            <h1>Orders</h1>
          </div>
          <AdminHeader />
        </div>
        <div className='dash-body'>
          <div className='admin-order'>
            <div className='order-header'>
              <div className='order-search'>
                <form>
                  <input type='search' placeholder='Search orders...' />
                  <button type='submit'>Search</button>
                </form>
              </div>

              <div className='order-options'>
                <div className='order-print'>
                  <button>Print Order Summary</button>
                </div>
                <div className='order-sort'>
                  <label htmlFor='sort'>Sort By</label>
                  <select name='sort' id='sort'>
                    <option value='date'>Date</option>
                    <option value='status'>Status</option>
                    <option value='id'>ID</option>
                    <option value='customer-id'>Customer ID</option>
                  </select>
                </div>
                <div className='order-filter'>
                  <label htmlFor='status'>Filter By Status</label>
                  <select
                    name='status'
                    id='status'
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value=''>All</option>
                    {statusOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className='order-table'>
              <table>
                <thead>
                  <tr>
                    <th><input type='checkbox' /></th>
                    <th>Order ID</th>
                    <th>Customer ID</th>
                    <th>Customer Name</th>
                    <th>Order Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.order_id}>
                      <td><input type='checkbox' /></td>
                      <td>{order.order_id}</td>
                      <td>{order.customer_id}</td>
                      <td>{`${order.customer_first_name} ${order.customer_last_name}`}</td>
                      <td>{new Date(order.order_date).toLocaleDateString()}</td>
                      <td>{order.order_status}</td>
                      <td><button onClick={() => handleOpenModal(order)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          show={modalShow}
          handleClose={handleCloseModal}
          refreshOrders={refreshOrders} // Pass the refreshOrders function as a prop
        />
      )}
    </div>
  );
};

export default Orders;
