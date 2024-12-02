import React, { useState, useEffect } from 'react';
import './modal.css';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import ToastNotification from '../../public/components/ToastNotification';

const UpdateProductModal = ({ show, product, handleClose, handleUpdate }) => {
    const [formData, setFormData] = useState({
        product_code: '',
        product_name: '',
        price: '',
        category_id: '',
        category_name: '',
        quantity: '',
        description: '',
        image_url: '',
        size: '',
        custom_size: '',
        expiration_date: ''
    });
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                product_code: product.product_code || '',
                product_name: product.product_name || '',
                price: product.price || '',
                category_id: product.category_id || '',
                category_name: product.category_name || '',
                quantity: product.quantity || '',
                description: product.description || '',
                image_url: product.product_image || '',
                size: product.size || '',
                custom_size: product.size && !['500', '100', '150', '200', '250'].includes(product.size) ? product.size : '', // Handle custom size
                expiration_date: product.expiration_date || ''
            });
        }

        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/categories');
                setCategories(response.data.categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories.');
            }
        };

        fetchCategories();
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.product_code) {
                const dataToSend = {
                    ...formData,
                    size: formData.size === 'Other' ? formData.custom_size : formData.size
                };
                await axios.put(`http://localhost:5001/api/admin-update-products/${formData.product_code}`, dataToSend);

                setToastMessage('Updated Successfully!');
                setTimeout(() => {
                    setToastMessage('');
                    handleUpdate();
                    handleClose();
                }, 2000);
            } else {
                console.error('Product code is undefined');
                setError('Product code is missing.');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            setError('Failed to update product. Please try again.');
        }
    };

    return (
        <Modal
            className="modal-lg"
            show={show}
            onHide={handleClose}
            centered
            dialogClassName="custom-dialog"
        >
            <Modal.Header closeButton>
                <Modal.Title>Update Product</Modal.Title>
            </Modal.Header>
            <Modal.Body className="mbody one">
                <ToastNotification toastMessage={toastMessage} />
                {error && <div className="alert alert-danger">{error}</div>}
                <Form onSubmit={handleSubmit}>
                    <img src={product.product_image} alt="Product" />
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
                            as="select"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                {formData.category_name ? `${formData.category_name}` : 'Select a category'}
                            </option>
                            {categories.map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="formSize">
                        <Form.Label>Size</Form.Label>
                        <Form.Control
                            as="select"
                            name="size"
                            value={formData.size}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select size</option>
                            <option value="500">500</option>
                            <option value="100">100</option>
                            <option value="150">150</option>
                            <option value="200">200</option>
                            <option value="250">250</option>
                            <option value="Other">Other</option>
                        </Form.Control>
                    </Form.Group>
                    {formData.size === 'Other' && (
                        <Form.Group controlId="formCustomSize">
                            <Form.Label>Custom Size</Form.Label>
                            <Form.Control
                                type="text"
                                name="custom_size"
                                value={formData.custom_size}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    )}
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
                    <Form.Group controlId="formImage">
                        <Form.Label>Image URL</Form.Label>
                        <Form.Control
                            type="text"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formExpirationDate">
                        <Form.Label>Expiration Date</Form.Label>
                        <Form.Control
                            type="date"
                            name="expiration_date"
                            value={formData.expiration_date}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <br />
                    <Button variant="primary" type="submit">
                        Update Product
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default UpdateProductModal;
