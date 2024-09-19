import React, { useState, useEffect } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import PaymentModal from '../components/paymentModal'; // Import the PaymentModal component

const Payments = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]); // Store fetched orders
  const [loading, setLoading] = useState(false); // Loading state
  const [totalOrders, setTotalOrders] = useState(0); // Total orders count
  const [sortBy, setSortBy] = useState('date'); // Sorting state
  const [statusFilter, setStatusFilter] = useState(''); // Status filter
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [selectedOrder, setSelectedOrder] = useState(null); // Selected order for the modal
  const itemsPerPage = 15; // Change this based on your preference

  useEffect(() => {
    fetchOrders();
  }, [currentPage, sortBy, statusFilter]); // Fetch orders when page, sort, or filter changes

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/admin-order-history', {
        params: {
          status: statusFilter,
        },
      });

      const ordersData = response.data.orders;
      setOrders(ordersData);
      setTotalOrders(ordersData.length); // Assuming the total count comes from the response
    } catch (error) {
      console.error('Error fetching order history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
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
    fetchOrders(); // Refresh the orders list
    handleCloseModal(); // Close the modal
  };

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  // Group orders by order_id and include payment status
  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.order_id]) {
      acc[order.order_id] = {
        order_id: order.order_id,
        product_id: order.product_id,
        order_date: order.order_date,
        order_total: order.order_total,
        order_status: order.order_status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        customer_id: order.customer_id,
        customer_first_name: order.first_name,
        customer_last_name: order.last_name,
        products: []
      };
    }
    acc[order.order_id].products.push({
      product_id: order.product_id,  
      product_name: order.product_name,
      price: order.price,
      quantity: order.quantity,
      item_total: order.total_price,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
    });
    return acc;
  }, {});

  const ordersToDisplay = Object.values(groupedOrders).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <div className='dash-body'>
          <div className='admin-payment'>
            <div className='payment-header'>
              <div className='payment-search'>
                <form>
                  <input type='search' />
                  <button>Search</button>
                </form>
              </div>
              <div className='payment-options'>
                <div className='payment-print'>
                  <button>Print Payment Summary</button>
                </div>
                <div className='payment-sort'>
                  <label htmlFor="sort">Sort By</label>
                  <select name="sort" id="sort" value={sortBy} onChange={handleSortChange}>
                    <option value="date">Date</option>
                    <option value="status">Status</option>
                    <option value="id">ID</option>
                    <option value="customer-id">Customer</option>
                  </select>
                </div>
              </div>
            </div>

            <div className='payment-table'>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th><input type='checkbox' /></th>
                      <th>Payment ID</th>
                      <th>Order ID</th>
                      <th>Payment Date</th>
                      <th>Payment Method</th>
                      <th>Payment Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersToDisplay.map((order, index) => (
                      <tr key={index}>
                        <td><input type='checkbox' /></td>
                        <td>{order.order_id}</td>
                        <td>{order.product_id}</td>
                        <td>{new Date(order.order_date).toLocaleDateString()}</td>
                        <td>{order.payment_method}</td>
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
          handleUpdate={handleUpdate} // Pass handleUpdate to the modal
        />
      )}
    </div>
  );
};

export default Payments;
