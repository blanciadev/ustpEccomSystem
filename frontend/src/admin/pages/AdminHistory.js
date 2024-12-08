import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';
import { saveAs } from 'file-saver';

const AdminHistory = () => {
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
      const response = await axios.get('https://ustp-eccom-server.vercel.app/api/admin-order-history-records', {
        params: { status, searchTerm, sortBy }

      });
      setOrders(response.data.orders);
      console.log(response.data.orders);
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

  const filteredOrders = (orders || []).filter(order => {
    const search = searchTerm.toLowerCase();

    return (
      (order.order_id?.toString() ?? '').toLowerCase().includes(search) ||
      (order.customer_id?.toString() ?? '').toLowerCase().includes(search) ||
      `${order.customer_first_name} ${order.customer_last_name}`.toLowerCase().includes(search) ||
      new Date(order.order_date).toLocaleDateString().toLowerCase().includes(search) ||
      order.order_status.toLowerCase().includes(search) ||
      order.payment_status.toLowerCase().includes(search) ||
      (order.order_total?.toString() ?? '').toLowerCase().includes(search)
    );
  });


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
      const response = await axios.get('https://ustp-eccom-server.vercel.app/api/admin-order-history-records', {
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
            <h1>Order History</h1>
          </div>
          <AdminHeader />
        </div>
        <div className='body'>
          <div className='admin-order'>


            <div class="container align-items-center mt-4 mb-4">

<div class="row align-items-center m-0 p-0 ">

  <div class="col-4">
    <div class="search d-flex  ">
      {" "}
      <form>
        <input
          type="search"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </form>
    </div>
  </div>

  <div class="col-3 ">
    <div class="d-flex justify-content-center ">
      <button
        onClick={handlePrintOrders}
        className="btn btn-primary"
      >

        <i class="bx bx-export"></i> Export Order Record

      </button>
    </div>
  </div>

  <div class="col-2 ">
    <div class="d-flex align-items-center" >
      <label htmlFor="sort" className="me-2">
        Sort By:
      </label>
      <select
        name="sort"
        id="sort"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="form-select"
        style={{ width: "90px" }}
      >
        <option value="date">Date</option>
        <option value="status">Status</option>
        <option value='customer-id'>Customer ID</option>
      </select>
    </div>
  </div>

  <div class="col-3">
    <div class="d-flex align-items-center">
      <label htmlFor="status" className="me-2 ">
        Filter By Status:
      </label>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="form-select"
        style={{ width: "130px" }}
      >
        <option value="">All</option>
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}

      </select>
    </div>
  </div>
</div>
</div>





            <div className='order-table'>
              <table className='table table-hover'>
                <thead className='bg-light sticky-top'>
                  <tr>
                    <th><input type='checkbox' /></th>
                    <th>Customer ID</th>
                    <th>Order ID</th>
                    <th>Shipment Address</th>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Order Quantity</th>
                    <th>Price</th>
                    <th>Total Amount</th>
                    <th>Date</th>
                    <th>Current Quantity</th>
                    <th>Running Balance</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(orders || []).map((order, orderIndex) => (
                    (order.products || []).map((product, productIndex) => (
                      <tr key={`${order.order_id}-${product.product_id}-${productIndex}`}>
                        {productIndex === 0 && (
                          <>
                            <td rowSpan={order.products.length}><input type="checkbox" /></td>
                            <td rowSpan={order.products.length}>{highlightText(order.customer_id?.toString() ?? 'N/A', searchTerm)}</td>
                            <td rowSpan={order.products.length}>{highlightText(order.order_id?.toString() ?? 'N/A', searchTerm)}</td>
                            <td rowSpan={order.products.length}>
                              {highlightText(
                                `${order.shipment?.streetname || 'N/A'}, ${order.shipment?.address || ''} ${order.shipment?.city || ''}`,
                                searchTerm
                              )}
                            </td>
                          </>
                        )}

                        <td>{highlightText(product.product_id?.toString() ?? 'N/A', searchTerm)}</td>
                        <td>{highlightText(product.product_name?.trim() ?? 'N/A', searchTerm)}</td>
                        <td>{highlightText(product.category_name ?? 'N/A', searchTerm)}</td>
                        <td>{highlightText(product.quantity?.toString() ?? 'N/A', searchTerm)}</td>
                        <td>₱{highlightText(product.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 'N/A', searchTerm)}</td>
                        <td>₱{highlightText(product.item_total?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 'N/A', searchTerm)}</td>
                        <td>{highlightText(new Date(order.order_date).toLocaleDateString(), searchTerm)}</td>
                        <td>{highlightText(product.current_quantity?.toString() ?? 'N/A', searchTerm)}</td>
                        <td>{highlightText(product.running_balance?.toString() ?? 'N/A', searchTerm)}</td>
                        <td>{highlightText(product.payment_status?.toString() ?? 'N/A', searchTerm)}</td>
                      </tr>
                    ))
                  ))}
                </tbody>


              </table>


              <div className="pagination">
                <button onClick={() => handlePageChange(1)}>&lt;&lt;</button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
                <button onClick={() => handlePageChange(totalPages)}>&gt;&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHistory;
