import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../admin.css";
import "../AdminHistory.css";
import AdminNav from "../components/AdminNav";
import AdminHeader from "../components/AdminHeader";
import axios from "axios";
import { saveAs } from "file-saver";

const Transactions = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "https://ustp-eccom-server.vercel.app/api/admin-order-history-general",
          {
            params: { status },
          }
        );
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error.message);
      }
    };

    fetchOrders();
  }, [status]);

  const filteredOrders = (orders || []).filter((order) => {
    const search = searchTerm.toLowerCase();
    return (
      order.products?.some((product) =>
        [
          product.product_code,
          product.product_name,
          product.category_name,
          product.order_quantity?.toString(),
          product.price?.toString(),
          product.item_total?.toString(),
          product.product_quantity?.toString(),
          (product.product_quantity - product.order_quantity)?.toString(),
        ].some((field) => field?.toLowerCase().includes(search))
      ) ||
      [
        order.order_id?.toString(),
        order.customer_id?.toString(),
        `${order.customer_first_name} ${order.customer_last_name}`.toLowerCase(),
        new Date(order.order_date).toLocaleDateString().toLowerCase(),
        order.order_status?.toLowerCase(),
        order.payment_status?.toLowerCase(),
      ].some((field) => field?.includes(search))
    );
  });


  const sortOrders = (orders) => {
    return [...orders].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.order_date) - new Date(a.order_date);
      } else if (sortBy === "status") {
        return a.order_status.localeCompare(b.order_status);
      } else if (sortBy === "customer-id") {
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
      const response = await axios.get(
        "http://localhost:5001/admin-order-history-general",
        {
          params: { exportToExcel: "true" },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "order_summary.xlsx");
    } catch (error) {
      console.error("Error exporting orders to Excel:", error.message);
    }
  };

  const paginatedOrders = sortedFilteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="dash-con">
      <AdminNav />
      <div className="dash-board">
        <div className="dash-header">
          <div className="header-title">
            <i className="bx bxs-package"></i>
            <h1>Transactions</h1>
          </div>
          <AdminHeader />
        </div>
        <div className="body">
          <div className="admin-order">
            <div className="container align-items-center mb-2">
              <div className="row align-items-center m-0 p-0">
                <div className="col-4">
                  <div className="search d-flex">
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

                <div className="col-3">
                  <div className="d-flex align-items-center justify-content-end"></div>
                </div>

                <div className="col-3">
                  <div className="d-flex justify-content-center">
                    <button
                      onClick={handlePrintOrders}
                      className="btn btn-primary"
                    >
                      <i className="bx bx-export"></i> Export Transactions
                    </button>
                  </div>
                </div>

                <div className="col-2">
                  <div className="d-flex align-items-center justify-content-end">
                    <label htmlFor="sort" className="me-2">
                      Sort By:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="form-select"
                      style={{ width: "90px" }}
                    >
                      <option value="date">Date</option>
                      <option value="customer-id">Customer ID</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-table">
              <div
                style={{
                  overflow: "auto",
                  maxHeight: "63vh",
                  maxWidth: "95%",
                }}
                className="custom-scrollbar"
              >
                <table className="table table-hover">
                  <thead className="thead-design bg-light sticky-top">
                    <tr>
                      {/* <th>
                        <input type="checkbox" />
                      </th> */}
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
                    {paginatedOrders.map((order) =>
                      order.products.map((product, index) => (
                        <tr
                          key={`${order.order_id}-${product.product_id}-${index}`}
                        >
                          {/* <td>
                            <input type="checkbox" />
                          </td> */}
                          <td>{product.product_code}</td>
                          <td>{product.product_name}</td>
                          <td>{product.category_name}</td>
                          <td>{product.order_quantity || ""}</td>
                          <td>₱{product.price}</td>
                          <td>₱{product.item_total}</td>
                          <td>
                            {(order.order_date)}
                          </td>
                          <td>{product.product_quantity}</td>
                          <td>
                            {product.product_quantity - product.order_quantity}
                          </td>
                          <td>{order.order_id}</td>
                          <td>{order.customer_id || "STAFF"}</td>
                          <td>
                            {order.shipment_id || ""}
                          </td>
                          <td>{order.payment_status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pagination">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={index + 1 === currentPage ? "active" : ""}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;