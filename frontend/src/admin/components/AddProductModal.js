import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import ToastNotification from '../../components/ToastNotification';


const AddProductModal = ({ show, handleClose, handleSubmit }) => {
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [size, setSize] = useState('500');
    const [customSize, setCustomSize] = useState('');
    const [toastMessage, setToastMessage] = useState('');


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5001/product-category');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const text = await response.text();
                if (!text) {
                    throw new Error('Empty response body');
                }

                const data = JSON.parse(text);
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories.');
            }
        };
        fetchCategories();
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!productName || !description || !category || !price || !quantity || !imageURL) {
            setError('Please fill out all required fields.');
            return;
        }

        if (size === 'Other' && !customSize) {
            setError('Please provide a custom size.');
            return;
        }

        console.log('Image URL before submission:', imageURL);

        const productData = {
            productName,
            description,
            category,
            price,
            quantity,
            expirationDate,
            imageURL,
            size: size === 'Other' ? customSize : size
        };

        try {
            const response = await fetch('http://localhost:5001/add-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.text();
            console.log(result);

            setToastMessage('Successful!');
            setTimeout(() => {
                setToastMessage('');
                handleClose();
            }, 2000);
        } catch (error) {
            console.error('Error adding product:', error);
            setError('Failed to add product.');
        }
    };


    return (
        <Modal className='modal-lg' show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Product</Modal.Title>
            </Modal.Header>
            <Modal.Body className='mbody two'>
                <ToastNotification toastMessage={toastMessage} />
                {error && <div className="alert alert-danger">{error}</div>}
                <Form onSubmit={handleFormSubmit}>
                    <Form.Group controlId="formProductName">
                        <Form.Label>Product Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter product name"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="formDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="formCategory">
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                            as="select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                                <option key={cat.category_id} value={cat.category_id}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="formPrice">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            placeholder="Enter price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="formQuantity">
                        <Form.Label>Quantity</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="formExpirationDate">
                        <Form.Label>Expiration Date</Form.Label>
                        <Form.Control
                            type="date"
                            placeholder="Enter expiration date"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formSize">
                        <Form.Label>Size</Form.Label>
                        <Form.Control
                            as="select"
                            value={size}
                            onChange={(e) => {
                                setSize(e.target.value);
                                if (e.target.value !== 'Other') {
                                    setCustomSize('');
                                }
                            }}
                            required
                        >
                            <option value="">Select size</option>
                            <option value="500">500</option>
                            <option value="100">100</option>
                            <option value="250">250</option>
                            <option value="300">300</option>
                            <option value="150">150</option>
                            <option value="Other">Other</option>
                        </Form.Control>
                        {size === 'Other' && (
                            <Form.Control
                                type="text"
                                placeholder="Enter custom size"
                                value={customSize}
                                onChange={(e) => setCustomSize(e.target.value)}
                                className="mt-2"
                            />
                        )}
                    </Form.Group>

                    <Form.Group controlId="formImageURL">
                        <Form.Label>Product Image URL</Form.Label>
                        <Form.Control
                            type="url"
                            placeholder="Enter product image URL"
                            value={imageURL}
                            onChange={(e) => setImageURL(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Add Product
                    </Button>
                </Form>
            </Modal.Body>

        </Modal>
    );
};

export default AddProductModal;
