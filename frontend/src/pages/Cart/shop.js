import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Shop.css';
import Navigation from '../../components/Navigation';
import { cartEventEmitter } from '../../components/eventEmitter';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [topPickedProducts, setTopPickedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [currentCategoryPages, setCurrentCategoryPages] = useState({});
    const [currentRecommendationsPage, setCurrentRecommendationsPage] = useState(1);
    const [productsPerPage] = useState(4);
    const [recommendationsPerPage] = useState(4);

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
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('customer_id');

        if (token && userId) {
            const fetchRecommendedProducts = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/recommend-products`);
                    setRecommendedProducts(response.data);
                    setShowRecommendations(true);
                } catch (error) {
                    console.error('Error fetching recommended products:', error.response ? error.response.data : error.message);
                }
            };

            fetchRecommendedProducts();
        } else {
            console.log('User not logged in or user ID missing');
        }

        const handleCartUpdate = (data) => {
            console.log('Cart updated:', data);
        };

        cartEventEmitter.on('cartUpdated', handleCartUpdate);

        return () => {
            cartEventEmitter.off('cartUpdated', handleCartUpdate);
        };
    }, []);

    useEffect(() => {
        const fetchTopPickedProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/products-top-picks');
                setTopPickedProducts(response.data);
            } catch (error) {
                console.error('Error fetching top-picked products:', error.response ? error.response.data : error.message);
            }
        };

        fetchTopPickedProducts();
    }, []);


    const handleProductInteraction = async (productCode, interactionType) => {
        const customerId = localStorage.getItem('customer_id'); // Retrieve customer ID from local storage
        if (!customerId) {
            console.log('Customer ID is not available');
            return;
        }

        try {
            await axios.get('http://localhost:5000/products-interaction', {
                params: {
                    product_code: productCode,
                    customerId: customerId,
                    interaction_type: interactionType
                }
            });
            console.log('Product interaction updated');
        } catch (error) {
            console.error('Error updating product interaction:', error.response ? error.response.data : error.message);
        }
    };

    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('customer_id');

        if (!token || !userId) {
            console.log('User not logged in or user ID missing');
            return;
        }

        try {
            await axios.post(
                'http://localhost:5000/add-to-cart',
                {
                    product_code: product.product_code,
                    quantity: 1
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            console.log('Product added to cart');

            cartEventEmitter.emit('cartUpdated', {
                product_code: product.product_code,
                quantity: 1
            });

            // Log interaction as 'cart'
            handleProductInteraction(product.product_code, 'cart');
        } catch (error) {
            console.error('Error adding product to cart:', error.response ? error.response.data : error.message);
        }
    };

    const handleProductClick = async (product_code) => {
        // Log interaction as 'view'
        await handleProductInteraction(product_code, 'view');
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

    const paginate = (items, pageNumber, itemsPerPage) => {
        const startIndex = (pageNumber - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    };

    const handleCategoryPageChange = (category, direction) => {
        setCurrentCategoryPages(prev => {
            const newPage = Math.max(1, (prev[category] || 1) + direction);
            return {
                ...prev,
                [category]: newPage
            };
        });
    };

    const handleRecommendationsPageChange = (direction) => {
        setCurrentRecommendationsPage(prev => {
            const newPage = Math.max(1, prev + direction);
            return newPage;
        });
    };

    const totalPages = (items, itemsPerPage) => Math.ceil(items.length / itemsPerPage);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='shop-container'>
            <Navigation />

            <div className='top-picks-section'>
                <h2>Top Picks</h2>
                <div className='product-list'>
                    {topPickedProducts.map((product) => (
                        <div
                            key={product.product_code}
                            className='product-item'
                            onClick={() => handleProductClick(product.product_code)}
                        >
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

            {showRecommendations && (
                <div className='recommendations-section'>
                    <h2>Recommended for You</h2>
                    <div className='product-list'>
                        {paginate(recommendedProducts, currentRecommendationsPage, recommendationsPerPage).map((product) => (
                            <div
                                key={product.product_code}
                                className='product-item'
                                onClick={() => handleProductClick(product.product_code)}
                            >
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
                    <div className='pagination'>
                        <button
                            onClick={() => handleRecommendationsPageChange(-1)}
                            disabled={currentRecommendationsPage === 1}
                        >
                            Previous
                        </button>
                        <span>Page {currentRecommendationsPage} of {totalPages(recommendedProducts, recommendationsPerPage)}</span>
                        <button
                            onClick={() => handleRecommendationsPageChange(1)}
                            disabled={currentRecommendationsPage === totalPages(recommendedProducts, recommendationsPerPage)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {Object.entries(groupedProducts).map(([category, productsInCategory]) => (
                <div key={category} className='category-section'>
                    <h2>{category}</h2>
                    <div className='product-list'>
                        {paginate(productsInCategory, currentCategoryPages[category] || 1, productsPerPage).map((product) => (
                            <div
                                key={product.product_code}
                                className='product-item'
                                onClick={() => handleProductClick(product.product_code)}
                            >
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
                    <div className='pagination'>
                        <button
                            onClick={() => handleCategoryPageChange(category, -1)}
                            disabled={(currentCategoryPages[category] || 1) === 1}
                        >
                            Previous
                        </button>
                        <span>Page {currentCategoryPages[category] || 1} of {totalPages(productsInCategory, productsPerPage)}</span>
                        <button
                            onClick={() => handleCategoryPageChange(category, 1)}
                            disabled={(currentCategoryPages[category] || 1) === totalPages(productsInCategory, productsPerPage)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Shop;
