import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { cartEventEmitter } from './eventEmitter'; // Import the event emitter

// ProductCard Component
const ProductCard = ({ product, onAddToCart }) => {
    if (!product) {
        return <div>Product data is not available</div>;
    }

    // Function to update product interaction
    const handleProductInteraction = async (productCode) => {
        try {
            await axios.get('http://localhost:5000/products-interaction', {
                params: { product_code: productCode } // Send product_code as a query parameter
            });
            console.log('Product interaction updated');
        } catch (error) {
            console.error('Error updating product interaction:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className='procard' style={{ width: '22%', margin: '1%' }}>
            <div className='productimg' style={{ width: '100%', height: '65%' }}>
                <img
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    src={product.image_url || 'https://via.placeholder.com/150'}
                    alt={product.product_name || 'Product Image'}
                    onClick={() => handleProductInteraction(product.product_code)} // Trigger interaction on image click
                />
            </div>
            <div className='productdesc' style={{ width: '100%', height: '35%' }}>
                <div className='product-data'>
                    <p>{product.product_name || 'No product name'}</p>
                    <p>Quantity: {product.quantity}</p> {/* Display quantity */}
                    <div className='order-options'>
                        <button onClick={() => { handleProductInteraction(product.product_code); onAddToCart(product); }}>
                            Add to Cart
                        </button>
                        <button onClick={() => handleProductInteraction(product.product_code)}>Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        image_url: PropTypes.string,
        product_name: PropTypes.string,
        product_code: PropTypes.string.isRequired,
        quantity: PropTypes.number // Ensure quantity is handled
    }).isRequired,
    onAddToCart: PropTypes.func.isRequired
};

// Shuffle array function
const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
};

const PAGE_SIZE = 4; // Number of products per page (e.g., 4 products per row)

const ProductList = () => {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [customerId, setCustomerId] = React.useState(null);
    const [currentPage, setCurrentPage] = React.useState(0);

    React.useEffect(() => {
        const storedCustomerId = localStorage.getItem('customer_id');
        if (storedCustomerId) {
            setCustomerId(storedCustomerId);
        }

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/products');
                const shuffledProducts = shuffleArray(response.data); // Shuffle products
                setProducts(shuffledProducts);
            } catch (error) {
                setError('Error fetching products: ' + (error.response ? error.response.data : error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleAddToCart = async (product) => {
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
            }
        } catch (error) {
            console.error('Error adding product to cart:', error.response ? error.response.data : error.message);
        }
    };

    const handlePageChange = (direction) => {
        setCurrentPage((prevPage) => {
            const newPage = prevPage + direction;
            // Ensure new page is within bounds
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
            <div className='product-list' style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
                {paginatedProducts.map((product) => (
                    <ProductCard key={product.product_code} product={product} onAddToCart={handleAddToCart} />
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
            </div>
        </div>
    );
};

export default ProductList;
