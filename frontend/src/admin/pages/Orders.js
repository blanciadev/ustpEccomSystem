import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../admin.css";
import AdminNav from "../components/AdminNav";
import AdminHeader from "../components/AdminHeader";
import axios from "axios";
import OrderModal from "../components/OrderModal";
import { saveAs } from "file-saver";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [statusOptions, setStatusOptions] = useState([
    "To Ship",
    "To Receive",
    "Cancelled",
    "Return/Refund",
    "Pending",
  ]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/admin-order-history",
        {
          params: { status, searchTerm, sortBy },
        }
      );
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error.message);
    }
  };

  useEffect(() => {
    fetchOrders();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
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

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="highlighted-term">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();
    const statusMatch = status
      ? order.order_status.toLowerCase() === status.toLowerCase()
      : true;

    return (
      statusMatch &&
      (order.order_id.toString().toLowerCase().includes(search) ||
        order.customer_id.toString().toLowerCase().includes(search) ||
        `${order.customer_first_name} ${order.customer_last_name}`
          .toLowerCase()
          .includes(search) ||
        new Date(order.order_date)
          .toLocaleDateString()
          .toLowerCase()
          .includes(search) ||
        order.payment_status.toLowerCase().includes(search) ||
        order.order_total.toString().toLowerCase().includes(search))
    );
  });

  const sortOrders = (orders) => {
    return [...orders].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.order_date) - new Date(a.order_date);
      } else if (sortBy === "status") {
        return a.order_status.localeCompare(b.order_status);
      } else if (sortBy === "id") {
        return a.order_id - b.order_id;
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
        "http://localhost:5001/api/admin-order-history",
        {
          params: { exportToExcel: "true" },
          responseType: "blob",
        }
      );

      // Generate a timestamp for the filename
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
      const filename = `Order Records ${timestamp}.xlsx`;

      // Save the file with the timestamped filename
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, filename);
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
            <h1>Orders</h1>
          </div>

          <AdminHeader />
        </div>
        <div className="body">
          <div className="admin-order">


            <div class="container align-items-center mt-4 mb-4">

              <div class="row align-items-center m-0 p-0">

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
                      {isMobile ? (
                        <i className="bx bx-printer"></i>
                      ) : (
                        "Export Order Record"
                      )}
                    </button>
                  </div>
                </div>

                <div class="col-2">
                  <div class=" d-flex ">
                    <label htmlFor="sort" className="me-2">
                      Sort By:
                    </label>
                    <select
                      name="sort"
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className=""
                    >
                      <option value="date">Date</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                </div>

                <div class="col-3">
                  <div class="d-flex ">
                    <label htmlFor="status" className="me-2">
                      Filter By Status:
                    </label>
                    <select
                      name="status"
                      id=""
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className=""
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




            <div className="order-table " >
              <div className="mx-4" style={{ height: "400px" }}>
                <div className="">
                  <table className="table table-hover">
                    <thead className="bg-light sticky-top">
                      <tr>
                        <th>
                          <input type="checkbox" />
                        </th>
                        <th>Order ID</th>
                        <th>Customer ID</th>
                        <th>Order Date</th>
                        <th>Status</th>
                        <th>Payment Status</th>
                        <th>Payment Method</th>
                        <th>Total Amount</th>
                        <th>Actions</th>


                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order) => (
                        <tr
                          key={order.order_id}
                          onClick={() => handleOpenModal(order)}
                          className=""
                        >
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            {highlightText(order.order_id.toString(), searchTerm)}
                          </td>
                          <td>
                            {highlightText(
                              order.customer_id.toString(),
                              searchTerm
                            )}
                          </td>
                          <td>
                            {highlightText(
                              new Date(order.order_date).toLocaleDateString(),
                              searchTerm
                            )}
                          </td>
                          <td>{highlightText(order.order_status, searchTerm)}</td>
                          <td>{highlightText(order.payment_status, searchTerm)}</td>
                          <td>{highlightText(order.payment_method, searchTerm)}</td>
                          <td>
                            ₱
                            {highlightText(
                              order.order_total.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }),
                              searchTerm
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => handleOpenModal(order)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>


                </div>
              </div>


              <div className="d-flex justify-content-center align-items-center">

                <div className="d-flex justify-content-center align-items-center">
                  <button
                    className="me-2"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span className="px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="me-2"
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
      </div>

      {selectedOrder && (
        <OrderModal
          show={modalShow} // Ensure the 'show' prop controls the modal visibility
          handleClose={handleCloseModal} // Pass handleCloseModal as the correct prop
          order={selectedOrder}
          refreshOrders={refreshOrders} // Pass correct function name
        />
      )}
    </div>
  );
};

export default Orders;
