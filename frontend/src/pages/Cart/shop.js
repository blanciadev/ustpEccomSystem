import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Shop.css'; // Import CSS file
import Navigation from '../../components/Navigation';
import cartEventEmitter from '../../components/cartEventEmitter'; // Adjust the path as needed

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
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

    useEffect(() => {
        // Retrieve user_id and token from localStorage
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('customer_id'); // Ensure this key matches

        if (token && userId) {
            console.log('User ID:', userId);
            console.log('Token:', token);
        } else {
            console.log('User not logged in or user ID missing');
        }

        // Example of adding a listener for cart updates
        const handleCartUpdate = (data) => {
            console.log('Cart updated:', data);
        };

        cartEventEmitter.on('cartUpdated', handleCartUpdate);

        // Cleanup listener on component unmount
        return () => {
            cartEventEmitter.off('cartUpdated', handleCartUpdate);
        };
    }, []);

    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('customer_id'); // Ensure this key matches

        if (!token || !userId) {
            console.log('User not logged in or user ID missing');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/add-to-cart',
                {
                    product_code: product.product_code,
                    quantity: 1 // Adjust quantity as needed
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.status === 200) {
                console.log('Product added to cart');
                // Emit cart update event
                cartEventEmitter.emit('cartUpdated', {
                    product_code: product.product_code,
                    quantity: 1
                });
            }
        } catch (error) {
            console.error('Error adding product to cart:', error.response ? error.response.data : error.message);
        }
    };

    const groupProductsByCategory = (products) => {
        return products.reduce((categories, product) => {
            const category = product.category_name || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(product);
            return categories;
        }, {});
    };

    const groupedProducts = groupProductsByCategory(products);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='shop-container'>
            <Navigation />
            {Object.keys(groupedProducts).map((categoryName) => (
                <div key={categoryName} className='category-section'>
                    <h2 className='category-title'>{categoryName}</h2>
                    <div className='product-list'>
                        {groupedProducts[categoryName].map((product) => (
                            <div key={product.product_code} className='product-item'>
                                <div className='product-img'>
                                    <img
                                        src={product.image_url || 'https://via.placeholder.com/150'}
                                        alt={product.product_name || 'Product Image'}
                                    />
                                </div>
                                <div className='product-desc'>
                                    <p className='product-name'>{product.product_name || 'No product name'}</p>
                                    <p className='product-quantity'>Quantity: {product.quantity}</p>
                                    <p className='product-price'>Price: ${product.price}</p>
                                    <p className='product-brand'>Brand: {product.brand}</p>
                                    <button
                                        className='add-to-cart-button'
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        Add to Cart
                                    </button>
                                    <button className='buy-now-button'>Buy Now</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Shop;
