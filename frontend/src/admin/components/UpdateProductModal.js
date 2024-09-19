// src/components/UpdateProductModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const UpdateProductModal = ({ show, product, handleClose, handleUpdate }) => {
    const [formData, setFormData] = useState({
        product_code: '',
        product_name: '',
        price: '',
        category: '',
        quantity: '',
        description: ''
        // image_url: '' // Uncomment if image_url is required
    });

    useEffect(() => {
        if (product) {
            setFormData({
                product_code: product.product_code || '',
                product_name: product.product_name || '',
                price: product.price || '',
                category: product.category_name || '',
                quantity: product.quantity || '',
                description: product.description || ''
                // image_url: product.image_url || '' // Uncomment if image_url is required
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure product_code is defined and valid
            if (formData.product_code) {
                await axios.put(`http://localhost:5000/admin-update-products/${formData.product_code}`, formData);
                handleUpdate(); // Refresh the product list
                handleClose(); // Close the modal
            } else {
                console.error('Product code is undefined');
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Update Product</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formProductCode">
                        <Form.Label>Product Code</Form.Label>
                        <Form.Control
                            type="text"
                            name="product_code"
                            value={formData.product_code}
                            onChange={handleChange}
                            required
                            readOnly
                        />
                    </Form.Group>
                    <Form.Group controlId="formProductName">
                        <Form.Label>Product Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formPrice">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formCategory">
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formQuantity">
                        <Form.Label>Quantity</Form.Label>
                        <Form.Control
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    {/* <Form.Group controlId="formImage">
                        <Form.Label>Image URL</Form.Label>
                        <Form.Control
                            type="text"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group> */}
                    <Button variant="primary" type="submit">
                        Update Product
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default UpdateProductModal;
