import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import InventoryCountComponent from '../components/InventoryCountComponent';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import ProductStatistics from '../components/ProductStatistics';
import TopProduct from '../components/TopProduct';

const Inventory = () => {
    const [bestSellingCount, setBestSellingCount] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [lowStockQuantity, setLowStockQuantity] = useState(0);
    const [unpopularProducts, setUnpopularProducts] = useState(0);
    const [outOfStockCount, setOutOfStockCount] = useState(0);
    const [outOfStockQuantity, setOutOfStockQuantity] = useState(0);
    const [discontinuedCount, setDiscontinuedCount] = useState(0);
    const [discontinuedQuantity, setDiscontinuedQuantity] = useState(0);
    const [productNames, setProductNames] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    const fetchProductStatistics = async () => {
        try {
            const response = await axios.get('http://localhost:5001/admin-products-with-interaction');
            const {
                total,
                totalQuantity,
                lowStockCount,
                lowStockQuantity,
                unpopularProducts,
                outOfStockCount,
                outOfStockQuantity,
                discontinuedCount,
                discontinuedQuantity,
            } = response.data;

            setBestSellingCount(total);
            setTotalQuantity(totalQuantity);
            setLowStockCount(lowStockCount);
            setLowStockQuantity(lowStockQuantity);
            setUnpopularProducts(unpopularProducts || 0);
            setOutOfStockCount(outOfStockCount);
            setOutOfStockQuantity(outOfStockQuantity);
            setDiscontinuedCount(discontinuedCount);
            setDiscontinuedQuantity(discontinuedQuantity);
        } catch (error) {
            console.error('Error fetching product statistics:', error);
        }
    };

    const fetchProductNames = async () => {
        try {
            const response = await axios.get('http://localhost:5001/admin-products');
            setProductNames(response.data);
        } catch (error) {
            console.error('Error fetching product names:', error);
        }
    };

    const fetchInventoryItems = async () => {
        try {
            const response = await axios.get('http://localhost:5001/admin-inventory');
            setInventoryItems(response.data);
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        }
    };

    useEffect(() => {
        fetchProductStatistics();
        fetchProductNames();
        fetchInventoryItems();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        // You can implement search logic here if necessary
        // For example, filtering `productNames` based on `searchTerm`
    };

    return (
        <div className="dash-con">
            <AdminNav />
            <div className="dash-board">
                <div className="dash-header">
                    <div className="header-title">
                        <i className="bx bxs-spa"></i>
                        <h1>Products</h1>
                    </div>
                    <AdminHeader />
                </div>

                <div className="dash-body">
                    <div className="product-con">
                        {/* Product Statistics */}
                        <div className="product-one">
                            <ProductStatistics
                                bestSellingCount={bestSellingCount}
                                totalQuantity={totalQuantity}
                                lowStockCount={lowStockCount}
                                lowStockQuantity={lowStockQuantity}
                                unpopularProducts={unpopularProducts}
                                outOfStockCount={outOfStockCount}
                                outOfStockQuantity={outOfStockQuantity}
                                discontinuedCount={discontinuedCount}
                                discontinuedQuantity={discontinuedQuantity}
                            />
                            <TopProduct />
                        </div>

                        {/* Product Table */}
                        <div className="product-two">
                            <div className="order-header">
                                <div className="order-search">
                                    <form onSubmit={handleSearch}>
                                        <input
                                            type="search"
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <button type="submit">Search</button>
                                    </form>
                                </div>
                            </div>

                            <div className="order-table table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Product ID</th>
                                            <th>Code</th>
                                            <th>Name</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Category</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productNames
                                            .filter(product => product.product_name.toLowerCase().includes(searchTerm.toLowerCase())) // Implementing search filter
                                            .map((product) => {
                                                // Determine stock status based on quantity
                                                let stockStatus = 'Low on Stock';
                                                if (product.quantity > 50) {
                                                    stockStatus = 'Good Stocks';
                                                } else if (product.quantity > 20) {
                                                    stockStatus = 'Moderately Low';
                                                }

                                                return (
                                                    <tr key={product.product_id}>
                                                        <td>{product.product_id}</td>
                                                        <td>{product.product_code}</td>
                                                        <td>{product.product_name}</td>
                                                        <td>{product.price}</td>
                                                        <td>{product.quantity}</td>
                                                        <td>{product.category_name}</td>
                                                        <td>{stockStatus}</td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>



            </div>
        </div>
    );
};

export default Inventory;