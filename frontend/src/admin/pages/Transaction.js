import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';
import { saveAs } from 'file-saver';

const Transactions = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5001/admin-order-history-general', {
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

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className='highlighted-term'>{part}</span>
      ) : part
    );
  };

  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();

    return (
      order.order_id.toString().toLowerCase().includes(search) ||
      order.customer_id.toString().toLowerCase().includes(search) ||
      `${order.customer_first_name} ${order.customer_last_name}`.toLowerCase().includes(search) ||
      new Date(order.order_date).toLocaleDateString().toLowerCase().includes(search) ||
      order.order_status.toLowerCase().includes(search) ||
      order.payment_status.toLowerCase().includes(search) ||
      order.order_total.toString().toLowerCase().includes(search)
    );
  });

  const sortOrders = (orders) => {
    return [...orders].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.order_date) - new Date(a.order_date);
      } else if (sortBy === 'status') {
        return a.order_status.localeCompare(b.order_status);
      } else if (sortBy === 'customer-id') {
        return a.customer_id - b.customer_id;
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
      const response = await axios.get('http://localhost:5001/admin-order-history-general', {
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
            <h1>Transactions</h1>
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

              </div>
            </div>
            <div className='order-table'>
              <table className='table table-hover'>
                <thead className='bg-light sticky-top'>
                  <tr>
                    <th><input type='checkbox' /></th>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Order Quantity</th>
                    <th>Price</th>
                    <th>Total Price</th>
                    <th>Date</th>
                    <th>Current Quantity</th>
                    <th>Running Balance</th>
                    <th>Order ID</th>
                    <th>Customer ID</th>
                    <th>Shipment ID</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    order.products.map((product, index) => (
                      <tr key={`${order.order_id}-${product.product_id}-${index}`}>
                        <td><input type="checkbox" /></td>
                        <td>{highlightText(product.product_code.toString(), searchTerm)}</td>
                        <td>{highlightText(product.product_name, searchTerm)}</td>
                        <td>{highlightText(product.category_name, searchTerm)}</td>
                        <td>{highlightText(product.order_quantity.toString(), searchTerm)}</td>
                        <td>₱{highlightText(product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), searchTerm)}</td>
                        <td>₱{highlightText(product.item_total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), searchTerm)}</td>
                        <td>{highlightText(new Date(order.order_date).toLocaleDateString(), searchTerm)}</td>
                        <td>{highlightText(product.product_quantity.toString(), searchTerm)}</td>
                        <td>
                          {highlightText(
                            (product.product_quantity - product.order_quantity).toString(),
                            searchTerm
                          )}
                        </td>
                        <td>{highlightText(order.order_id.toString(), searchTerm)}</td>
                        <td>{highlightText(order.customer_id.toString(), searchTerm)}</td>
                        <td>{highlightText(order.shipment_id ? order.shipment_id.toString() : 'Not Available', searchTerm)}</td>
                        <td>{highlightText(order.payment_status, searchTerm)}</td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>

              <div className='pagination'>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={index + 1 === currentPage ? 'active' : ''}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
