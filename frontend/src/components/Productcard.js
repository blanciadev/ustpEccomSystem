import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { cartEventEmitter } from './eventEmitter';

// Shuffle array function
const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
};

const PAGE_SIZE = 4; // Number of products per page 

// ProductCard Component
const ProductCard = React.memo(({ product, onAddToCart, onProductInteraction }) => {
    if (!product) {
        return <div>Product data is not available</div>;
    }

    return (
        <div className='procard' style={{ width: '22%', margin: '1%' }}>
            <div className='productimg' style={{ width: '100%', height: '65%' }}>
                <img
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    src={product.image_url || 'https://via.placeholder.com/150'}
                    alt={product.product_name || 'Product Image'}
                    onClick={() => onProductInteraction(product.product_code, 'view')} // Trigger interaction on image click
                />
            </div>
            <div className='productdesc' style={{ width: '100%', height: '35%' }}>
                <div className='product-data'>
                    <p>{product.product_name || 'No product name'}</p>
                    <p>Quantity: {product.quantity}</p> {/* Display quantity */}
                    <div className='order-options'>
                        <button onClick={() => onAddToCart(product)}>Add to Cart</button>
                        <button onClick={() => onProductInteraction(product.product_code, 'view')}>Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
});

ProductCard.propTypes = {
    product: PropTypes.shape({
        image_url: PropTypes.string,
        product_name: PropTypes.string,
        product_code: PropTypes.string.isRequired,
        quantity: PropTypes.number
    }).isRequired,
    onAddToCart: PropTypes.func.isRequired,
    onProductInteraction: PropTypes.func.isRequired
};

// ProductList Component
const ProductList = () => {
    const [products, setProducts] = React.useState([]);
    const [recommendedProducts, setRecommendedProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [customerId, setCustomerId] = React.useState(null);
    const [currentPage, setCurrentPage] = React.useState(0);

    React.useEffect(() => {
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
        const customerId = localStorage.getItem('customer_id'); // Retrieve customer ID from local storage
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
                    />
                ))}
            </div>
            <div className='pagination-controls' style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    onClick={() => handlePageChange(-1)}
                    disabled={currentPage === 0}
                >
                    Previous
                </button>
                <span> Page {currentPage + 1} </span>
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={(currentPage + 1) * PAGE_SIZE >= products.length}
                >
                    Next
                </button>
            </div><br></br>
            {recommendedProducts.length > 0 && (
                <>
                    <h2>Recommended Products</h2>
                    <div className='recommended-products' style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
                        {recommendedProducts.map((product) => (
                            <ProductCard
                                key={product.product_code}
                                product={product}
                                onAddToCart={handleAddToCart}
                                onProductInteraction={handleProductInteraction}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductList;
