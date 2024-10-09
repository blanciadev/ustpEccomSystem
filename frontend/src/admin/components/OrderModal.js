import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './modal.css'
import axios from 'axios';
import ToastNotification from '../../components/ToastNotification';

const OrderModal = ({ order, show, handleClose, refreshOrders }) => {
    const [status, setStatus] = useState(order ? order.order_status : ''); // Initialize with current status
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const products = order.products.map((product) => ({
                product_id: product.product_id, // Make sure this is defined
                quantity: product.quantity,
            }));

            // Ensure status is not empty
            if (!status) {
                console.log('Please select a valid status');
                
                setLoading(false);
                setToastMessage('Please select a valid status!');
                setTimeout(() => {
                    setToastMessage('');
                }, 2000);
                return;
            }

            await axios.put(`http://localhost:5001/update-order-status/${order.order_id}`, {
                status,
                products
            });
            setToastMessage('Updated successfully');
                setTimeout(() => {
                    setToastMessage('');
                    handleClose(); 
                }, 2000);

            

            console.log('Order status updated successfully');
            
            refreshOrders(); // Call refreshOrders to update the orders list
        } catch (error) {
            console.error('Error updating order status:', error.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={`modal fade ${show ? 'show' : ''}`} tabIndex="-1" role="dialog" style={{ display: show ? 'block' : 'none' }}>
            
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Order Details</h5>
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
                                <br/>
                                <h5>Products:</h5>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.products.map((product, index) => (
                                            <tr key={index}>

                                                <td>{product.product_name}</td>
                                                <td>P{product.price ? product.price.toFixed(2) : 'N/A'}</td>
                                                <td>{product.quantity}</td>
                                                <td>P{(product.price && product.quantity ? (product.price * product.quantity).toFixed(2) : 'N/A')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
