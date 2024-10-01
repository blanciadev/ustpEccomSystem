import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Pagination, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const BundleProductModal = () => {
    const [show, setShow] = useState(false);
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [customPrice, setCustomPrice] = useState(0); // This can be used for displaying total
    const [discount, setDiscount] = useState(''); // Use a string to match the dropdown value type
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const handleClose = () => {
        setShow(false);
        setMessage(null);
        setError(null); // Reset error message when closing modal
    };
    const handleShow = () => {
        fetchProducts();
        setShow(true);
    };

    // Fetch products from the backend
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5001/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate the total price of selected products
    useEffect(() => {
        const total = selectedProducts.reduce((acc, product) => acc + product.price, 0);
        const finalPrice = discount ? total - (total * discount / 100) : total;
        setCustomPrice(finalPrice.toFixed(2)); // Set custom price to state
    }, [selectedProducts, discount]); // Recalculate whenever selectedProducts or discount changes

    // Handle form submission (selected products)
    const handleBundleSubmit = async (e) => {
        e.preventDefault();

        // Create the bundle with selected products and discount
        const bundleData = {
            selectedProducts, // Include selected products in the request
            discount,
        };

        setLoading(true); // Set loading state

        try {
            // Create the bundle and get the response
            await axios.post('http://localhost:5001/bundles', bundleData);

            setMessage('Bundle created successfully!'); // Set success message
            setSelectedProducts([]); // Clear selected products after submission
        } catch (error) {
            console.error('Error creating bundle:', error);
            setError('Failed to create bundle. Please try again.'); // Set error message
        } finally {
            setLoading(false); // Reset loading state
            handleClose(); // Close the modal
        }
    };

    // Handle product selection toggle
    const handleProductSelection = (product) => {
        setSelectedProducts((prevSelected) => {
            if (prevSelected.includes(product)) {
                return prevSelected.filter((p) => p.product_id !== product.product_id);
            } else {
                return [...prevSelected, product];
            }
        });
    };

    // Pagination Logic
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Remove product from bundle
    const handleRemoveProduct = (productId) => {
        setSelectedProducts((prevSelected) =>
            prevSelected.filter((product) => product.product_id !== productId)
        );
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Bundle Products
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create a Bundle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleBundleSubmit}>
                        {/* Loading Indicator */}
                        {loading && <Spinner animation="border" variant="primary" />}

                        {/* Products Table */}
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>Product Name</th>
                                    <th>Price</th>
                                    <th>Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.map((product) => (
                                    <tr key={product.product_id}>
                                        <td>
                                            <Form.Check
                                                type="checkbox"
                                                checked={selectedProducts.some(
                                                    (p) => p.product_id === product.product_id
                                                )}
                                                onChange={() => handleProductSelection(product)}
                                            />
                                        </td>
                                        <td>{product.product_name}</td>
                                        <td>{product.price}</td>
                                        <td>{product.category_name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {/* Selected Products Table */}
                        <h5>Selected Products</h5>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Price</th>
                                    <th>Category</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedProducts.map((product) => (
                                    <tr key={product.product_id}>
                                        <td>{product.product_name}</td>
                                        <td>{product.price}</td>
                                        <td>{product.category_name}</td>
                                        <td>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleRemoveProduct(product.product_id)}
                                            >
                                                Remove
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {/* Discount Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label>Discount (%)</Form.Label>
                            <Form.Select
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)} // Just set discount value
                            >
                                <option value="">Select a discount</option>
                                <option value="5">5%</option>
                                <option value="10">10%</option>
                                <option value="15">15%</option>
                                <option value="20">20%</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Total Price */}
                        <h5>Total Price: ${customPrice}</h5>

                        <Button variant="primary" type="submit">
                            Create Bundle
                        </Button>

                        {/* Show success or error message */}
                        {message && <Alert variant="success">{message}</Alert>}
                        {error && <Alert variant="danger">{error}</Alert>}
                    </Form>

                    {/* Pagination Controls */}
                    <Pagination>
                        {[...Array(totalPages).keys()].map((page) => (
                            <Pagination.Item
                                key={page + 1}
                                active={page + 1 === currentPage}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                {page + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default BundleProductModal;
