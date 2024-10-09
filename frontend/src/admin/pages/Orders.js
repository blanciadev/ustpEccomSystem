import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';
import OrderModal from '../components/OrderModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [statusOptions, setStatusOptions] = useState([
    'To Ship', 'To Receive', 'Completed', 'Cancelled', 'Return/Refund', 'Pending'
  ]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalShow, setModalShow] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch orders data from API
  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5001/admin-order-history', {
        params: { status, searchTerm, sortBy }
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status, searchTerm, sortBy]);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setModalShow(false);
    fetchOrders();
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  // Function to highlight the matching part of the text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;

    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} style={{ backgroundColor: 'yellow' }}>{part}</span>
      ) : part
    );
  };

  // Function to check if an order row contains the search term
  const isRowHighlighted = (order) => {
    const fieldsToCheck = [
      order.order_id.toString(),
      `${order.customer_first_name} ${order.customer_last_name}`,
      new Date(order.order_date).toLocaleDateString(),
      order.order_status,
      order.payment_status
    ];

    return fieldsToCheck.some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  // Filtered orders based on search term and status
  const filteredOrders = orders.filter(order => isRowHighlighted(order));

  // Sort orders based on the selected criteria
  const sortOrders = (orders) => {
    return [...orders].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.order_date) - new Date(a.order_date);
      } else if (sortBy === 'status') {
        return a.order_status.localeCompare(b.order_status);
      } else if (sortBy === 'id') {
        return a.order_id - b.order_id;
      } else if (sortBy === 'customer-id') {
        return `${a.customer_first_name} ${a.customer_last_name}`.localeCompare(`${b.customer_first_name} ${b.customer_last_name}`);
      }
      return 0;
    });
  };

  // Combine filtered and sorted orders
  const sortedFilteredOrders = sortOrders(filteredOrders);

  // Pagination functions
  const totalPages = Math.ceil(sortedFilteredOrders.length / pageSize);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginatedOrders = sortedFilteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        <div className='body'>
          <div className='admin-order'>
            <div className='cheader'>
              <div className='search'>
                <form>
                  <input
                    type='search'
                    placeholder='Search orders...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>
              </div>

              <div className='options'>
                <div className='print'>
                  <button>Print Order Summary</button>
                </div>
                <div className='sort'>
                  <label htmlFor='sort'>Sort By:</label>
                  <select
                    name='sort'
                    id='sort'
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value='date'>Date</option>
                    <option value='status'>Status</option>
                    <option value='id'>ID</option>
                    <option value='customer-id'>Customer ID</option>
                  </select>
                </div>
                <div className='order-filter'>
                  <label htmlFor='status'>Filter By Status:</label>
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
              <table className='table table-hover'>
                <thead className='bg-light sticky-top'>
                  <tr>
                    <th><input type='checkbox' /></th>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Order Date</th>
                    <th>Status</th>
                    <th>Payment Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map(order => (
                    <tr
                      key={order.order_id}
                      className={isRowHighlighted(order) ? 'highlighted-row' : ''}
                    >
                      <td><input type='checkbox' /></td>
                      <td>{highlightText(order.order_id.toString(), searchTerm)}</td>
                      <td>{highlightText(`${order.customer_first_name} ${order.customer_last_name}`, searchTerm)}</td>
                      <td>{highlightText(new Date(order.order_date).toLocaleDateString(), searchTerm)}</td>
                      <td>{highlightText(order.order_status, searchTerm)}</td>
                      <td>{highlightText(order.payment_status, searchTerm)}</td>
                      <td><button onClick={() => handleOpenModal(order)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className='pagination'>
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          show={modalShow}
          handleClose={handleCloseModal}
          refreshOrders={refreshOrders}
        />
      )}
    </div>
  );
};

export default Orders;
