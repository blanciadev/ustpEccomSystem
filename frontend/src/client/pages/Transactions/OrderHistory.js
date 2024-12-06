import React, { useEffect, useState } from "react";
import axios from "axios";
import "./orderhistory.css";
import Navigation from "../../components/Navigation";
import UserSideNav from "../../components/UserSideNav";
import AdminSkeleton from "../../../public/components/Loaders/AdminSkeleton";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeButton, setActiveButton] = useState(""); // Track active button

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "https://ustp-eccom-server.vercel.app/api//order-history",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params: {
              status: statusFilter,
            },
          }
        );
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [statusFilter]);

  const handleStatusClick = (status) => {
    setStatusFilter(status);
    setActiveButton(status);
    setLoading(true);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.post(
        "https://ustp-eccom-server.vercel.app/api//cancel-order",
        {
          order_id: orderId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Refresh orders after cancellation
      setOrders(
        orders.map((order) =>
          order.order_id === orderId
            ? { ...order, order_status: "Cancelled" }
            : order
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  if (loading) return <AdminSkeleton />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="order-con">
      <Navigation />
      <div className="order-box">
        <div className="user">
          <UserSideNav />
        </div>

        <div className="purchase ">
          <div className="purchase-box " style={{ height: "600px" }}>
            <div className="purchase-body mb-4" style={{ width: "98%" }}>
              <div className="d-flex justify-content-evenly mb-4">
                {[
                  "",
                  "To Ship",
                  "To Receive",
                  "Completed",
                  "Cancelled",
                  "Return/Refund",
                ].map((status, index) => (
                  <button
                    key={index}
                    style={{
                      width: "200px",
                      backgroundColor:
                        activeButton === status ? "#ff9a9e" : "#f8f9fa", // Conditional background color
                      color: activeButton === status ? "#fff" : "#000", // Adjust text color for visibility
                      border: "1px solid #ccc",
                      transition: "background-color 0.3s ease, color 0.3s ease", // Smooth transition for background and text color
                    }}
                    onClick={() => handleStatusClick(status)}
                  >
                    {status === "" ? (
                      "All"
                    ) : (
                      <>
                        {status === "To Ship" && (
                          <i className="bx bxs-truck"></i>
                        )}
                        {status === "To Receive" && (
                          <i className="bx bxs-receipt"></i>
                        )}
                        {status === "Completed" && (
                          <i className="bx bx-check"></i>
                        )}
                        {status === "Cancelled" && <i className="bx bx-x"></i>}
                        {status === "Return/Refund" && (
                          <i className="bx bx-revision"></i>
                        )}
                        {status !== "All" && !isMobile && ` ${status}`}
                      </>
                    )}
                  </button>
                ))}
              </div>

              <div
                className="order-container p-4 "
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  height: "500px",
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                {orders.length === 0 ? (
                  <p>No orders found</p>
                ) : (
                  <div className=" ">
                    {orders.map((order) => (
                      <div
                        key={order.order_id}
                        className="mb-4"
                        style={{
                          background:
                            "linear-gradient(to right, #ff9a9e, #fecfef)",
                          padding: "20px",
                        }}
                      >
                        <div class="">
                          <div class="row">
                            <div class="col-6">
                              <div class="">
                                <div class="">
                                  <h4>Order ID: {order.order_id}</h4>
                                  <p>
                                    Order Date:{" "}
                                    {new Date(
                                      order.order_date
                                    ).toLocaleDateString()}
                                  </p>
                                  <p>Shipping Fee: ₱150.00</p>
                                  <p>
                                    Item Total: ₱
                                    {order.order_total.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                  <p>
                                    Amount Payable: ₱
                                    {order.order_total.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>

                                  <p>Order Status: {order.order_status}</p>
                                </div>
                              </div>
                            </div>
                            <div class="col-6 d-flex justify-content-end align-items-end">
                              <button
                                onClick={() =>
                                  handleCancelOrder(order.order_id)
                                }
                                className={`btn btn-danger mt-2 ${order.order_status === "Pending"
                                  ? ""
                                  : "disabled"
                                  }`}
                                disabled={order.order_status !== "Pending"}
                              >
                                Cancel this Order
                              </button>
                            </div>
                          </div>
                        </div>

                        <div class="">
                          {Array.isArray(order.products) &&
                            order.products.length > 0 ? (
                            <table className="table table-striped table-bordered">
                              <thead className="thead-dark">
                                <tr>
                                  <th>Image</th>
                                  <th>Product Name</th>
                                  <th>Price</th>
                                  <th>Quantity</th>
                                  <th>Item Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.products.map((product, index) => (
                                  <tr key={index}>
                                    <td>
                                      <img
                                        src={
                                          product.product_image ||
                                          "https://via.placeholder.com/150"
                                        }
                                        alt={
                                          product.product_name ||
                                          "Product Image"
                                        }
                                        style={{
                                          width: "50px",
                                          height: "50px",
                                        }}
                                      />
                                    </td>
                                    <td>{product.product_name}</td>
                                    <td>
                                      ₱
                                      {product.price.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </td>
                                    <td>{product.quantity}</td>
                                    <td>
                                      ₱
                                      {product.item_total.toLocaleString(
                                        "en-US",
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>No product details available.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
