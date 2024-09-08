import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { cartEventEmitter } from './eventEmitter'; // Import the event emitter

// ProductCard Component
const ProductCard = ({ product, onAddToCart }) => {
    if (!product) {
        return <div>Product data is not available</div>;
    }

    return (
        <div className='procard' style={{ width: '22%', margin: '1%' }}>
            <div className='productimg' style={{ width: '100%', height: '65%' }}>
                <img
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    src={product.image_url || 'https://via.placeholder.com/150'}
                    alt={product.product_name || 'Product Image'}
                />
            </div>
            <div className='productdesc' style={{ width: '100%', height: '35%' }}>
                <div className='product-data'>
                    <p>{product.product_name || 'No product name'}</p>
                    <div className='order-options'>
                        <button onClick={() => onAddToCart(product)}>Add to Cart</button>
                        <button>Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        image_url: PropTypes.string,
        product_name: PropTypes.string,
        product_id: PropTypes.number.isRequired
    }).isRequired,
    onAddToCart: PropTypes.func.isRequired
};

// ProductList Component
const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customerId, setCustomerId] = useState(null);

    useEffect(() => {
        // Fetch logged-in user's customer ID (user_id) from localStorage
        const storedCustomerId = localStorage.getItem('user_id');
        
        if (storedCustomerId) {
            setCustomerId(storedCustomerId);
        } else {
            console.log('Customer ID is not available in localStorage.');
        }

        // Fetch products from the backend
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/products');
                setProducts(response.data);
            } catch (error) {
                setError('Error fetching products: ' + (error.response ? error.response.data : error.message));
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.log('User not logged in');
            return; // Optionally, redirect to login here
        }

        if (!customerId) {
            console.log('Customer ID is missing. Please log in.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/add-to-cart', {
                customer_id: customerId,
                product_id: product.product_id,
                quantity: 1
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                console.log('Product added to cart:', product);
                // Emit the cartUpdated event to notify the Navigation component
                cartEventEmitter.emit('cartUpdated');
            }
        } catch (error) {
            console.error('Error adding product to cart:', error.response ? error.response.data : error.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (products.length === 0) {
        return <div>No products available</div>;
    }

    return (
        <div className='product-list' style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {products.map((product) => (
                <ProductCard key={product.product_id} product={product} onAddToCart={handleAddToCart} />
            ))}
        </div>
    );
};

export default ProductList;
