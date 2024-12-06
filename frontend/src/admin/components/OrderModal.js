import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./modal.css";
import axios from "axios";
import ToastNotification from "../../public/components/ToastNotification";

const OrderModal = ({ order, show, handleClose, refreshOrders }) => {
  const [status, setStatus] = useState(order ? order.order_status : "");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {

    if (order) {
      setStatus(order.order_status);
    }
  }, [order]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const products = order.products.map((product) => ({
        product_id: product.product_id,
        quantity: product.quantity,
      }));

      if (!status) {
        setToastMessage("Please select a valid status!");
        setTimeout(() => {
          setToastMessage("");
        }, 2000);
        setLoading(false);
        return;
      }

      await axios.put(
        `https://ustp-eccom-server.vercel.app/api/update-order-status/${order.order_id}`,
        {
          status,
          products,
        }
      );

      setToastMessage("Updated successfully");
      setTimeout(() => {
        setToastMessage("");
        handleClose();
      }, 2000);

      refreshOrders();
    } catch (error) {
      console.error("Error updating order status:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total cost for all products
  const totalProductCost = order.products.reduce((acc, product) => {
    const productTotal = product.price ? product.price * product.quantity : 0;
    return acc + productTotal;
  }, 0);

  const shippingCost = 150;
  const grandTotal = totalProductCost + shippingCost;

  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
      tabIndex="-1"
      role="dialog"
      style={{ display: show ? "block" : "none" }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header order-head">
            <h5 className="modal-title">
              <i className="bx bxs-package"></i> Orders
            </h5>
            <button
              type="button"
              className="close"
              onClick={handleClose}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <ToastNotification toastMessage={toastMessage} />
            {order && (
              <div>
                <div class="customer-details text-start  ps-4">
                  <div>
                    <h5 className="modal-title">Customer Details</h5>
                  </div>
                  <div class="row align-items-center">
                    <div class="col">
                      <p>
                        <strong>Order ID</strong>
                      </p>
                    </div>
                    <div class="col">
                      <p>{order.order_id}</p>
                    </div>
                  </div>

                  <div class="row align-items-center">
                    <div class="col">
                      <p>
                        <strong>Customer ID</strong>
                      </p>
                    </div>
                    <div class="col">
                      <p>{order.customer_id}</p>
                    </div>
                  </div>

                  <div class="row align-items-center">
                    <div class="col">
                      <p>
                        <strong>Customer Name</strong>
                      </p>
                    </div>
                    <div class="col">
                      <p>{`${order.customer_first_name} ${order.customer_last_name}`}</p>
                    </div>
                  </div>

                  <div class="row align-items-center">
                    <div class="col">
                      <p>
                        <strong>Delivery Address</strong>
                      </p>
                    </div>
                    <div className="col">
                      <p>{`${order.shipment.streetname}, ${order.shipment.address}, ${order.shipment.city}`}</p>
                    </div>

                  </div>

                  <div class="row align-items-center">
                    <div class="col">
                      <p>
                        <strong>Order Date</strong>
                      </p>
                    </div>
                    <div class="col">
                      <p>{new Date(order.order_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div class="row align-items-center">
                    <div class="col">
                      <p>
                        <strong>Current Order Status</strong>
                      </p>
                    </div>
                    <div class="col">
                      <p className="text-danger fw-bold">
                        {order.order_status}
                      </p>
                    </div>
                  </div>

                  <div class="d-flex align-items-center">
                    <label htmlFor="status">Order Status</label>
                    <select
                      className=""
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      style={{ width: "200px" }}
                    >
                      <option className="option1" value="">
                        Select a status
                      </option>
                      <option className="option1" value="To Ship">
                        To Ship
                      </option>
                      <option className="option1" value="To Receive">
                        To Receive
                      </option>
                      <option className="option1" value="Completed">
                        Completed
                      </option>
                      <option className="option1" value="Cancelled">
                        Cancelled
                      </option>
                      <option className="option1" value="Return/Refund">
                        Return/Refund
                      </option>
                      <option className="option1" value="Pending">
                        Pending
                      </option>
                    </select>
                  </div>
                </div>

                <br />

                <div class="product-details-order">
                  <h5 className="modal-title text-start ps-4">Product Details</h5>

                  <table class="table">
                    <thead>
                      <tr>
                        <th scope="col">Images</th>
                        <th scope="col">Product Name</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Sub-total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.products.map((product, index) => {
                        const productTotal = product.price
                          ? product.price * product.quantity
                          : 0;
                        return (
                          <tr key={index}>
                            <td className="text-left">
                              <img
                                src={
                                  product.product_image ||
                                  "https://th.bing.com/th/id/OIP.vg49Rg4lf-bVtcQjHxlJkgHaHa?rs=1&pid=ImgDetMain"
                                }
                                alt={product.product_name}
                                className="img-fluid"
                                style={{
                                  height: "50px",
                                  width: "50px",
                                  objectFit: "fit",
                                  borderBottom: "2px solid #ff728a",
                                }}
                              />
                            </td>

                            <td className="text-left">
                              {product.product_name}
                            </td>
                            <td>
                              ₱ {product.price ? product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "N/A"}

                            </td>
                            <td>{product.quantity}</td>
                            <td>
                              ₱ {productTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="mx-2">
                    <div class="row align-items-center ">
                      <div class="col-9 text-end  ">
                        <p>
                          <strong>Total for Products</strong>
                        </p>
                      </div>
                      <div class="col-3 text-end">
                        <p className="text-danger fw-bold">
                          {" "}
                          ₱ {totalProductCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

                        </p>
                      </div>
                    </div>

                    <div class="row align-items-center ">
                      <div class="col-9 text-end  ">
                        <p>
                          <strong>Shipping Cost</strong>
                        </p>
                      </div>
                      <div class="col-3 text-end">
                        <p className="text-danger fw-bold">
                          ₱ {shippingCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}


                        </p>
                      </div>
                    </div>

                    <div class="row align-items-center ">
                      <div class="col-9 text-end  ">
                        <p>
                          <strong>Grand Total</strong>
                        </p>
                      </div>
                      <div class="col-3 text-end">
                        <p className="text-danger fw-bold">
                          {" "}
                          ₱ {grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer justify-content-evenly">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Close
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;