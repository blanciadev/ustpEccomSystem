import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './modal.css';

// Modal Component
const ProductModal = ({ isOpen, product, onClose }) => {
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (product) {
            setLoading(true);
            setError(null);

            // Send POST request to fetch recommended products based on the selected product's category
            fetch('http://localhost:5000/products/recommendations', {
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

    if (!isOpen || !product) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>X</button>
                <div className="modal-body">
                    <img
                        src={product.image_url || 'https://via.placeholder.com/150'}
                        alt={product.product_name}
                        style={{ width: '100%' }}
                    />
                    <h3>{product.product_name}</h3>
                    <p>{product.description || 'No description available.'}</p>
                    <p>Price: ${product.price}</p>
                    <p>Available Quantity: {product.quantity}</p>

                    <button onClick={onClose}>Close</button>

                    {/* Recommendations Section */}
                    <div className="recommendations">
                        <h4>Recommended Products</h4>
                        {loading ? (
                            <p>Loading recommendations...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : recommendedProducts.length > 0 ? (
                            <ul>
                                {recommendedProducts.map((recProduct) => (
                                    <li key={recProduct.product_id}>
                                        <img
                                            src={recProduct.image_url || 'https://via.placeholder.com/150'}
                                            alt={recProduct.product_name}
                                            style={{ width: '50px', marginRight: '10px' }}
                                        />
                                        <span>{recProduct.product_name}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No recommendations available.</p>
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
        product_code: PropTypes.string.isRequired,
        image_url: PropTypes.string,
        product_name: PropTypes.string,
        description: PropTypes.string,
        price: PropTypes.number,
        quantity: PropTypes.number
    }),
    onClose: PropTypes.func.isRequired
};

export default ProductModal;
