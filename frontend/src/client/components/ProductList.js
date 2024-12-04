import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import ProductModal from './ProductModal';
import StickyComponent from './StickyComponent';
import { cartEventEmitter } from './eventEmitter';

import './productList.css';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ToastNotification from '../../public/components/ToastNotification';


const PAGE_SIZE = 8;




const ProductCard = React.memo(({ product, onAddToCart, onBuyNow, onProductClick }) => {


    const [isAddToCartHovered, setIsAddToCartHovered] = useState(false);
    const [isBuyNowHovered, setIsBuyNowHovered] = useState(false);


    if (!product) return <div>Product data is not available</div>;

    const isOutOfStock = product.quantity === 0;

    return (
        <>
            {product.quantity > 0 && (
                <div className="product-card" onClick={() => onProductClick(product)}>
                    <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="img-fluid"
                        style={{ height: "150px", width: "150px", objectFit: "fit", borderBottom: "2px solid #ff728a" }}
                    />
                    <p className="text-muted mb-1 mt-2">Haircare • {product.size}</p>
                    <h3 className="product-name m-0 p-0 align-items-center mb-4" style={{ fontSize: "14px", height: "60px" }}>
                        {product.product_name}
                        <br /><strong className="" style={{ fontSize: "1rem", color: "#d81c4b" }}>₱ {product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </h3>

                    {product.product_status === 'Discounted' && (
                        <h3>Discounted Price: {product.product_discount}%</h3>
                    )}


                    <button
                        className="add-to-cart-button px-10"
                        style={{
                            backgroundColor: isAddToCartHovered ? 'rgb(223, 95, 116)' : '#d81c4b',
                            color: 'white', // Ensures text is readable on both background colors
                        }}
                        onMouseEnter={() => setIsAddToCartHovered(true)}
                        onMouseLeave={() => setIsAddToCartHovered(false)}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                        }}
                    >
                        Add to cart
                    </button>
                    <button
                        className="buy-now-button px-10"
                        style={{
                            backgroundColor: isBuyNowHovered ? 'rgb(223, 95, 116)' : '#d81c4b',
                            color: 'white', // Ensures text is readable on both background colors
                        }}
                        onMouseEnter={() => setIsBuyNowHovered(true)}
                        onMouseLeave={() => setIsBuyNowHovered(false)}
                        onClick={(e) => {
                            e.stopPropagation();
                            onBuyNow(product);
                        }}
                    >
                        Buy Now
                    </button>
                </div>
            )}
        </>
    );

});

// ProductList Component
const ProductList = ({ stickyComponents }) => {
    const navigate = useNavigate()

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [topPicks, setTopPicks] = useState([]);
    const [showRecommendedHeading, setShowRecommendedHeading] = useState(false); //recommended product heading
    const [showHaircareHeading, setShowHaircareHeading] = useState(false); //haircare beauty offers heading
    const [isPreviousHovered, setIsPreviousHovered] = useState(false);
    const [isNextHovered, setIsNextHovered] = useState(false);

    const handleStickySubmit = async (formData) => {
        setLoading(true);

        console.log("Tis is on stickysubmit", formData);

        const storedSearchTerm = localStorage.getItem('searchTerm');

        if (storedSearchTerm) {
            formData = {
                ...formData,
                query: storedSearchTerm
            };
        }

        try {
            const response = await axios.get(`https://ustp-eccom-server.vercel.app/api/sticky-components`, {
                params: formData
            });
            console.log('Form data being sent:', formData);
            setProducts(response.data);
            setError(null);
            setShowHaircareHeading(false); // Show the heading
            setShowRecommendedHeading(true); // Show the heading

            setCurrentPage(0);

            // Remove the search term from localStorage
            localStorage.removeItem('searchTerm');


        } catch (err) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleButtonClick = (parameter, value) => {
        const formData = {
            [parameter]: value
        };

        handleStickySubmit(formData); // Pass the formData with the correct parameter and value
        console.log('Button clicked with value:', value);
    };

    const handlePageChange = (direction) => {
        setCurrentPage((prevPage) => {
            const newPage = prevPage + direction;
            const maxPage = Math.ceil(products.length / PAGE_SIZE) - 1;
            return Math.max(0, Math.min(newPage, maxPage));
        });
    };


    const handleProductClick = async (product) => {
        // Set the selected product and open the modal
        setSelectedProduct(product);
        setIsModalOpen(true);
        const customerId = localStorage.getItem('customer_id');

        const payload = {
            product_code: product.product_code,
            customerId: customerId,
            interaction_type: 'view'
        };
        console.log("payload", payload);

        try {
            const response = await axios.get('https://ustp-eccom-server.vercel.app/api/products-interaction', { params: payload });

            console.log('API response:', response.data);
        } catch (error) {
            console.error('Error recording product interaction:', error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    useEffect(() => {

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`https://ustp-eccom-server.vercel.app/api/products`);
                setProducts(response.data);
                setError(null);
                setShowHaircareHeading(true); // Show the heading
            } catch (err) {
                setError('Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        const fetchTopPicks = async () => {
            try {
                const response = await axios.get('https://ustp-eccom-server.vercel.app/api/products-top-picks');
                // Limit to top 4 picks if there are more
                const limitedPicks = response.data.slice(0, 5);
                setTopPicks(limitedPicks);
            } catch (error) {
                console.error('Error fetching top picks:', error);
            }
        };

        fetchTopPicks();


        fetchProducts();
    }, []);


    function generateCartItemId() {
        return 'CART-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('token');
        const customerId = localStorage.getItem('customer_id');
        let quantity = parseInt(localStorage.getItem('quantity'), 10) || 0;

        if (quantity === 0) {
            quantity = 1;
            localStorage.setItem('quantity', quantity);
        }

        console.log('Product:', product);
        console.log('Token:', token);
        console.log('Customer ID:', customerId);

        const payload = {
            product_code: product.product_code,
            customerId: customerId,
            interaction_type: 'cart'
        };

        const recordProductInteraction = async () => {
            try {
                console.log('Recording product interaction:', payload);
                const response = await axios.get('https://ustp-eccom-server.vercel.app/api/products-interaction', { params: payload });
                console.log('Product interaction response:', response.data);
            } catch (error) {
                console.error('Error recording product interaction:', error);
            }
        };

        const recordedInteractions = new Set();

        let interactionRecorded = false;

        if (!token || !customerId) {
            console.log('User not logged in, using localStorage for cart');
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            console.log('Current cart from localStorage:', cart);

            const existingProductIndex = cart.findIndex(item => item.product_code === product.product_code);
            console.log('Existing product index:', existingProductIndex);

            if (existingProductIndex !== -1) {
                cart[existingProductIndex].quantity += 1;
                cart[existingProductIndex].sub_total = cart[existingProductIndex].price * cart[existingProductIndex].quantity;
                console.log('Increased quantity for existing product:', cart[existingProductIndex]);
            } else {
                const newCartItem = {
                    cart_items_id: generateCartItemId(),
                    product_code: product.product_code,
                    quantity,
                    product_name: product.product_name,
                    price: product.price,
                    sub_total: product.price
                };
                cart.push(newCartItem);
                console.log('Added new product to cart:', newCartItem);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            console.log('Updated cart saved to localStorage:', cart);

            cartEventEmitter.emit('cartUpdated');
            console.log('Emitted cartUpdated event');

            setToastMessage('Added to Cart!');
            setTimeout(() => {
                setToastMessage('');
            }, 3000);

            if (!interactionRecorded && !recordedInteractions.has(product.product_code)) {
                await recordProductInteraction();
                recordedInteractions.add(product.product_code);
                interactionRecorded = true;
            }

            return;
        }

        try {
            console.log('User is logged in, adding item to server-side cart');
            const response = await axios.post('https://ustp-eccom-server.vercel.app/api/add-to-cart', {
                customer_id: customerId,
                product_code: product.product_code,
                quantity,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Response from server:', response.data);

            cartEventEmitter.emit('cartUpdated');
            console.log('Emitted cartUpdated event after server response');

            setToastMessage('Added to Cart!');
            setTimeout(() => {
                setToastMessage('');
            }, 3000);

            // Check if the interaction has already been recorded
            if (!interactionRecorded && !recordedInteractions.has(product.product_code)) {
                await recordProductInteraction();
                recordedInteractions.add(product.product_code);
                interactionRecorded = true;
            }

        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('Unauthorized, redirecting to login');
                navigate('/login');
            } else {
                console.error('Error adding product to cart:', error.response ? error.response.data : error.message); // Log the error details
            }
        }
    };





    const handleBuyNow = (product) => {
        const token = localStorage.getItem('token');
        const productData = {
            ...product,
            quantity: 1,
        };

        const existingProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
        existingProducts.push(productData);
        localStorage.setItem('selectedProducts', JSON.stringify(existingProducts));
        setToastMessage('Redirecting to Checkout Page');

        // window.location.href = '/checkout';
        console.log("Trigger Product List");

        if (token) {
            window.location.href = '/checkout';
        } else {
            localStorage.setItem('redirectTo', '/checkout');
            // Redirect to login page
            navigate('/login');
        }

    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const paginatedProducts = products.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);


    return (
        <div class="mx-2">
            <div>
                {/* <h2 class="text-center mt-4 ">HAIRCARE BEAUTY OFFERS</h2> */}
                {/* Buttons */}
                <div className="container mb-2">
                    <div className="row justify-content-center">
                        <div className="col">
                            <button
                                className="gradient-button btn-rebonded w-100"
                                onClick={() => handleButtonClick('hairRebonded', 'Rebonded')}
                            >
                                Rebonded
                            </button>
                        </div>

                        <div className="col">
                            <button
                                className="gradient-button btn-damaged w-100"
                                onClick={() => handleButtonClick('hairVirgin', 'Damaged')}
                            >
                                Damaged Hair
                            </button>
                        </div>

                        <div className="col">
                            <button
                                className="gradient-button btn-frizzy w-100"
                                onClick={() => handleButtonClick('hairTexture', 'Frizzy')}
                            >
                                Frizzy Hair
                            </button>
                        </div>

                        <div className="col">
                            <button
                                className="gradient-button btn-oily w-100"
                                onClick={() => handleButtonClick('hairTexture', 'Oily')}
                            >
                                Oily Hair
                            </button>
                        </div>

                        <div className="col">
                            <button
                                className="gradient-button btn-dry w-100"
                                onClick={() => handleButtonClick('hairTexture', 'Dry')}
                            >
                                Dry Hair
                            </button>
                        </div>

                        <div className="col">
                            <button
                                className="gradient-button btn-curly w-100"
                                onClick={() => handleButtonClick('hairType', 'Curly')}
                            >
                                Curly Hair
                            </button>
                        </div>
                    </div>
                </div>


                <div class="mx-2 ">

                    <div class="row">

                        <div class="left-product-list col-12 col-lg-9 text-white p-3">
                            <div>
                                {showRecommendedHeading && <h2 className="text-center text-danger mt-2 mb-2 fw-bold">RECOMMENDED PRODUCTS</h2>}
                                {showHaircareHeading && <h2 className="text-center text-danger mt-2 mb-2 fw-bold">HAIRCARE BEAUTY OFFERS</h2>}
                            </div>

                            <div className='product-list'>
                                <ToastNotification toastMessage={toastMessage} />
                                <StickyComponent className="" onSubmit={handleStickySubmit} />

                                <div className='product-list-container'>
                                    {/* {paginatedProducts.map((product) => (
                                        <ProductCard
                                            key={product.product_code}
                                            product={product}

                                            onAddToCart={handleAddToCart}
                                            onProductClick={handleProductClick}
                                            onBuyNow={handleBuyNow}

                                        />
                                    ))} */}
                                </div>


                                {/* <div className='pagination'>
                                    <button className='btns' onClick={() => handlePageChange(-1)} disabled={currentPage === 0}>
                                        Previous
                                    </button>
                                    <button className='btns' onClick={() => handlePageChange(1)} disabled={currentPage >= Math.ceil(products.length / PAGE_SIZE) - 1}>
                                        Next
                                    </button>
                                </div> */}

                                <div className="pagination">
                                    <button
                                        className="btns"
                                        style={{
                                            backgroundColor: isPreviousHovered ? '#d81c4b' : 'pink',
                                            color: isPreviousHovered ? 'white' : 'black', // Ensures text is readable on both colors
                                        }}
                                        onMouseEnter={() => setIsPreviousHovered(true)}
                                        onMouseLeave={() => setIsPreviousHovered(false)}
                                        onClick={() => handlePageChange(-1)}
                                        disabled={currentPage === 0}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        className="btns"
                                        style={{
                                            backgroundColor: isNextHovered ? '#d81c4b' : 'pink',
                                            color: isNextHovered ? 'white' : 'black', // Ensures text is readable on both colors
                                        }}
                                        onMouseEnter={() => setIsNextHovered(true)}
                                        onMouseLeave={() => setIsNextHovered(false)}
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage >= Math.ceil(products.length / PAGE_SIZE) - 1}
                                    >
                                        Next
                                    </button>
                                </div>

                            </div>

                        </div>


                        <div class="right-product-list col-12 col-lg-3 text-white">


                            <h3 class="mt-4 text-center fw-bold">TOP PICKS FOR YOU</h3>

                            <div class="container ">
                                <div class="row">


                                    <div className="right-product-list col-12  text-white">

                                        <div className="container">
                                            <div className="row">
                                                {topPicks.map((product, index) => (
                                                    <div className="col-12 mt-2">
                                                        <div
                                                            key={product.product_code}
                                                            product={product}
                                                            className="product-card1"
                                                            onProductClick={handleProductClick}
                                                        >


                                                            <img
                                                                src={product.product_image || 'https://via.placeholder.com/120'}
                                                                alt={product.product_name}
                                                                className="product-image1"
                                                                onClick={() => handleProductClick(product)} // Trigger the handler correctly
                                                            />
                                                            <div className="product-text1">
                                                                <h6>{product.product_name}</h6>
                                                                <p className="price">₱{product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>


                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                        {isModalOpen && (
                            <ProductModal
                                isOpen={isModalOpen}
                                product={selectedProduct}
                                onClose={closeModal}
                                onAddToCart={handleAddToCart}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

ProductList.propTypes = {

};

export default ProductList;
