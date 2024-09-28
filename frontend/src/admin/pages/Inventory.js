import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import InventoryCountComponent from '../components/InventoryCountComponent';
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
                const response = await axios.get('http://localhost:5001/admin-products-with-interaction');
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
                    <i class='bx bx-clipboard'></i>
                    <h1>Inventory</h1>
                </div>
                <AdminHeader />
            </div>
            <div className='body'>
            <div className='user-con'>
                <InventoryCountComponent/>
                    <div className='report-list'>
                        <div className='cheader'>
                            <div className='search'>
                                <form>
                                <input type='search' placeholder='Search...'/>
                                </form>
                            </div>

                           
                        </div>
                        <div className='order-table'>
                            <table className='table table-hover'>
                                <thead className='bg-light sticky-top'>
                                <tr>
                                            <th><input type='checkbox' /></th>
                                            <th>Product Code</th>
                                            <th>Product Name</th>
                                            <th>Category</th>
                                            <th>Size</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total Amount</th>
                                            <th>Date</th>
                                        </tr>
                                </thead>
                                <tbody>
                                 
                                    <tr>
                                        <td><input type='checkbox' /></td>
                                            <td>Order ID</td>
                                            <td>Customer ID</td>
                                            <td>Order Date</td>
                                            <td>Status</td>
                                            <td>Order Date</td>
                                            <td>Status</td>
                                            <td>Order Date</td>
                                            <td>Status</td>
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
