import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './modal.css';
import ToastNotification from '../../public/components/ToastNotification';

import { useLocation, useNavigate } from 'react-router-dom';


import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";

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

        const discounts = [...new Set(selectedProducts.map(product => product.discount).filter(Boolean))];

        let applicableDiscount = product.product_discount || 0;

        if (discounts.length === 1) {
            applicableDiscount = discounts[0];
        }

        const originalProduct = {
            ...product,
            quantity: 1,
            discount: applicableDiscount,
            original_price: product.price,
            discounted_price: calculateDiscountedPrice(product.price, applicableDiscount),
        };

        if (selectedProducts.length === 0 && originalProduct.discount <= 0) {
            alert('Please select at least one product from the bundle.');
            return;
        }

        if (!selectedProducts.some(item => item.product_code === originalProduct.product_code)) {
            selectedProducts.push(originalProduct);
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
            localStorage.setItem('redirectTo', '/checkout');
            showToast('Redirecting to Login Page...');
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


    // const indexOfLastProduct = currentPage * productsPerPage;
    // const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    // const currentRecommendedProducts = recommendedProducts.slice(indexOfFirstProduct, indexOfLastProduct);


    const handleBundleProductSelect = (productCode) => {
        setSelectedBundleProducts(prevState => ({
            ...prevState,
            [productCode]: !prevState[productCode],
        }));
    };


    const incrementQuantity = () => {
        setQuantity((prevQuantity) => {
            const newQuantity = prevQuantity + 1;
            localStorage.setItem('quantity', newQuantity);
            return newQuantity;
        });
    };

    const decrementQuantity = () => {
        setQuantity((prevQuantity) => {
            const newQuantity = prevQuantity > 1 ? prevQuantity - 1 : 1;
            localStorage.setItem('quantity', newQuantity);
            return newQuantity;
        });
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

                            <h3 className="text-primary" style={{ fontSize: "1.2rem" }}>
                                ₱ {calculateDiscountedPrice(product.price, product.product_discount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                           
                            <p><strong>Stocks</strong></p>
                            <p>{product.quantity}</p>
                        </div>
                    </div>
                    <div class="product-info px-4 mb-4">
                        <p>HAIRCARE • {product.size}</p><br></br>
                        <h3>{product.product_name}</h3>
                        <p><strong>Description: </strong>
                            {product.description || 'No description available.'}
                        </p>

                        <br></br>
                        <div className="quantity">
                            <p><strong>Quantity</strong></p>
                            <div className='quantity-buttons'>
                                <button onClick={decrementQuantity}><FaMinus class="text-dark"/></button>
                                <input
                                    type="text"
                                    value={quantity}
                                    class="text-center "
                                    readOnly
                                    style={{ width: '70px', border: '1px solid gray', outline: 'none', borderRadius: '0' }}
                                />
                                <button onClick={incrementQuantity}><FaPlus class="text-dark"/></button>
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
                                    >
                                        {/* Discount Badge */}
                                        <div className="discount-badge">
                                            <p style={{ fontSize: '1.2rem' }}>{bProduct.discount}%</p>
                                            <p style={{ lineHeight: '0.5' }}>OFF</p>
                                        </div>

                                        <img
                                            src={bProduct.product_image}
                                            alt={bProduct.product_name}
                                            className="modalproduct-image-bundle"
                                        />
                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <label className="product-name">{bProduct.product_name}</label>
                                            <p className="product-price">₱{calculateDiscountedPrice(bProduct.price, bProduct.discount)}</p>
                                            <p className="product-original-price">₱{bProduct.price}</p>
                                        </div>

                                        <input
                                            type="checkbox"
                                            checked={selectedBundleProducts[bProduct.product_code] || false}
                                            onChange={() => handleBundleProductSelect(bProduct.product_code)}
                                            style={{ display: 'none' }}
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
                        ) : recommendedProducts.length > 0 ? (
                            <div className="recommended-modalproducts-grid">
                                {recommendedProducts
                                    .filter((recProduct) => recProduct.quantity > 0)
                                    .map((recProduct) => (
                                        <div key={recProduct.product_id} className="modalproduct-card">
                                            <img
                                                src={recProduct.product_image}
                                                alt={recProduct.product_name}
                                                className="modalproduct-image"
                                            />
                                            <div className="modalproduct-details">
                                                <span className="modalproduct-name">{recProduct.product_name}</span>
                                                <h3 className="modalproduct-price text-primary" style={{ fontSize: "1.2rem" }}>
                                                    ₱ {calculateDiscountedPrice(recProduct.price, recProduct.product_discount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </h3>
                                               

                                                {recProduct.product_status === 'Discounted' && (
                                                    <span className="modalproduct-discount">
                                                        Discounted by: {recProduct.product_discount}%
                                                    </span>
                                                )}

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
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p>No recommendations available.</p>
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
