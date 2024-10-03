import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './modal.css';

const ProductModal = ({ isOpen, product, onAddToCart, onClose }) => {
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [bundleProducts, setBundleProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBundleProducts, setSelectedBundleProducts] = useState({});

    // Pagination state for recommendations
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(3); // Set number of products per page

    useEffect(() => {
        if (product) {
            setLoading(true);
            setError(null);

            // Fetch recommendations and bundle products
            Promise.all([
                fetch('http://localhost:5001/products-recommendations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ product_code: product.product_code }),
                }),
                fetch('http://localhost:5001/product-bundles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ product_code: product.product_code }),
                })
            ])
                .then(async ([recommendationRes, bundleRes]) => {
                    if (!recommendationRes.ok || !bundleRes.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const recommendationData = await recommendationRes.json();
                    const bundleData = await bundleRes.json();

                    setRecommendedProducts(recommendationData);
                    setBundleProducts(bundleData);

                    // Select all bundle products when the modal opens
                    const initialSelection = {};
                    bundleData.forEach(bProduct => {
                        initialSelection[bProduct.product_code] = true; // Set all to selected
                    });
                    setSelectedBundleProducts(initialSelection);

                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    setError('Failed to load data.');
                    setLoading(false);
                });
        }
    }, [product]);

    // Calculate price after discount for individual product
    const calculateDiscountedPrice = (price, discount) => {
        if (discount && discount > 0) {
            return price - (price * discount) / 100;
        }
        return price;
    };


    const handleBuyNowBundle = () => {
        // Prepare selected bundle product data (including discounted price)
        const selectedProducts = Object.entries(selectedBundleProducts)
            .filter(([_, value]) => value)
            .map(([key]) => {
                const bProduct = bundleProducts.find(product => product.product_code === key);

                if (!bProduct) {
                    console.log(`Product with code ${key} is not part of the bundle.`);
                    return null;
                }

                return {
                    ...bProduct,
                    quantity: 1,
                    discount: bProduct.discount || 0,
                    original_price: bProduct.price,
                    discounted_price: calculateDiscountedPrice(bProduct.price, bProduct.discount),
                };
            })
            .filter(Boolean);

        // Calculate the total discount from the selected bundle products
        const totalBundleDiscount = selectedProducts.reduce((acc, product) => {
            return acc + (product.discount || 0);
        }, 0);

        // Create the original product entry and apply discount if applicable
        const originalProduct = {
            ...product,
            quantity: 1,
            discount: Math.min(totalBundleDiscount, product.product_discount || 0), // Use the lesser discount
            original_price: product.price,
            discounted_price: calculateDiscountedPrice(product.price, Math.min(totalBundleDiscount, product.product_discount || 0)), // Apply the discount
        };

        // Ensure at least one product is selected
        if (selectedProducts.length === 0 && originalProduct.discount <= 0) {
            alert('Please select at least one product from the bundle.');
            return;
        }

        // Add the original product if it's not already included
        if (!selectedProducts.some(item => item.product_code === originalProduct.product_code)) {
            selectedProducts.push(originalProduct);
        }

        // Handle unbundled products (if any) selected by the user
        const unbundledProducts = JSON.parse(localStorage.getItem('unbundledProducts')) || [];
        unbundledProducts.forEach(product => {
            const unbundledDiscount = product.product_discount || 0;
            const discountedPrice = calculateDiscountedPrice(product.price, unbundledDiscount);

            // Push the unbundled product with discount information
            selectedProducts.push({
                ...product,
                quantity: 1,
                original_price: product.price,
                discount: unbundledDiscount,
                discounted_price: discountedPrice, // Calculate discount for unbundled products
            });

            // Log for debugging/verification (optional)
            console.log(`Unbundled Product: ${product.product_name}`);
            console.log(`  Original Price: $${product.price}`);
            console.log(`  Discount: ${unbundledDiscount}%`);
            console.log(`  Discounted Price: $${discountedPrice}`);
        });

        const existingProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
        existingProducts.push(...selectedProducts);

        // Store selected products in local storage
        localStorage.setItem('selectedProducts', JSON.stringify(existingProducts));

        // Redirect to checkout
        window.location.href = '/checkout';
    };





    // Handle Buy Now action for individual product
    const handleBuyNow = (product) => {
        const discountedPrice = calculateDiscountedPrice(product.price, product.product_discount);
        const productData = {
            ...product,
            quantity: 1,
            discounted_price: discountedPrice
        };

        const existingProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
        existingProducts.push(productData);

        localStorage.setItem('selectedProducts', JSON.stringify(existingProducts));

        // Redirect to checkout
        window.location.href = '/checkout';
    };

    // Get current products for pagination (individual product recommendations)
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentRecommendedProducts = recommendedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    // Pagination controls for recommendations
    const totalPages = Math.ceil(recommendedProducts.length / productsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Handle selection of individual bundle products
    const handleBundleProductSelect = (productCode) => {
        setSelectedBundleProducts(prevState => ({
            ...prevState,
            [productCode]: !prevState[productCode], // Toggle selection
        }));
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
                    <p>
                        Price: P{calculateDiscountedPrice(product.price, product.product_discount)}
                        {product.product_discount && (
                            <span style={{ marginLeft: '10px', color: 'green' }}>
                                (Discount: {product.product_discount}%)
                            </span>
                        )}
                    </p>
                    <p>Available Quantity: {product.quantity}</p>

                    {product.quantity > 0 ? (
                        <>
                            <button onClick={() => onAddToCart(product)}>Add to Cart</button>
                            <button
                                onClick={() => handleBuyNow(product)}
                                style={{ marginLeft: '10px' }}
                            >
                                Buy Now
                            </button>
                        </>
                    ) : (
                        <p style={{ color: 'red' }}>Out of stock</p>
                    )}

                    <button onClick={onClose} style={{ marginLeft: '10px' }}>Close</button>

                    {/* Bundle Section */}
                    {bundleProducts.length > 0 && (
                        <div className="bundle-section">
                            <h4>Available Bundle</h4>
                            <ul>
                                {bundleProducts.map((bProduct) => (
                                    <li key={bProduct.product_code}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedBundleProducts[bProduct.product_code] || false}
                                                onChange={() => handleBundleProductSelect(bProduct.product_code)}
                                            />
                                            {bProduct.product_name} - P{calculateDiscountedPrice(bProduct.price, bProduct.discount)}
                                            <span style={{ marginLeft: '10px', color: 'red' }}>
                                                (Discount: {bProduct.discount}%)
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={handleBuyNowBundle} className="buy-now-btn">
                                Buy Selected Products Now
                            </button>
                        </div>
                    )}

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
                                            <span className="product-price">P{calculateDiscountedPrice(recProduct.price, recProduct.product_discount)}</span>

                                            {recProduct.product_status === 'Discounted' && (
                                                <span className="product-discount">
                                                    Discounted by: {recProduct.product_discount}%
                                                </span>
                                            )}

                                            {recProduct.quantity > 0 ? (
                                                <>
                                                    <button
                                                        className="add-to-cart-btn"
                                                        onClick={() => onAddToCart(recProduct)}
                                                    >
                                                        Add to Cart
                                                    </button>
                                                    <button
                                                        className="buy-now-btn"
                                                        onClick={() => handleBuyNow(recProduct)}
                                                        style={{ marginLeft: '10px' }}
                                                    >
                                                        Buy Now
                                                    </button>
                                                </>
                                            ) : (
                                                <p style={{ color: 'red' }}>Out of stock</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No recommendations available.</p>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        className={currentPage === index + 1 ? 'active' : ''}
                                        onClick={() => handlePageChange(index + 1)}
                                    >
                                        {index + 1}
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

ProductModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    product: PropTypes.object,
    onAddToCart: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ProductModal;
