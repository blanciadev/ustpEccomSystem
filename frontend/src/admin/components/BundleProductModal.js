import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const BundleProduct = ({ show, handleClose, order, handleUpdate }) => {
  // State to manage the form inputs
  const [productDetails, setProductDetails] = useState({
    productName: '',
    quantity: '',
    price: ''
  });

  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductDetails({
      ...productDetails,
      [name]: value
    });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Call an API to submit the data
    try {
      const response = await axios.post('/api/bundle-product', {
        orderId: order.id, // Assuming you pass the order details from parent
        ...productDetails
      });

      // Handle update after a successful response (update parent component state)
      handleUpdate(response.data);

      // Close the modal
      handleClose();
    } catch (error) {
      console.error('Error adding bundle product:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Bundle Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formProductName">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter product name"
              name="productName"
              value={productDetails.productName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formQuantity">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter quantity"
              name="quantity"
              value={productDetails.quantity}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formPrice">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter price"
              name="price"
              value={productDetails.price}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Add Product
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BundleProduct;
