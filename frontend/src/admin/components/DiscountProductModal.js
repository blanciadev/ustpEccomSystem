import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import axios from 'axios';
import './DiscountProducts.css'; // Optional: Custom CSS for additional styling

const DiscountProduct = ({ show, handleClose, order, handleUpdate }) => {
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState({});

  // Fetch the products when the modal is shown
  useEffect(() => {
    if (show) {
      axios
        .get('http://localhost:5000/discount-product') // Update endpoint if necessary
        .then((response) => {
          setProducts(response.data); // Set the products from response
          setDiscounts({}); // Reset discounts when the modal is shown
        })
        .catch((error) => {
          console.error('Error fetching products:', error);
        });
    }
  }, [show]);

  const handleUpdateDiscount = async (product_code, discountValue) => {
    // Validate discount value
    if (discountValue === undefined || discountValue === '' || isNaN(discountValue) || discountValue < 0) {
      console.error('Invalid discount value. Please enter a valid percentage.');
      return;
    }

    // Convert the discountValue to an integer (e.g., "10" or "20")
    const discountPercentage = Math.floor(parseFloat(discountValue));

    // Log the discount value for debugging
    console.log(`Applying discount of ${discountPercentage}% for product code ${product_code}`);

    try {
      // Prepare the data as an array of appliedDiscounts to match the backend
      const appliedDiscounts = [
        {
          productCode: product_code, // Product code from the current product
          discount: discountPercentage, // Send the whole number value (10 for 10%)
        }
      ];

      // Send the array of applied discounts to the backend
      const response = await axios.post('http://localhost:5000/discount-product-update', {
        appliedDiscounts
      });

      console.log(`Discount applied to product ID ${product_code}: ${discountValue}%`);
      handleUpdate(response.data); // Call the update handler with the response

      // Clear the input field after successful application
      setDiscounts((prevDiscounts) => ({
        ...prevDiscounts,
        [product_code]: '', // Clear the discount input for the updated product
      }));

    } catch (error) {
      console.error('Error updating discount:', error);
    }
  };




  const handleDiscountChange = (product_code, value) => {
    // Update the discount input for the specific product
    setDiscounts((prevDiscounts) => ({
      ...prevDiscounts,
      [product_code]: value, // Store the discount value for the product_id
    }));
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Discount Products</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const product_code = product.id;

              return (
                <tr key={product.id}>
                  <td>{product_code}</td>
                  <td>{product.product_name}</td>
                  <td>{product.available_quantity}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.product_status}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Form.Select
                        value={discounts[product.id] || ''}
                        onChange={(e) => handleDiscountChange(product_code, e.target.value)}
                        style={{ width: '100px', marginRight: '5px' }}
                      >
                        <option value="">Select Discount</option>
                        <option value="0">Disable Discount</option>
                        <option value="5">5%</option>
                        <option value="10">10%</option>
                        <option value="15">15%</option>
                        <option value="20">20%</option>
                      </Form.Select>

                      <Button
                        variant="success"
                        onClick={() => handleUpdateDiscount(product.id, discounts[product.id])} // Apply discount
                      >
                        Apply
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
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

export default DiscountProduct;
