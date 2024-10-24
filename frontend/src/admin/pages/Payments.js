import React, { useState, useEffect } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import PaymentModal from '../components/paymentModal';
import { saveAs } from 'file-saver';

const Payments = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const itemsPerPage = 15;

  const [statusOptions, setStatusOptions] = useState([
    'To Ship', 'To Receive', 'Completed', 'Cancelled', 'Return/Refund', 'Pending'
  ]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);

  useEffect(() => {
    fetchOrders();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentPage, statusFilter, searchTerm]);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 425);
  };
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/admin-order-history', {
        params: {
          status: statusFilter,
          search: searchTerm,
        },
      });

      const ordersData = response.data.orders;
      setOrders(ordersData);
      setTotalOrders(ordersData.length);
    } catch (error) {
      console.error('Error fetching order history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleUpdateClick = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleUpdate = () => {
    fetchOrders();
    handleCloseModal();
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


  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  const filteredOrders = orders.filter(order => {
    const orderIdMatch = order.order_id.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const customerNameMatch = `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    return orderIdMatch || customerNameMatch;
  });

  const ordersToDisplay = filteredOrders.length > 0
    ? filteredOrders
    : orders;

  const paginatedOrders = ordersToDisplay.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className='dash-con'>
      <AdminNav />
      <div className='dash-board'>
        <div className='dash-header'>
          <div className='header-title'>
            <i className='bx bxs-wallet'></i>
            <h1>Payments</h1>
          </div>
          <AdminHeader />
        </div>
        <div className='body'>
          <div className='admin-payment'>
            <div className='cheader'>
              <div className='search'>
                <form>
                  <input
                    type='search'
                    placeholder='Search by Order ID or Customer...'
                    value={searchTerm}
                    onChange={handleSearchChange}
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
                <div className='filter'>
                  <label htmlFor="statusFilter">Filter by Status</label>
                  <select id="statusFilter" value={statusFilter} onChange={handleStatusFilterChange}>
                    <option value="">All</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className='payment-table'>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <table className='table table-hover'>
                  <thead className='bg-light sticky-top'>
                    <tr>
                      <th><input type='checkbox' /></th>
                      <th>Order ID</th>
                      <th>Customer ID</th>
                      <th>Payment Date</th>
                      <th>Payment Method</th>
                      <th>Shipment Status</th>
                      <th>Payment Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order, index) => (
                      <tr key={index}>
                        <td><input type='checkbox' /></td>
                        <td>{order.order_id}</td>
                        <td>{order.customer_id}</td>
                        <td>{new Date(order.payment_date).toLocaleDateString()}</td> {/* Displaying payment_date */}
                        <td>{order.payment_method}</td>
                        <td>{order.order_status}</td>
                        <td>{order.payment_status}</td>
                        <td>
                          <button onClick={() => handleUpdateClick(order)}>Update</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

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
      {showModal && (
        <PaymentModal
          show={showModal}
          handleClose={handleCloseModal}
          order={selectedOrder}
          handleUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default Payments;
