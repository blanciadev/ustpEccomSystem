import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './modal.css';

const ProductModal = ({ isOpen, product, onAddToCart, onClose }) => {
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(3); // Set number of products per page

    useEffect(() => {
        if (product) {
            setLoading(true);
            setError(null);

            fetch('http://localhost:5000/products-recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_code: product.product_code }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    setRecommendedProducts(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching recommendations:', error);
                    setError('Failed to load recommendations.');
                    setLoading(false);
                });
        }
    }, [product]);

    // Handle Buy Now action
    const handleBuyNow = (product) => {
        const productData = {
            ...product,
            quantity: 1, // Set default quantity to 1 for immediate purchase
        };

        const existingProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];

        existingProducts.push(productData);

        localStorage.setItem('selectedProducts', JSON.stringify(existingProducts));

        // Redirect to checkout
        window.location.href = '/checkout';
    };

    // Get current products for pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentRecommendedProducts = recommendedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    // Pagination controls
    const totalPages = Math.ceil(recommendedProducts.length / productsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (!isOpen || !product) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>X</button>
                <div className="modal-body">
                    <img
                        src={product.product_image}
                        alt={product.product_name}
                        style={{ width: '100%' }}
                    />
                    <h3>{product.product_name}</h3>
                    <p>{product.description || 'No description available.'}</p>
                    <p>Price: ${product.price}</p>
                    <p>Available Quantity: {product.quantity}</p>

                    {/* Add to Cart Button */}
                    <button onClick={() => onAddToCart(product)}>Add to Cart</button>

                    {/* Buy Now Button */}
                    <button onClick={() => handleBuyNow(product)} style={{ marginLeft: '10px' }}>
                        Buy Now
                    </button>

                    <button onClick={onClose} style={{ marginLeft: '10px' }}>Close</button>

                    {/* Recommendations Section */}
                    <div className="recommendations">
                        <h4>Recommended Products</h4>
                        {loading ? (
                            <p>Loading recommendations...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : currentRecommendedProducts.length > 0 ? (
                            <div className="recommended-products-grid">
                                {currentRecommendedProducts.map((recProduct) => (
                                    <div key={recProduct.product_id} className="product-card">
                                        <img
                                            src={recProduct.product_image}
                                            alt={recProduct.product_name}
                                            className="product-image"
                                        />
                                        <div className="product-details">
                                            <span className="product-name">{recProduct.product_name}</span>
                                            <span className="product-price">${recProduct.price}</span>

                                            {/* Add to Cart Button for Recommended Product */}
                                            <button
                                                className="add-to-cart-btn"
                                                onClick={() => onAddToCart(recProduct)}
                                            >
                                                Add to Cart
                                            </button>

                                            {/* Buy Now Button for Recommended Product */}
                                            <button
                                                className="buy-now-btn"
                                                onClick={() => handleBuyNow(recProduct)}
                                                style={{ marginLeft: '10px' }}
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No recommendations available.</p>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                {[...Array(totalPages).keys()].map(number => (
                                    <button
                                        key={number + 1}
                                        onClick={() => handlePageChange(number + 1)}
                                        className={number + 1 === currentPage ? 'active' : ''}
                                    >
                                        {number + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// PropTypes for validation
ProductModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    product: PropTypes.shape({
        product_image: PropTypes.string.isRequired,
        product_code: PropTypes.string,
        product_name: PropTypes.string,
        description: PropTypes.string,
        price: PropTypes.number,
        quantity: PropTypes.number
    }),
    onAddToCart: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ProductModal;
