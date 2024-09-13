import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Shop.css'; // Import CSS file
import Navigation from '../../components/Navigation';
import cartEventEmitter from '../../components/cartEventEmitter'; // Adjust the path as needed

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [currentCategoryPages, setCurrentCategoryPages] = useState({});
    const [currentRecommendationsPage, setCurrentRecommendationsPage] = useState(1);
    const [productsPerPage] = useState(4); // Number of products per page
    const [recommendationsPerPage] = useState(4); // Number of recommendations per page

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
        const userId = localStorage.getItem('customer_id'); // Ensure this key matches

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

    // Pagination logic for each category
    const paginate = (items, pageNumber, itemsPerPage) => {
        const startIndex = (pageNumber - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    };

    const handleCategoryPageChange = (category, direction) => {
        setCurrentCategoryPages(prev => {
            const newPage = Math.max(1, (prev[category] || 1) + direction);
            console.log(`Changing page for ${category}: ${newPage}`); // Debug log
            return {
                ...prev,
                [category]: newPage
            };
        });
    };

    const handleRecommendationsPageChange = (direction) => {
        setCurrentRecommendationsPage(prev => {
            const newPage = Math.max(1, prev + direction);
            console.log(`Changing recommendations page: ${newPage}`); // Debug log
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

            {showRecommendations && (
                <div className='recommendations-section'>
                    <h2>Recommended for You</h2>
                    <div className='product-list'>
                        {paginate(recommendedProducts, currentRecommendationsPage, recommendationsPerPage).map((product) => (
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
                    const paginatedProducts = paginate(categoryProducts, currentPage, productsPerPage);

                    return (
                        <div key={categoryName} className='category-section'>
                            <h2 className='category-title'>{categoryName}</h2>
                            <div className='product-list'>
                                {paginatedProducts.map((product) => (
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
