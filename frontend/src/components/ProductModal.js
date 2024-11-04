import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './modal.css';
import ToastNotification from './ToastNotification';

import { useLocation, useNavigate } from 'react-router-dom';

const ProductModal = ({ isOpen, product, onAddToCart, onClose }) => {
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [bundleProducts, setBundleProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBundleProducts, setSelectedBundleProducts] = useState({});
    const [toastMessage, setToastMessage] = useState('');

    const [quantity, setQuantity] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(3);

    const navigate = useNavigate();

    useEffect(() => {
        if (product) {
            setLoading(true);
            setError(null);

            const fetchRecommendations = fetch('http://localhost:5001/products-recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_code: product.product_code }),
            });

            const fetchBundles = fetch('http://localhost:5001/product-bundles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_code: product.product_code }),
            });

            Promise.allSettled([fetchRecommendations, fetchBundles])
                .then(async ([recommendationRes, bundleRes]) => {
                    if (recommendationRes.status === 'fulfilled' && recommendationRes.value.ok) {
                        const recommendationData = await recommendationRes.value.json();
                        setRecommendedProducts(recommendationData);
                    } else {
                        console.error('Error fetching recommendations:', recommendationRes.reason);
                        setError('Failed to load recommendations.');
                    }

                    if (bundleRes.status === 'fulfilled' && bundleRes.value.ok) {
                        const bundleData = await bundleRes.value.json();
                        setBundleProducts(bundleData);

                        const initialSelection = {};
                        bundleData.forEach(bProduct => {
                            initialSelection[bProduct.product_code] = true;
                        });
                        setSelectedBundleProducts(initialSelection);
                    } else {
                        console.error('Error fetching bundles:', bundleRes.reason);
                    }

                    setLoading(false);
                })
                .catch(error => {
                    console.error('Unexpected error:', error);
                    setError('Failed to load data.');
                    setLoading(false);
                });
        }
    }, [product]);

    const calculateDiscountedPrice = (price, discount) => {
        if (discount && discount > 0) {
            return price - (price * discount) / 100;
        }
        return price;
    };

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage('');
        }, 3000);
    };

    const handleBuyNowBundle = () => {
        const token = localStorage.getItem('token');

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

        const totalBundleDiscount = selectedProducts.reduce((acc, product) => {
            return acc + (product.discount || 0);
        }, 0);


        if (selectedProducts.length === 0) {
            alert('Please select at least one product from the bundle.');
            return;
        }


        const unbundledProducts = JSON.parse(localStorage.getItem('unbundledProducts')) || [];
        unbundledProducts.forEach(product => {
            const unbundledDiscount = product.product_discount || 0;
            const discountedPrice = calculateDiscountedPrice(product.price, unbundledDiscount);

            selectedProducts.push({
                ...product,
                quantity: 1,
                original_price: product.price,
                discount: unbundledDiscount,
                discounted_price: discountedPrice,
            });

            console.log(`Unbundled Product: ${product.product_name}`);
            console.log(`  Original Price: $${product.price}`);
            console.log(`  Discount: ${unbundledDiscount}%`);
            console.log(`  Discounted Price: $${discountedPrice}`);
        });

        const existingProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
        existingProducts.push(...selectedProducts);

        localStorage.setItem('selectedProducts', JSON.stringify(existingProducts));

        if (token) {
            showToast('Redirecting to Checkout Page...');
            window.location.href = '/checkout';
        } else {
            // Set the redirect to checkout after login
            localStorage.setItem('redirectTo', '/checkout');
            showToast('Redirecting to Login Page...');
            // Redirect to login page
            navigate('/login');
        }
    };

    const handleBuyNow = (product) => {
        const token = localStorage.getItem('token');
        const productData = {
            ...product,
            quantity,
        };

        if (!token) {
            const existingProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
            existingProducts.push(productData);
            localStorage.setItem('selectedProducts', JSON.stringify(existingProducts));

            // Set the redirect to checkout after login
            localStorage.setItem('redirectTo', '/checkout');

            // Redirect to login page
            navigate('/login');
        } else {
            // User is logged in, proceed to save the selected product for checkout
            const existingProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
            existingProducts.push(productData);
            localStorage.setItem('selectedProducts', JSON.stringify(existingProducts));

            showToast('Redirecting to Checkout Page...');
            window.location.href = '/checkout';
        }
    };


    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentRecommendedProducts = recommendedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const totalPages = Math.ceil(recommendedProducts.length / productsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleBundleProductSelect = (productCode) => {
        setSelectedBundleProducts(prevState => ({
            ...prevState,
            [productCode]: !prevState[productCode],
        }));
    };

    // Function to increase quantity
    const incrementQuantity = () => {
        setQuantity((prevQuantity) => prevQuantity + 1);
    };

    // Function to decrease quantity
    const decrementQuantity = () => {
        setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
    };

    if (!isOpen || !product) return null;
    return (

        <div className="promodal-overlay" onClick={onClose}>
            <div className="promodal-content" onClick={(e) => e.stopPropagation()}>
                <div className="promodal-body">
                    <ToastNotification toastMessage={toastMessage} />
                    <div class="product-image">
                        <img
                            src={product.product_image}
                            alt="" height="400" width="300" />
                        <div class="price-stock">
                            <p><strong>Price</strong></p>
                            <p className='price-value'>
                                ₱{calculateDiscountedPrice(product.price, product.product_discount)}
                                {product.product_discount && (
                                    <span style={{ marginLeft: '10px', color: 'green' }}>
                                        (Discount: {product.product_discount}%)
                                    </span>
                                )}
                            </p>
                            <p><strong>Stocks</strong></p>
                            <p>{product.quantity}</p>
                        </div>
                    </div>
                    <div class="product-info">
                        {/* <p>HAIRCARE • Shampoo</p> */}<br></br>
                        <h3>{product.product_name}</h3>
                        <p><strong>Description: </strong>
                            {product.description || 'No description available.'}
                        </p>
                        {/* <p><strong>Hair Type:</strong>
                            Suitable for virgin and colored hair.
                        </p>
                        <p><strong>Hair Texture:</strong>
                            Works for straight, wavy, or curly hair.
                        </p>
                        <p><strong>Effect/Target Problems:</strong>
                            Treats dandruff, reduces scalp irritation, and soothes sensitive scalps.
                        </p> */}
                        <br></br>
                        <div className="quantity">
                            <p><strong>Quantity</strong></p>
                            <div className='quantity-buttons'>
                                <button onClick={decrementQuantity}>-</button>
                                <input
                                    type="text"
                                    value={quantity}
                                    readOnly
                                    style={{ width: '70px', border: '1px solid gray', outline: 'none', borderRadius: '0' }}
                                />
                                <button onClick={incrementQuantity}>+</button>
                            </div>
                        </div>
                        <div class="buttons">
                            {product.quantity > 0 ? (
                                <>
                                    <button onClick={() => onAddToCart(product)}><i class="bx bx-cart"></i>Add to Cart</button>
                                    <button
                                        onClick={() => handleBuyNow(product, quantity)}
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



                    <button onClick={onClose} className='promodal-close-btn'>Close</button>


                    {/* Bundle Section */}
                    {bundleProducts.length > 0 && (

                        <div className="bundle-section">
                            <h4>Available Bundle</h4>
                            <p>Save money, avail discounted items</p>
                            <div>

                                {bundleProducts.map((bProduct) => (
                                    <div
                                        key={bProduct.product_code}
                                        className={`bundle-card ${selectedBundleProducts[bProduct.product_code] ? 'selected' : ''}`}
                                        onClick={() => handleBundleProductSelect(bProduct.product_code)}
                                        style={{
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            margin: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: selectedBundleProducts[bProduct.product_code] ? '#f0f8ff' : 'white'
                                        }}
                                    >
                                        <img
                                            src={bProduct.product_image}
                                            alt={bProduct.product_name}
                                            className="modalproduct-image-bundle"
                                            style={{ width: '50px', height: '50px', marginRight: '10px', borderRadius: '4px' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontWeight: 'bold' }}>
                                                {bProduct.product_name} - P{calculateDiscountedPrice(bProduct.price, bProduct.discount)}
                                            </label>
                                            <span style={{ marginLeft: '10px', color: 'red', fontSize: '0.85em' }}>
                                                (Discount: {bProduct.discount}%)
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedBundleProducts[bProduct.product_code] || false}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleBundleProductSelect(bProduct.product_code);
                                            }}
                                            style={{ marginLeft: 'auto' }}
                                        />
                                    </div>
                                ))}

                            </div>
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
                            <div className="recommended-modalproducts-grid">
                                {currentRecommendedProducts.map((recProduct) => (
                                    <div key={recProduct.product_id} className="modalproduct-card">
                                        <img
                                            src={recProduct.product_image}
                                            alt={recProduct.product_name}
                                            className="modalproduct-image"
                                        />
                                        <div className="modalproduct-details">
                                            <span className="modalproduct-name">{recProduct.product_name}</span>
                                            <span className="modalproduct-price">P{calculateDiscountedPrice(recProduct.price, recProduct.product_discount)}</span>

                                            {recProduct.product_status === 'Discounted' && (
                                                <span className="modalproduct-discount">
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
