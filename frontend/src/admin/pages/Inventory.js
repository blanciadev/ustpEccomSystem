import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';
import ProductStatistics from '../components/ProductStatistics';

const ITEMS_PER_PAGE = 10;

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
    const [currentPage, setCurrentPage] = useState(1);

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
            console.log('Product Names:', response.data);
        } catch (error) {
            console.error('Error fetching product names:', error);
        }
    };

    const fetchInventoryItems = async () => {
        try {
            const response = await axios.get('http://localhost:5001/admin-inventory');
            setInventoryItems(response.data);
            console.log('Inventory Items:', response.data);
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
        setCurrentPage(1);
    };

    const filteredProducts = productNames.filter(product => {
        return (
            product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.price.toString().includes(searchTerm) ||
            product.quantity.toString().includes(searchTerm)
        );
    });

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const currentProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="dash-con">
            <AdminNav />
            <div className="dash-board">
                <div className="dash-header">
                    <div className="header-title">
                        <i className="bx bxs-clipboard"></i>
                        <h1>Inventory</h1>
                    </div>
                    <AdminHeader />
                </div>

                <div className="body">
                    <div className="inventory-con">
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

                        <div className="product-two">
                            <div className="cheader">
                                <div className="search">
                                    <form onSubmit={handleSearch}>
                                        <input
                                            type="search"
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </form>
                                </div>
                            </div>

                            <div className="inv-table table-responsive">
                                <table className="table table-hover">
                                    <thead className='bg-light sticky-top'>
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
                                        {currentProducts.map((product) => {
                                            let stockStatus = 'Low on Stock';
                                            let isLowStock = false;

                                            if (product.quantity > 100) {
                                                stockStatus = 'Good Stocks';
                                            } else if (product.quantity > 20) {
                                                stockStatus = 'Moderately Low';
                                            } else {
                                                isLowStock = true;
                                            }

                                            return (
                                                <tr key={product.product_id}>
                                                    <td>{product.product_id}</td>
                                                    <td>{product.product_code}</td>
                                                    <td>{product.product_name}</td>
                                                    <td>₱ {product.price}</td>

                                                    <td className={isLowStock ? 'blinking' : ''}>{product.quantity}</td>

                                                    <td>{product.category_name}</td>
                                                    <td>{stockStatus}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <nav>
                                <ul className="pagination">
                                    {[...Array(totalPages)].map((_, index) => (
                                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
