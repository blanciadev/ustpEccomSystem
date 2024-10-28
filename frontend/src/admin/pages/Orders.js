import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';
import OrderModal from '../components/OrderModal';
import { saveAs } from 'file-saver';


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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);


  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;


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

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [status, searchTerm, sortBy]);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 425);
  };

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

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;

    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className='highlighted-term'>{part}</span>
      ) : part
    );
  };

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

  const filteredOrders = orders.filter(order => isRowHighlighted(order));

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

  const sortedFilteredOrders = sortOrders(filteredOrders);

  const totalPages = Math.ceil(sortedFilteredOrders.length / pageSize);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrintOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5001/admin-order-history', {
        params: { exportToExcel: 'true' },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'order_summary.xlsx');

    } catch (error) {
      console.error('Error exporting orders to Excel:', error.message);
    }
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
                  <button onClick={handlePrintOrders}>
                    {isMobile ? (
                      <i className='bx bx-printer'></i>
                    ) : (
                      'Export Order Record'
                    )}
                  </button>
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
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map(order => (
                    <tr key={order.order_id} className={isRowHighlighted(order) ? 'highlighted-row' : ''}>
                      <td><input type='checkbox' /></td>
                      <td>{highlightText(order.order_id.toString(), searchTerm)}</td>
                      <td>{highlightText(`${order.customer_first_name} ${order.customer_last_name}`, searchTerm)}</td>
                      <td>{highlightText(new Date(order.order_date).toLocaleDateString(), searchTerm)}</td>
                      <td>{highlightText(order.order_status, searchTerm)}</td>
                      <td>{highlightText(order.payment_status, searchTerm)}</td>
                      <td>P{highlightText(order.order_total, searchTerm)}</td>
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
