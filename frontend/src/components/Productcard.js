import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { cartEventEmitter } from './eventEmitter';
import ProductModal from './ProductModal';  // Import the modal
import './modal.css';

const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
};

const PAGE_SIZE = 4;

// ProductCard Component
const ProductCard = React.memo(({ product, onAddToCart, onProductInteraction, onProductClick }) => {
    if (!product) {
        return <div>Product data is not available</div>;
    }

    return (
        <div className="product-card" onClick={() => onProductClick(product)}>
            <img src={product.product_image} alt={product.product_name} />
            <h3>{product.product_name}</h3>
            <p>{product.product_code}</p>
            {/* Add stopPropagation in the button click handler */}
            <button onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>
                Add to Cart
            </button>
        </div>
    );
});

ProductCard.propTypes = {
    product: PropTypes.shape({
        product_image: PropTypes.string,
        product_name: PropTypes.string,
        product_code: PropTypes.string.isRequired,
        quantity: PropTypes.number
    }).isRequired,
    onAddToCart: PropTypes.func.isRequired,
    onProductInteraction: PropTypes.func.isRequired,
    onProductClick: PropTypes.func.isRequired
};

// ProductList Component
const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customerId, setCustomerId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null); // Modal product state
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

    useEffect(() => {
        const storedCustomerId = localStorage.getItem('customer_id');
        if (storedCustomerId) {
            setCustomerId(storedCustomerId);
            fetchRecommendations(storedCustomerId); // Fetch recommendations based on customer ID
        }

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/products-top-mix-picks');
                const shuffledProducts = shuffleArray(response.data);
                setProducts(shuffledProducts);
            } catch (error) {
                setError('Error fetching products: ' + (error.response ? error.response.data : error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Fetch recommended products for a given customer
    const fetchRecommendations = async (customerId) => {
        try {
            const response = await axios.get(`http://localhost:5000/recommend-products`);
            const recShuffledProducts = shuffleArray(response.data);
            setRecommendedProducts(recShuffledProducts);
        } catch (error) {
            setError('Error fetching recommendations: ' + (error.response ? error.response.data : error.message));
        }
    };

    // Debounce for add to cart
    const handleAddToCart = (() => {
        let timeout;
        return async (product) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const token = localStorage.getItem('token');
                if (!token || !customerId) {
                    console.log('User not logged in or customer ID missing');
                    return;
                }

                try {
                    const response = await axios.post('http://localhost:5000/add-to-cart', {
                        customer_id: customerId,
                        product_code: product.product_code,
                        quantity: 1
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.status === 200) {
                        cartEventEmitter.emit('cartUpdated');
                        await handleProductInteraction(product.product_code, 'cart');
                    }
                } catch (error) {
                    console.error('Error adding product to cart:', error.response ? error.response.data : error.message);
                }
            }, 300); // Debounce delay
        };
    })();

    const handleProductInteraction = async (productCode, interactionType) => {
        const customerId = localStorage.getItem('customer_id');
        if (!customerId) {
            console.log('Customer ID is not available');
            return;
        }

        try {
            await axios.get('http://localhost:5000/products-interaction', {
                params: {
                    product_code: productCode,
                    customerId: customerId,
                    interaction_type: interactionType
                }
            });
            console.log('Product interaction updated');
        } catch (error) {
            console.error('Error updating product interaction:', error.response ? error.response.data : error.message);
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
        setIsModalOpen(true); // Open modal
        handleProductInteraction(product.product_code, 'view');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
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
            <h2>Top Products</h2>
            <div className='product-list' style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
                {paginatedProducts.map((product) => (
                    <ProductCard
                        key={product.product_code}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onProductInteraction={handleProductInteraction}
                        onProductClick={handleProductClick}  // Pass down the click handler for modal
                    />
                ))}
            </div>
            <div className='pagination-controls'>
                <button onClick={() => handlePageChange(-1)} disabled={currentPage === 0}>Previous</button>
                <button onClick={() => handlePageChange(1)} disabled={(currentPage + 1) * PAGE_SIZE >= products.length}>Next</button>
            </div>

            {/* Render the modal for selected product */}
            <ProductModal
                isOpen={isModalOpen}
                product={selectedProduct}
                onAddToCart={handleAddToCart}
                onClose={closeModal}
            />
        </div>
    );
};

export default ProductList;
