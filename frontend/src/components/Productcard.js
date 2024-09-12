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
                    <p>Quantity: {product.quantity}</p> {/* Display quantity */}
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
        product_code: PropTypes.string.isRequired,
        quantity: PropTypes.number // Ensure quantity is handled
    }).isRequired,
    onAddToCart: PropTypes.func.isRequired
};

// Group products by category
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

// ProductList Component
const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customerId, setCustomerId] = useState(null);

    useEffect(() => {
        const storedCustomerId = localStorage.getItem('customer_id');
        if (storedCustomerId) {
            setCustomerId(storedCustomerId);
        }

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
        if (!token || !customerId) {
            console.log('User not logged in or customer ID missing');
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

    const groupedProducts = groupProductsByCategory(products);

    return (
        <div className='category-list'>
            {Object.keys(groupedProducts).map((categoryName) => (
                <div key={categoryName} className='category-section'>
                    <h2>{categoryName}</h2> {/* Display category name */}
                    <div className='product-list' style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {groupedProducts[categoryName].map((product) => (
                            <ProductCard key={product.product_code} product={product} onAddToCart={handleAddToCart} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductList;
