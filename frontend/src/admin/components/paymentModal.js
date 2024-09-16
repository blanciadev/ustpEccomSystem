import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const PaymentModal = ({ show, handleClose, order, handleUpdate }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    if (order) {
      setPaymentMethod(order.payment_method || '');
      setOrderStatus(order.order_status || '');
      setPaymentStatus(order.payment_status || '');
    }
  }, [order]);

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/update-payment-details', {
        order_id: order.order_id,
        payment_method: paymentMethod,
        order_status: orderStatus,
        payment_status: paymentStatus,
      });
      console.log('Saved payment details:', { paymentMethod, orderStatus, paymentStatus });
      handleUpdate(); // Notify parent to refresh the orders list
      handleClose();  // Close the modal after saving
    } catch (error) {
      console.error('Error saving payment details:', error.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Payment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formPaymentMethod">
            <Form.Label>Payment Method</Form.Label>
            <Form.Control
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formOrderStatus">
            <Form.Label>Order Status</Form.Label>
            <Form.Control
              type="text"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formPaymentStatus">
            <Form.Label>Payment Status</Form.Label>
            <Form.Control
              as="select"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="">Select Payment Status</option>
              <option value="Pending">Pending</option>
              <option value="Order Paid">Order Paid</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;
