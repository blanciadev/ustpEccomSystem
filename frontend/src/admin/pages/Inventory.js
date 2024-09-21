import React, { useState, useEffect } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import TopProduct from '../components/TopProduct';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap'; // Import Bootstrap Modal and Button

const Inventory = () => {
    const [bestSellingCount, setBestSellingCount] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [lowStockQuantity, setLowStockQuantity] = useState(0);
    const [productNames, setProductNames] = useState([]);
    const [unpopularProducts, setUnpopularProducts] = useState([]);
    const [outOfStockCount, setOutOfStockCount] = useState(0);
    const [outOfStockQuantity, setOutOfStockQuantity] = useState(0);
    const [discontinuedCount, setDiscontinuedCount] = useState(0);
    const [discontinuedQuantity, setDiscontinuedQuantity] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/admin-products-with-interaction');
                const {
                    total,
                    totalQuantity,
                    products,
                    lowStockCount,
                    lowStockQuantity,
                    unpopularProducts,
                    outOfStockCount,
                    outOfStockQuantity,
                    discontinuedCount,
                    discontinuedQuantity
                } = response.data;

                setBestSellingCount(total);
                setTotalQuantity(totalQuantity);
                setLowStockCount(lowStockCount);
                setLowStockQuantity(lowStockQuantity);
                setProductNames(products);
                setUnpopularProducts(unpopularProducts || []);
                setOutOfStockCount(outOfStockCount);
                setOutOfStockQuantity(outOfStockQuantity);
                setDiscontinuedCount(discontinuedCount);
                setDiscontinuedQuantity(discontinuedQuantity);
            } catch (error) {
                console.error('Error fetching product data:', error);
            }
        };

        fetchProductData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        // Add search logic here
    };

    return (
        <div className='dash-con'>
            <AdminNav />
            <div className='dash-board'>
                <div className='dash-header'>
                    <div className='header-title'>
                        <i className='bx bxs-spa'></i>
                        <h1>Products</h1>
                    </div>
                    <AdminHeader />
                </div>

                <div className='dash-body'>
                    <div className='product-con'>
                        <div className='product-one'>
                            <div className='product-qty'>
                                <div className='best-selling'>
                                    <div className='qty'>
                                        <i className='bx bxs-spa'></i>
                                        <h6>{bestSellingCount}</h6> {/* Displaying the count */}
                                    </div>
                                    <div>
                                        <h6>Best Selling</h6>
                                    </div>
                                </div>

                                <div className='in-stock'>
                                    <div className='qty'>
                                        <i className='bx bxs-spa'></i>
                                        <h6>{totalQuantity}</h6> {/* Displaying the total quantity */}
                                    </div>
                                    <div>
                                        <h6>Total Stock</h6>
                                    </div>
                                </div>

                                <div className='low-stock'>
                                    <div className='qty'>
                                        <i className='bx bxs-spa'></i>
                                        <h6>{lowStockCount}</h6> {/* Displaying the low stock count */}
                                    </div>
                                    <div>
                                        <h6>Low Stock</h6>
                                    </div>
                                </div>

                                <div className='unpopular'>
                                    <div className='qty'>
                                        <i className='bx bxs-spa'></i>
                                        <h6>{unpopularProducts.length}</h6> {/* Displaying the count of unpopular products */}
                                    </div>
                                    <div>
                                        <h6>Unpopular</h6>
                                        <ul>
                                            {/* Display unpopular products */}
                                            {unpopularProducts.map((product, index) => (
                                                <li key={index}>{product}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className='out-of-stock'>
                                    <div className='qty'>
                                        <i className='bx bxs-spa'></i>
                                        <h6>{outOfStockCount}</h6> {/* Displaying the count of out-of-stock items */}
                                    </div>
                                    <div>
                                        <h6>Out of Stock</h6>
                                    </div>
                                </div>

                                <div className='discontinued'>
                                    <div className='qty'>
                                        <i className='bx bxs-spa'></i>
                                        <h6>{discontinuedCount}</h6>
                                    </div>
                                    <div>
                                        <h6>Discontinued</h6>
                                    </div>
                                </div>
                            </div>
                            <TopProduct />
                        </div>

                        <div className='product-two'>
                            {/* Table */}
                            <div className='order-header'>
                                <div className='order-search'>
                                    <form onSubmit={handleSearch}>
                                        <input type='search' placeholder='Search products...' />
                                        <button type='submit'>Search</button>
                                    </form>
                                </div>

                                {/* Add a button to trigger modal */}
                                <div className='order-options'>
                                    <div className='order-print'>
                                        <button>Print Order Summary</button>
                                    </div>
                                    <div className='order-sort'>
                                        <label htmlFor="sort">Sort By</label>
                                        <select name="sort" id="sort">
                                            <option value="date">Date</option>
                                            <option value="status">Status</option>
                                            <option value="id">ID</option>
                                            <option value="customer-id">Customer</option>
                                        </select>
                                    </div>
                                    <div className='order-add'>
                                        <Button variant="primary" onClick={handleShowModal}>
                                            Add Product
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className='order-table'>
                                <table>
                                    <thead>
                                        <tr>
                                            <th><input type='checkbox' /></th>
                                            <th>Order ID</th>
                                            <th>Customer ID</th>
                                            <th>Order Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><input type='checkbox' /></td>
                                            <td>Order ID</td>
                                            <td>Customer ID</td>
                                            <td>Order Date</td>
                                            <td>Status</td>
                                            <td><button>View</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for adding products */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Add product form goes here */}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCloseModal}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Inventory;
