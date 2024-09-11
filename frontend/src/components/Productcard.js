import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { cartEventEmitter } from './eventEmitter'; // Import the event emitter
import { useNavigate } from 'react-router-dom';

// ProductCard Component
const ProductCard = ({ product, onAddToCart }) => {
    if (!product) {
        return <div>Product data is not available</div>;
    }

    return (
        <div className='procard' style={{
            width: '300px',
            margin: '1%',
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s'
        }}>
            <div className='productimg' style={{
                width: '100%',
                height: '200px',
                overflow: 'hidden'
            }}>
                <img
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s'
                    }}
                    src={product.image_url || 'https://via.placeholder.com/300'}
                    alt={product.product_name || 'Product Image'}
                />
            </div>
            <div className='productdesc' style={{
                padding: '16px'
            }}>
                <p style={{
                    fontSize: '1.1em',
                    fontWeight: 'bold',
                    margin: '0 0 8px'
                }}>
                    {product.product_name || 'No product name'}
                </p>
                <div className='product-details' style={{
                    marginBottom: '16px'
                }}>
                    <p style={{
                        margin: '0',
                        color: '#555'
                    }}>
                        {product.description || 'No description available'}
                    </p>
                </div>
                <div className='order-options' style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <button
                        onClick={() => onAddToCart(product)}
                        style={{
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        Add to Cart
                    </button>
                    <button
                        style={{
                            backgroundColor: '#28a745',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        image_url: PropTypes.string,
        product_name: PropTypes.string,
        product_code: PropTypes.string.isRequired,
        description: PropTypes.string
    }).isRequired,
    onAddToCart: PropTypes.func.isRequired
};

// ProductList Component
const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customerId, setCustomerId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedCustomerId = localStorage.getItem('user_id');

        if (token && storedCustomerId) {
            setCustomerId(storedCustomerId);
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }

        const fetchProducts = async () => {
            setLoading(true);

            try {
                let url = 'http://localhost:5000/products';

                if (isLoggedIn) {
                    if (customerId) {
                        url = `http://localhost:5000/product-user?customerId=${customerId}`;
                    }
                }

                const response = await axios.get(url);
                setProducts(response.data);
            } catch (error) {
                setError('Error fetching products: ' + (error.response ? error.response.data : error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [isLoggedIn, customerId]);

    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.log('User not logged in');
            navigate('/login');
            return;
        }

        if (!customerId) {
            console.log('Customer ID is missing. Please log in.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/add-to-cart', {
                customer_id: customerId,
                product_code: product.product_code,
                quantity: 1
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                console.log('Product added to cart:', product);
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
                <ProductCard key={product.product_code} product={product} onAddToCart={handleAddToCart} />
            ))}
        </div>
    );
};

export default ProductList;
