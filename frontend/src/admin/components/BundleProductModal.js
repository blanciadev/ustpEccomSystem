import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Pagination, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import ToastNotification from '../../public/components/ToastNotification';

const BundleProductModal = () => {
    const [show, setShow] = useState(false);
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [customPrice, setCustomPrice] = useState(0);
    const [discount, setDiscount] = useState('');
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const handleClose = () => {
        setShow(false);
        setSelectedCategory(null);
        setSelectedProducts([]);
    };

    const handleShow = () => {
        fetchProducts();
        setShow(true);
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5001/products-no-bundle');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const total = selectedProducts.reduce((acc, product) => {
            const discountedPrice = product.originalPrice - (product.originalPrice * discount / 100);
            return acc + discountedPrice;
        }, 0);

        setCustomPrice(total.toFixed(2));
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [selectedProducts, discount]);

    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    const handleBundleSubmit = async (e) => {
        e.preventDefault();

        const discountedProducts = selectedProducts.map(product => ({
            ...product,
            discountedPrice: (product.originalPrice - (product.originalPrice * discount / 100)).toFixed(2),
        }));

        const bundleData = {
            selectedProducts: discountedProducts,
            discount,
        };

        setLoading(true);

        try {
            await axios.post('http://localhost:5001/bundles', bundleData);
            setToastMessage('Bundle Created!');
            setTimeout(() => {
                setToastMessage('');
                handleClose();
            }, 2000);
        } catch (error) {
            console.error('Error creating bundle:', error);
            setToastMessage('Error Occurred!');
            setTimeout(() => {
                setToastMessage('');
                handleClose();
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelection = (product) => {
        if (!selectedCategory) {
            setSelectedCategory(product.category_name);
        }

        if (product.category_name !== selectedCategory) return;

        const updatedProduct = { ...product, originalPrice: product.price };
        setSelectedProducts((prevSelected) => {
            if (prevSelected.some((p) => p.product_id === product.product_id)) {
                return prevSelected.filter((p) => p.product_id !== product.product_id);
            } else {
                return [...prevSelected, updatedProduct];
            }
        });
    };

    const filteredProducts = selectedCategory
        ? products.filter(product => product.category_name === selectedCategory)
        : products;

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts((prevSelected) => {
            const updatedSelected = prevSelected.filter((product) => product.product_id !== productId);
            if (updatedSelected.length === 0) {
                setSelectedCategory(null);
            }
            return updatedSelected;
        });
    };

    const getDiscountedPrice = (product) => {
        const discountedPrice = product.originalPrice - (product.originalPrice * discount / 100);
        return discountedPrice.toFixed(2);
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                {isMobile ? (
                    <i className='bx bxs-discount'></i>
                ) : (
                    'Bundle A Product '
                )}
            </Button>

            <Modal className='modal-xl' show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create a Bundle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ToastNotification toastMessage={toastMessage} />
                    <Form onSubmit={handleBundleSubmit}>
                        {loading && <Spinner animation="border" variant="primary" />}

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

                        <h5>Selected Products</h5>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Original Price</th>
                                    <th>Discounted Price</th>
                                    <th>Category</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedProducts.map((product) => (
                                    <tr key={product.product_id}>
                                        <td>{product.product_name}</td>
                                        <td>{product.originalPrice}</td>
                                        <td>{getDiscountedPrice(product)}</td>
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

                        <Form.Group className="mb-3">
                            <Form.Label>Discount (%)</Form.Label>
                            <Form.Select
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                            >
                                <option value="">Select a discount</option>
                                <option value="5">5%</option>
                                <option value="10">10%</option>
                                <option value="15">15%</option>
                                <option value="20">20%</option>
                            </Form.Select>
                        </Form.Group>

                        <h5>Total Price: P{customPrice}</h5>

                        <Button variant="primary" type="submit">
                            Create Bundle
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default BundleProductModal;
