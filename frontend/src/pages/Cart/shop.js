import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Shop.css'; // Import CSS file
import Navigation from '../../components/Navigation';
import { cartEventEmitter } from '../../components/eventEmitter'; 

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [topPickedProducts, setTopPickedProducts] = useState([]); // State for top picked products
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [currentCategoryPages, setCurrentCategoryPages] = useState({});
    const [currentRecommendationsPage, setCurrentRecommendationsPage] = useState(1);
    const [productsPerPage] = useState(4); // Number of products per page
    const [recommendationsPerPage] = useState(4); // Number of recommendations per page

    // Fetch all products
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

    // Fetch recommended products
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('customer_id');

        if (token && userId) {
            const fetchRecommendedProducts = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/product-user', {
                        params: { customerId: userId }
                    });
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

    // Fetch top user-picked products
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

    // Handle product interaction
    const handleProductInteraction = async (product_code) => {
        console.log('Product interacted with, Code:', product_code);

        try {
            await axios.get('http://localhost:5000/products-interaction', {
                params: { product_code }
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
                quantity: 1 // Adjust quantity as needed
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        console.log('Product added to cart');
        
        // Emit cart updated event with product info and quantity
        cartEventEmitter.emit('cartUpdated', {
            product_code: product.product_code,
            quantity: 1
        });
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

            {/* Top Picks Section */}
            <div className='top-picks-section'>
                <h2>Top Picks</h2>
                <div className='product-list'>
                    {topPickedProducts.map((product) => (
                        <div
                            key={product.product_code}
                            className='product-item'
                            onMouseEnter={() => handleProductInteraction(product.product_code)}
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

            {/* Recommended and General Products Sections */}
            {showRecommendations && (
                <div className='recommendations-section'>
                    <h2>Recommended for You</h2>
                    <div className='product-list'>
                        {paginate(recommendedProducts, currentRecommendationsPage, recommendationsPerPage).map((product) => (
                            <div
                                key={product.product_code}
                                className='product-item'
                                onMouseEnter={() => handleProductInteraction(product.product_code)}
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

            <div className='general-products-section'>
                <h2>All Products</h2>
                {Object.keys(groupedProducts).map((categoryName) => {
                    const categoryProducts = groupedProducts[categoryName];
                    const currentPage = currentCategoryPages[categoryName] || 1;

                    return (
                        <div key={categoryName} className='category-section'>
                            <h3>{categoryName}</h3>
                            <div className='product-list'>
                                {paginate(categoryProducts, currentPage, productsPerPage).map((product) => (
                                    <div
                                        key={product.product_code}
                                        className='product-item'
                                        onMouseEnter={() => handleProductInteraction(product.product_code)}
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
                                    onClick={() => handleCategoryPageChange(categoryName, -1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span>Page {currentPage} of {totalPages(categoryProducts, productsPerPage)}</span>
                                <button
                                    onClick={() => handleCategoryPageChange(categoryName, 1)}
                                    disabled={currentPage === totalPages(categoryProducts, productsPerPage)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Shop;
