import React, { useState, useEffect } from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import './DiscountProducts.css';

const RemoveDiscountProduct = ({ show, handleClose, order, handleUpdate }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (show) {
      axios
        .get('https://ustp-eccom-server.vercel.app/api/products-disable-bundle')
        .then((response) => {
          setProducts(response.data);
        })
        .catch((error) => {
          console.error('Error fetching products:', error);
        });
    }
  }, [show]);

  const handleRemoveDiscount = (productCode) => {
    axios
      .post(`https://ustp-eccom-server.vercel.app/api/remove-discount/${productCode}`)
      .then((response) => {
        setProducts(products.filter((product) => product.product_code !== productCode));
        handleUpdate();
      })
      .catch((error) => {
        console.error('Error removing discount:', error);
      });
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Remove Discount From Products</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Bundle ID</th>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_code}>
                <td>{product.bundle_id}</td>
                <td>{product.product_code}</td>
                <td>{product.product_name}</td>
                <td>{product.category_name}</td>
                <td>P{product.price.toFixed(2)}</td>
                <td>{product.product_discount}%</td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveDiscount(product.product_code)} // Pass product_code to the function
                  >
                    <i class='bx bxs-trash' ></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveDiscountProduct;