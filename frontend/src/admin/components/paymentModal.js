import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import ToastNotification from '../../components/ToastNotification';

const PaymentModal = ({ show, handleClose, order, handleUpdate }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (order) {
      setPaymentMethod(order.payment_method || '');
      setOrderStatus(order.order_status || '');
      setPaymentStatus(order.payment_status || '');
    }
  }, [order]);

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5001/update-payment-details', {
        order_id: order.order_id,
        payment_method: paymentMethod,
        order_status: orderStatus,
        payment_status: paymentStatus,
      });
      console.log('Saved payment details:', { paymentMethod, orderStatus, paymentStatus });


      setToastMessage('Updated successfully');
      setTimeout(() => {
        setToastMessage('');
        handleClose();
        handleUpdate();
      }, 2000);
    } catch (error) {
      setToastMessage('Error Occurred!', error.message);
      setTimeout(() => {
        setToastMessage('');
      }, 2000);
      console.error('Error saving payment details:', error.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Payment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ToastNotification toastMessage={toastMessage} />
        <Form>
          <Form.Group controlId="formPaymentMethod">
            <Form.Label>Payment Method</Form.Label>
            <Form.Control
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              readOnly
            />
          </Form.Group>

          <Form.Group controlId="formOrderStatus">
            <Form.Label>Order Status</Form.Label>
            <Form.Control
              type="text"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              readOnly
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
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;
