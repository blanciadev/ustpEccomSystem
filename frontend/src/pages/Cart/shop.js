import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Shop.css';
import Navigation from '../../components/Navigation';
import { cartEventEmitter } from '../../components/eventEmitter';
import ProductModal from '../../components/ProductModal';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [topPickedProducts, setTopPickedProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {

                const response = await axios.get('http://localhost:5001/products');
                setProducts(response.data);
                setFilteredProducts(response.data);
                setCategories([...new Set(response.data.map(product => product.category_name))]);
            } catch (error) {
                setError('Error fetching products: ' + (error.response ? error.response.data : error.message));
            } finally {
                setLoading(false);
            }
        };

        const fetchTopPickedProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5001/products-top-picks');
                setTopPickedProducts(response.data);
            } catch (error) {
                console.error('Error fetching top-picked products:', error.response ? error.response.data : error.message);
            }
        };


        const fetchRecommendedProducts = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/products-bundle-recommendation`);
                if (response.data.length === 0) {
                    console.log('No recommended products found.');
                }
                setRecommendedProducts(response.data);
            } catch (error) {
                console.error('Error fetching recommended products:', error.response ? error.response.data : error.message);
            }
        };



        fetchProducts();
        fetchTopPickedProducts();
        fetchRecommendedProducts();
    }, []);

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        const filtered = category ? products.filter(product => product.category_name === category) : products;
        setFilteredProducts(filtered);
        setCurrentPage(1);
    };

    const handleBuyNow = (product) => {
        const productData = {
            ...product,
            quantity: product.quantity = 1,
        };

        const existingProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];

        existingProducts.push(productData);


        localStorage.setItem('selectedProducts', JSON.stringify(existingProducts));

        // Redirect to the checkout page
        window.location.href = '/checkout';
        console.log(productData);
    };

   // Function to generate a unique code for cart_items_id
function generateCartItemId() {
    return 'CART-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('customer_id');

    if (!token || !userId) {
        console.log('User not logged in or user ID missing, saving to localStorage.');

        // Handle saving to localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProductIndex = cart.findIndex(item => item.product_code === product.product_code);

        if (existingProductIndex !== -1) {
            // If the product already exists, increase the quantity
            cart[existingProductIndex].quantity += 1;
            cart[existingProductIndex].sub_total = cart[existingProductIndex].quantity * cart[existingProductIndex].price;
            console.log('Increased quantity for existing product:', cart[existingProductIndex]);
        } else {
            // Add a new product to the cart
            const newCartItem = {
                cart_items_id: generateCartItemId(), // Generate unique ID for the cart item
                product_code: product.product_code,
                product_name: product.product_name,
                price: product.price,
                quantity: 1,
                sub_total: product.price // Initial sub_total is equal to price
            };
            cart.push(newCartItem);
            console.log('Added new product to cart:', newCartItem);
        }

        // Save the updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Cart updated and saved to localStorage:', cart);

        // Emit cart update event
        cartEventEmitter.emit('cartUpdated', { product_code: product.product_code, quantity: 1 });
        return;
    }

    try {
        // If the user is logged in, add the product to the server-side cart
        await axios.post(
            'http://localhost:5001/add-to-cart',
            { product_code: product.product_code, quantity: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Product added to server-side cart');
        cartEventEmitter.emit('cartUpdated', { product_code: product.product_code, quantity: 1 });
    } catch (error) {
        console.error('Error adding product to cart:', error.response ? error.response.data : error.message);
    }
};


    const openModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='shop-container'>
            <Navigation />

            {/* Top Picks Section */}
            <div className='top-picks-section'>
                <h2>Top Picks</h2>
                <div className='product-list'>
                    {topPickedProducts.map((product) => (
                        <div key={product.product_code} className='product-item' onClick={() => openModal(product)}>
                            <div className='product-img'>
                                <img
                                    src={product.product_image || 'https://via.placeholder.com/150'}
                                    alt={product.product_name || 'Product Image'}
                                />
                            </div>
                            <div className='product-desc'>
                                <p className='product-name'>{product.product_name || 'No product name'}</p>
                                <p className='product-quantity'>Quantity: {product.quantity}</p>
                                <p className='product-price'>Price: ${product.price}</p>
                                {product.product_status === 'Discounted' && (
                                    <p className='product-price'>Product Discount: P{product.product_discount}%</p>
                                )}
                                {product.quantity > 0 ? (
                                    <>
                                        <button
                                            className='add-to-cart-button'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(product);
                                            }}
                                        >
                                            Add to Cart
                                        </button>
                                        <button
                                            className='buy-now-button'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBuyNow(product, product.quantity);
                                            }}
                                        >
                                            Buy Now
                                        </button>
                                    </>
                                ) : (
                                    <p className='out-of-stock'>Out of Stock</p>
                                )}

                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bundle Section */}
            {recommendedProducts.length > 0 && (
                <div className='recommendations-section'>
                    <h2>Discounted Products</h2>
                    <div className='product-list'>
                        {recommendedProducts.map((product) => (
                            <div key={product.product_code} className='product-item' onClick={() => openModal(product)}>
                                <div className='product-img'>
                                    <img
                                        src={product.product_image || 'https://via.placeholder.com/150'}
                                        alt={product.product_name || 'Product Image'}
                                        loading="lazy"
                                    />
                                </div>
                                <div className='product-desc'>
                                    <p className='product-name'>{product.product_name || 'No product name available'}</p>
                                    <p className='product-quantity'>Quantity: {product.quantity !== undefined ? product.quantity : 'N/A'}</p>
                                    <p className='product-price'>Price: ${product.price !== undefined ? product.price.toFixed(2) : 'N/A'}</p>

                                    {product.product_status === 'Discounted' && (
                                        <p className='product-discount'>Discount: {product.product_discount}%</p>
                                    )}

                                    {product.quantity > 0 ? (
                                        <div className='button-group'>
                                            <button
                                                className='add-to-cart-button'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product);
                                                }}
                                            >
                                                Add to Cart
                                            </button>
                                            <button
                                                className='buy-now-button'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBuyNow(product, product.quantity);
                                                }}
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    ) : (
                                        <p className='out-of-stock'>Out of Stock</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter Section */}
            <div className='filter-section'>
                <label htmlFor='category-filter'>Filter by Category:</label>
                <select id='category-filter' value={selectedCategory} onChange={handleCategoryChange}>
                    <option value=''>All Categories</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </div>

            {/* Products List */}
            <div className='product-list'>
                {currentProducts.map((product) => (
                    <div key={product.product_code} className='product-item' onClick={() => openModal(product)}>
                        <div className='product-img'>
                            <img
                                src={product.product_image || 'https://via.placeholder.com/150'}
                                alt={product.product_name || 'Product Image'}
                            />
                        </div>
                        <div className='product-desc'>
                            <p className='product-name'>{product.product_name || 'No product name'}</p>
                            <p className='product-quantity'>Quantity: {product.quantity}</p>
                            <p className='product-price'>Price: P{product.price}</p>
                            {product.product_status === 'Discounted' && (
                                <p className='product-price'>Product Discount: P{product.product_discount}%</p>
                            )}
                            {/* <p className='product-brand'>Brand: {product.brand}</p> */}

                            {product.quantity > 0 ? (
                                <>
                                    <button
                                        className='add-to-cart-button'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        className='buy-now-button'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBuyNow(product, product.quantity);
                                        }}
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

            {/* Pagination */}
            <div className='pagination'>
                {[...Array(Math.ceil(filteredProducts.length / productsPerPage)).keys()].map(number => (
                    <button key={number + 1} onClick={() => paginate(number + 1)} className={number + 1 === currentPage ? 'active' : ''}>
                        {number + 1}
                    </button>
                ))}
            </div>

            {isModalOpen && (
                <ProductModal
                    isOpen={isModalOpen}
                    product={selectedProduct}
                    onAddToCart={handleAddToCart}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default Shop;
