import React, { useState, useEffect } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import PaymentModal from '../components/paymentModal';

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

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchTerm]);

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

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  // Filter orders based on the search term
  const filteredOrders = orders.filter(order => {
    const orderIdMatch = order.order_id.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const customerNameMatch = `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    return orderIdMatch || customerNameMatch;
  });

  // Sort the filtered orders to ensure they are at the top
  const ordersToDisplay = filteredOrders.length > 0
    ? filteredOrders
    : orders;

  // Paginate the orders to display
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
                  <button>Print Payment Summary</button>
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

            <div className='pagination-container'>
              <Pagination>
                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {[...Array(totalPages).keys()].map(pageNumber => (
                  <Pagination.Item
                    key={pageNumber + 1}
                    active={pageNumber + 1 === currentPage}
                    onClick={() => handlePageChange(pageNumber + 1)}
                  >
                    {pageNumber + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
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
