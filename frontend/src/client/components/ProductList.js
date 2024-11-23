import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import ProductModal from './ProductModal';
import StickyComponent from './StickyComponent';
import { cartEventEmitter } from './eventEmitter';
// import './modal.css';
import './productList.css';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ToastNotification from '../../public/components/ToastNotification';


const PAGE_SIZE = 8;

const ProductCard = React.memo(({ product, onAddToCart, onBuyNow, onProductClick }) => {
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
                        <br /><strong className="text-primary" style={{ fontSize: "1rem" }}>₱ {product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </h3>
                    {/* <p>{product.description || 'No description available.'}</p> */}
                    {/* <p>Product Quantity: {product.quantity}</p> */}
                    {/* <h3 className="text-primary" style={{ fontSize: "1.2rem" }}>
                        ₱ {product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3> */}
                    {product.product_status === 'Discounted' && (
                        <h3>Discounted Price: {product.product_discount}%</h3>
                    )}

                    <button onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>Add to Cart</button>
                    <button onClick={(e) => { e.stopPropagation(); onBuyNow(product); }}>Buy Now</button>
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

    const handleStickySubmit = async (formData) => {
        setLoading(true);

        const storedSearchTerm = localStorage.getItem('searchTerm');

        if (storedSearchTerm) {
            formData = {
                ...formData,
                query: storedSearchTerm
            };
        }

        try {
            const response = await axios.get(`http://localhost:5001/sticky-components`, {
                params: formData
            });
            console.log('Form data being sent:', formData);
            setProducts(response.data);
            setError(null);
            setCurrentPage(0);
        } catch (err) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
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
            const response = await axios.get('http://localhost:5001/products-interaction', { params: payload });

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
                const response = await axios.get(`http://localhost:5001/products`);
                setProducts(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

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
                const response = await axios.get('http://localhost:5001/products-interaction', { params: payload });
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
            const response = await axios.post('http://localhost:5001/add-to-cart', {
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
        <div >
            <div className='d-flex justify-content-center'>
                <div className='product-list'>
                    <ToastNotification toastMessage={toastMessage} />
                    <StickyComponent className="" onSubmit={handleStickySubmit} />


                    <h2 class="text-center mt-4">HAIRCARE BEAUTY OFFERS</h2>
                    <div className='product-list-container'>
                        {paginatedProducts.map((product) => (
                            <ProductCard
                                key={product.product_code}
                                product={product}
                                onAddToCart={handleAddToCart}
                                onProductClick={handleProductClick}
                                onBuyNow={handleBuyNow}
                            />
                        ))}
                    </div>

                    <div className='pagination'>
                        <button className='btns' onClick={() => handlePageChange(-1)} disabled={currentPage === 0}>
                            Previous
                        </button>
                        <button className='btns' onClick={() => handlePageChange(1)} disabled={currentPage >= Math.ceil(products.length / PAGE_SIZE) - 1}>
                            Next
                        </button>
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
    );
};

ProductList.propTypes = {

};

export default ProductList;
