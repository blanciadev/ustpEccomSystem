// src/components/ProductTable.js
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import UpdateProductModal from './UpdateProductModal';

const ProductTable = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/admin-products'); 
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching product data:', error);
            }
        };

        fetchProducts();
    }, []);

    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleUpdateProduct = async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin-products'); 
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching updated product data:', error);
        }
    };

    return (
        <>
            <div className='order-table table-responsive'>
                <table className="table">
                    <thead>
                        <tr>
                            <th><input type='checkbox' /></th>
                            <th>Product Code</th>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Description</th>
                            <th>Image</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.product_id}>
                                <td><input type='checkbox' /></td>
                                <td>{product.product_code}</td>
                                <td>{product.product_name}</td>
                                <td>${product.price}</td>
                                <td>{product.category_name}</td>
                                <td>{product.quantity}</td>
                                <td>{product.description}</td>
                                <td>
                                    <img src={product.product_image} alt={product.product_name} width="100" />
                                </td>
                                <td>
                                    <Button variant="secondary" onClick={() => handleViewProduct(product)}>
                                        View
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedProduct && (
                <UpdateProductModal
                    show={isModalOpen}
                    product={selectedProduct}
                    handleClose={handleCloseModal}
                    handleUpdate={handleUpdateProduct}
                />
            )}
        </>
    );
};

export default ProductTable;
