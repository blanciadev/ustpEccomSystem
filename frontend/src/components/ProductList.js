import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import ProductModal from './ProductModal';
import StickyComponent from './StickyComponent';
import { cartEventEmitter } from './eventEmitter';
import './modal.css';
import './productList.css'; // Import the new CSS file
import { useNavigate } from 'react-router-dom'; 
import { v4 as uuidv4 } from 'uuid';
import ToastNotification from './ToastNotification'; 


const PAGE_SIZE = 4;

const ProductCard = React.memo(({ product, onAddToCart, onBuyNow, onProductClick }) => {
    if (!product) return <div>Product data is not available</div>;

    const isOutOfStock = product.quantity === 0;

    return (
        <div className="product-card" onClick={() => onProductClick(product)}>
            <img src={product.product_image} alt={product.product_name} />
            <h3>{product.product_name}</h3>
            <p>{product.description || 'No description available.'}</p>
            <p>Product Quantity: {product.quantity}</p>
            <h3>P{product.price}</h3>
            {product.product_status === 'Discounted' && (
                <h3>Discounted Price: {product.product_discount}%</h3>
            )}
            {isOutOfStock ? (
                <p style={{ color: 'red' }}>Out of Stock</p>
            ) : (
                <>
                    <button onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>Add to Cart</button>
                    <button onClick={(e) => { e.stopPropagation(); onBuyNow(product); }}>Buy Now</button>
                </>
            )}
        </div>
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
        try {
            const response = await axios.get(`http://localhost:5001/sticky-components`, {
                params: formData
            });
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

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
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

  
// Function to generate a unique code for cart_items_id
function generateCartItemId() {
    return 'CART-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

    // Handle "Add to Cart" button click
    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('token');
        const customerId = localStorage.getItem('customer_id');

        console.log('Product:', product); // Log product details
        console.log('Token:', token); // Log token
        console.log('Customer ID:', customerId); // Log customer ID

        if (!token || !customerId) {
            // User is not logged in; use localStorage for cart
            console.log('User not logged in, using localStorage for cart'); // Log when user is not logged in
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            console.log('Current cart from localStorage:', cart); // Log current cart from localStorage

            // Check if the product already exists in the cart
            const existingProductIndex = cart.findIndex(item => item.product_code === product.product_code);
            console.log('Existing product index:', existingProductIndex); // Log product index if found

            if (existingProductIndex !== -1) {
                // Increase quantity for existing product
                cart[existingProductIndex].quantity += 1;
                cart[existingProductIndex].sub_total = cart[existingProductIndex].price * cart[existingProductIndex].quantity; // Update sub_total
                console.log('Increased quantity for existing product:', cart[existingProductIndex]); // Log updated product with increased quantity
            } else {
                // Add new product to the cart
                const newCartItem = { 
                    cart_items_id: generateCartItemId(), // Generate a unique ID for local storage cart items
                    product_code: product.product_code, 
                    quantity: 1, 
                    product_name: product.product_name, 
                    price: product.price,
                    sub_total: product.price // Initial sub_total is price
                };
                cart.push(newCartItem);
                console.log('Added new product to cart:', newCartItem); // Log the newly added product

                
            }

            // Save updated cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            console.log('Updated cart saved to localStorage:', cart); // Log the updated cart

            // Emit cart update event to refresh the cart count
            cartEventEmitter.emit('cartUpdated');
            console.log('Emitted cartUpdated event'); // Log event emission

            setToastMessage('Added to Cart!');

            setTimeout(() => {
                setToastMessage('');
            }, 3000);
            return;
        }

        // If the user is logged in, add the item to the server-side cart
        try {
            console.log('User is logged in, adding item to server-side cart'); // Log when user is logged in
            const response = await axios.post('http://localhost:5001/add-to-cart', {
                customer_id: customerId,
                product_code: product.product_code,
                quantity: 1
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Response from server:', response.data); // Log server response

            // Emit cart update event to refresh the cart count
            cartEventEmitter.emit('cartUpdated');
            console.log('Emitted cartUpdated event after server response'); // Log event emission
            setToastMessage('Added to Cart!');
            setTimeout(() => {
                setToastMessage('');
            }, 3000);
            return;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('Unauthorized, redirecting to login'); // Log unauthorized error
                navigate('/login'); // Redirect to login page if unauthorized
            } else {
                console.error('Error adding product to cart:', error.response ? error.response.data : error.message); // Log the error details
            }
        }
    };


    const handleBuyNow = (product) => {
        const productData = {
            ...product,
            quantity: 1,
        };

        const existingProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
        existingProducts.push(productData);
        localStorage.setItem('selectedProducts', JSON.stringify(existingProducts));
        setToastMessage('Redirecting to Checkout Page');

        window.location.href = '/checkout';
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const paginatedProducts = products.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    return (
        <div className='product-list'>
            <ToastNotification toastMessage={toastMessage} />
            <StickyComponent onSubmit={handleStickySubmit} />
            <h2>Top Products</h2>
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
                <button onClick={() => handlePageChange(-1)} disabled={currentPage === 0}>
                    Previous
                </button>
                <button onClick={() => handlePageChange(1)} disabled={currentPage >= Math.ceil(products.length / PAGE_SIZE) - 1}>
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
    );
};

ProductList.propTypes = {
    // stickyComponents: PropTypes.array.isRequired,
};

export default ProductList;
