import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './modal.css';
import axios from 'axios';
import ToastNotification from '../../public/components/ToastNotification';

const OrderModal = ({ order, show, handleClose, refreshOrders }) => {
    const [status, setStatus] = useState(order ? order.order_status : ''); // Initialize with current status
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        // Reset status when a new order is selected
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
                setToastMessage('Please select a valid status!');
                setTimeout(() => {
                    setToastMessage('');
                }, 2000);
                setLoading(false);
                return;
            }

            await axios.put(`http://localhost:5001/update-order-status/${order.order_id}`, {
                status,
                products
            });

            setToastMessage('Updated successfully');
            setTimeout(() => {
                setToastMessage('');
                handleClose(); // Close the modal after a successful update
            }, 2000);

            refreshOrders();
        } catch (error) {
            console.error('Error updating order status:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculate total cost for all products
    const totalProductCost = order.products.reduce((acc, product) => {
        const productTotal = product.price ? (product.price * product.quantity) : 0;
        return acc + productTotal;
    }, 0);

    const shippingCost = 150; // Fixed shipping cost for the entire order
    const grandTotal = totalProductCost + shippingCost; // Total including shipping

    return (
        <div
            className={`modal fade ${show ? 'show' : ''}`}
            tabIndex="-1"
            role="dialog"
            style={{ display: show ? 'block' : 'none' }}
        >
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header order-head">
                        <h5 className="modal-title"> 
                        <i className='bx bxs-package'></i> Orders</h5>
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
                                <p><strong>Order ID:</strong> {order.order_id}</p>
                                <p><strong>Customer ID:</strong> {order.customer_id}</p>
                                <p><strong>Product ID:</strong> {order.product_id}</p>
                                <p><strong>Customer Name:</strong> {`${order.customer_first_name} ${order.customer_last_name}`}</p>
                                <p><strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
                                <p><strong>Current Status:</strong> {order.order_status}</p>

                                <div>
                                    <label htmlFor="status">Update Status:</label>
                                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="">Select a status</option>
                                        <option value="To Ship">To Ship</option>
                                        <option value="To Receive">To Receive</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Return/Refund">Return/Refund</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                                <br />
                                <h5>Products:</h5>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.products.map((product, index) => {
                                            const productTotal = product.price ? (product.price * product.quantity) : 0;

                                            return (
                                                <tr key={index}>
                                                    <td>{product.product_name}</td>
                                                    <td>P{product.price ? product.price.toFixed(2) : 'N/A'}</td>
                                                    <td>{product.quantity}</td>
                                                    <td>P{productTotal.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Display total for all products */}
                                <div className="d-flex justify-content-between">
                                    <strong>Total for Products : </strong>
                                    <span> ₱ {totalProductCost.toFixed(2)}</span>
                                </div>

                                {/* Display shipping cost */}
                                <div className="d-flex justify-content-between">
                                    <strong>Shipping Cost : </strong>
                                    <span> ₱ {shippingCost.toFixed(2)}</span>
                                </div>

                                {/* Display grand total */}
                                <div className="d-flex justify-content-between">
                                    <strong>Grand Total : </strong>
                                    <span> ₱ {grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer justify-content-evenly">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                        <button type="button" className="btn btn-primary" onClick={handleUpdate} disabled={loading}>
                            {loading ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderModal;
