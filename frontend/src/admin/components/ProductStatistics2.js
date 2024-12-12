import React, { useState } from 'react';
import ModalStatistics from './ModalStatistics'; // Import the Modal component

const ProductStatistics2 = ({
    bestSellingCount = 10,
    totalQuantity = 100,
    lowStockCount = 5,
    unpopularProducts = [],
    outOfStockCount = 3,
    discontinuedCount = 2,
    bestSellingProductsData = [
        { productCode: 'BS001', productName: 'Product A', quantity: 50, price: 100 },
        { productCode: 'BS002', productName: 'Product B', quantity: 30, price: 150 },
        { productCode: 'BS003', productName: 'Product C', quantity: 20, price: 200 },
    ],
    unpopularProductsData = [
        { productCode: 'UP001', productName: 'Product X', quantity: 1, price: 20 },
        { productCode: 'UP002', productName: 'Product Y', quantity: 2, price: 25 },
    ],
    discontinuedProductsData = [
        { productCode: 'DP001', productName: 'Product Z', quantity: 0, price: 0 },
    ],
    inStockProductsData = [
        { productCode: 'IS001', productName: 'Product D', quantity: 50, price: 120 },
        { productCode: 'IS002', productName: 'Product E', quantity: 80, price: 90 },
    ],
    lowStockProductsData = [
        { productCode: 'LS001', productName: 'Product F', quantity: 5, price: 50 },
    ],
    outOfStockProductsData = [
        { productCode: 'OS001', productName: 'Product G', quantity: 0, price: 0 },
    ],
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState(''); // State for modal description/content
    const [tableData, setTableData] = useState([]); // State for table data

    const openModal = (title, content, data) => {
        setModalTitle(title); // Set the modal title
        setModalContent(content); // Set the modal description
        setTableData(data); // Set the table data
        setIsModalOpen(true); // Open the modal
    };

    const closeModal = () => {
        setIsModalOpen(false); // Close the modal
        setModalTitle(''); // Reset the title
        setModalContent(''); // Reset the content
        setTableData([]); // Reset the table data
    };

    const renderTable = (data) => (
        <table className="table">
            <thead>
                <tr>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        <td>{item.productCode}</td>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className='product-qty'>
            {/* Best Selling Section */}
            <div
                className='best-selling'
                onClick={() => {
                    openModal(
                        'Best Selling Products',
                        'These are the top-selling products in your inventory.',
                        bestSellingProductsData
                    );
                }}
                style={{ cursor: 'pointer' }}
            >
                <div className='qty'>
                    <i className='bx bxs-spa'></i>
                    <h6>{bestSellingCount}</h6>
                </div>
                <div>
                    <h6>Best Selling</h6>
                </div>
            </div>

            {/* Modal */}
            <ModalStatistics
                isOpen={isModalOpen}
                title={modalTitle}
                onClose={closeModal}
            >
                <p>{modalContent}</p>
                {/* Render table only when modal content has data */}
                {tableData.length > 0 && renderTable(tableData)}
            </ModalStatistics>

            {/* Other Sections */}
            <div
                className='unpopular'
                onClick={() =>
                    openModal(
                        'Unpopular Products',
                        'Products with the least sales in your inventory.',
                        unpopularProductsData
                    )
                }
                style={{ cursor: 'pointer' }}
            >
                <div className='qty'>
                    <i className='bx bxs-spa'></i>
                    <h6>{unpopularProducts ? unpopularProducts.length : 0}</h6>
                </div>
                <div>
                    <h6>Unpopular</h6>
                </div>
            </div>

            <div
                className='discontinued'
                onClick={() =>
                    openModal(
                        'Total Items',
                        'Total number of products that are available.',
                        discontinuedProductsData
                    )
                }
                style={{ cursor: 'pointer' }}
            >
                <div className='qty'>
                    <i className='bx bxs-spa'></i>
                    {/* Replace discontinued with the total number of products - 51 should be the result */}
                    <h6>{discontinuedCount}</h6>
                </div>
                <div>
                    <h6>Total Products</h6>
                </div>
            </div>

            <div
                className='in-stock'
                onClick={() =>
                    openModal(
                        'In Stock',
                        'These are the products currently in stock.',
                        inStockProductsData
                    )
                }
                style={{ cursor: 'pointer' }}
            >
                <div className='qty'>
                    <i className='bx bxs-spa'></i>
                    <h6>{totalQuantity}</h6>
                </div>
                <div>
                    <h6>In Stock</h6>
                </div>
            </div>

            <div
                className='low-stock'
                onClick={() =>
                    openModal(
                        'Low Stock',
                        'Products that are running low in quantity.',
                        lowStockProductsData
                    )
                }
                style={{ cursor: 'pointer' }}
            >
                <div className='qty'>
                    <i className='bx bxs-spa'></i>
                    <h6>{lowStockCount}</h6>
                </div>
                <div>
                    <h6>Low Stock</h6>
                </div>
            </div>

            <div
                className='out-of-stock'
                onClick={() =>
                    openModal(
                        'Out of Stock',
                        'These products are currently out of stock.',
                        outOfStockProductsData
                    )
                }
                style={{ cursor: 'pointer' }}
            >
                <div className='qty'>
                    <i className='bx bxs-spa'></i>
                    <h6 className="text-dark">{outOfStockCount}</h6>
                </div>
                <div>
                    <h6 className="text-dark">Out of Stock</h6>
                </div>
            </div>
        </div>
    );
};

export default ProductStatistics2;
