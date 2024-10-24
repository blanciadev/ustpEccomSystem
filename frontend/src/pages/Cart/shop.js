import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Shop.css';
import Navigation from '../../components/Navigation';
import { cartEventEmitter } from '../../components/eventEmitter';
import ProductModal from '../../components/ProductModal';
import ToastNotification from '../../components/ToastNotification';
import ClientHomeLoader from '../../Loaders/ClientHomeLoader';

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
    const [toastMessage, setToastMessage] = useState('');
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

        setToastMessage('Redirecting to Checkout Page');

        setTimeout(() => {
            setToastMessage('');
        }, 3000);

        window.location.href = '/checkout';
        console.log(productData);

    };

    function generateCartItemId() {
        return 'CART-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('customer_id');

        if (!token || !userId) {
            console.log('User not logged in or user ID missing, saving to localStorage.');

            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingProductIndex = cart.findIndex(item => item.product_code === product.product_code);

            if (existingProductIndex !== -1) {
                cart[existingProductIndex].quantity += 1;
                cart[existingProductIndex].sub_total = cart[existingProductIndex].quantity * cart[existingProductIndex].price;
                console.log('Increased quantity for existing product:', cart[existingProductIndex]);
            } else {
                const newCartItem = {
                    cart_items_id: generateCartItemId(),
                    product_code: product.product_code,
                    product_name: product.product_name,
                    price: product.price,
                    quantity: 1,
                    sub_total: product.price
                };
                cart.push(newCartItem);
                console.log('Added new product to cart:', newCartItem);

                setToastMessage('Added to cart!');

                setTimeout(() => {
                    setToastMessage('');
                }, 3000);
                return;
            }


            localStorage.setItem('cart', JSON.stringify(cart));
            console.log('Cart updated and saved to localStorage:', cart);


            cartEventEmitter.emit('cartUpdated', { product_code: product.product_code, quantity: 1 });

            setToastMessage('Added to cart!');


            setTimeout(() => {
                setToastMessage('');
            }, 3000);
            return;

        }

        try {
            await axios.post(
                'http://localhost:5001/add-to-cart',
                { product_code: product.product_code, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Product added to server-side cart');
            cartEventEmitter.emit('cartUpdated', { product_code: product.product_code, quantity: 1 });

            setToastMessage('Added to cart!');

            setTimeout(() => {
                setToastMessage('');
            }, 3000);
            return;

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
        return <ClientHomeLoader />
    }

    if (error) {
        return <div>{error}</div>;
    }


    return (
        <div className='shop'>
            <Navigation />
            <ToastNotification toastMessage={toastMessage} />
            {/* Top Picks Section */}
            <div className='shop__top-picks'>
                <h2 className='shop__title'>Top Picks</h2>
                <div className='shop__product-list'>
                    {topPickedProducts.map((product) => (
                        <div key={product.product_code} className='shop__product-item' onClick={() => openModal(product)}>
                            <div className='shop__product-img'>
                                <img
                                    src={product.product_image || 'https://via.placeholder.com/150'}
                                    alt={product.product_name || 'Product Image'}
                                />
                            </div>
                            <div className='shop__product-desc'>
                                <p className='shop__product-name'>{product.product_name || 'No product name'}</p>
                                <p className='shop__product-quantity'>Quantity: {product.quantity}</p>
                                <p className='shop__product-price'>Price: ${product.price}</p>
                                {product.product_status === 'Discounted' && (
                                    <p className='shop__product-discount'>Product Discount: P{product.product_discount}%</p>
                                )}
                                {product.quantity > 0 ? (
                                    <>
                                        <button
                                            className='shop__add-to-cart-button'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(product);
                                            }}
                                        >
                                            <i class='bx bxs-cart-alt cart-icon animated-cart-icon' ></i>
                                        </button>
                                        <button
                                            className='shop__buy-now-button'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBuyNow(product, product.quantity);
                                            }}
                                        >
                                            Buy Now
                                        </button>
                                    </>
                                ) : (
                                    <p className='shop__out-of-stock'> <i class='bx bxs-error'></i> Out of Stock</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bundle Section */}
            {recommendedProducts.length > 0 && (
                <div className='shop__recommendations'>
                    <h2 className='shop__title'>Discounted Products</h2>
                    <div className='shop__product-list'>
                        {recommendedProducts.map((product) => (
                            <div key={product.product_code} className='shop__product-item' onClick={() => openModal(product)}>
                                <div className='shop__product-img'>
                                    <img
                                        src={product.product_image || 'https://via.placeholder.com/150'}
                                        alt={product.product_name || 'Product Image'}
                                        loading="lazy"
                                    />
                                </div>
                                <div className='shop__product-desc'>
                                    <p className='shop__product-name'>{product.product_name || 'No product name available'}</p>
                                    <p className='shop__product-quantity'>Quantity: {product.quantity !== undefined ? product.quantity : 'N/A'}</p>
                                    <p className='shop__product-price'>Price: ${product.price !== undefined ? product.price.toFixed(2) : 'N/A'}</p>
                                    {product.product_status === 'Discounted' && (
                                        <p className='shop__product-discount'>Discount: {product.product_discount}%</p>
                                    )}
                                    {product.quantity > 0 ? (
                                        <div className='shop__button-group'>
                                            <button
                                                className='shop__add-to-cart-button'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product);
                                                }}
                                            >
                                                <i class='bx bxs-cart-alt cart-icon animated-cart-icon' ></i>
                                            </button>
                                            <button
                                                className='shop__buy-now-button'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBuyNow(product, product.quantity);
                                                }}
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    ) : (
                                        <p className='shop__out-of-stock'><i class='bx bxs-error'></i> Out of Stock</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter Section */}
            <div className='shop__filter'>
                <label htmlFor='category-filter' className='shop__filter-label'>Filter by Category:</label>
                <select id='category-filter' className='shop__filter-select' value={selectedCategory} onChange={handleCategoryChange}>
                    <option value=''>All Categories</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </div>

            {/* Products List */}
            <div className='shop__product-list'>
                {currentProducts.map((product) => (
                    <div key={product.product_code} className='shop__product-item' onClick={() => openModal(product)}>
                        <div className='shop__product-img'>
                            <img
                                src={product.product_image || 'https://via.placeholder.com/150'}
                                alt={product.product_name || 'Product Image'}
                            />
                        </div>
                        <div className='shop__product-desc'>
                            <p className='shop__product-name'>{product.product_name || 'No product name'}</p>
                            <p className='shop__product-quantity'>Quantity: {product.quantity}</p>
                            <p className='shop__product-price'>Price: P{product.price}</p>
                            {product.product_status === 'Discounted' && (
                                <p className='shop__product-discount'>Product Discount: P{product.product_discount}%</p>
                            )}
                            {product.quantity > 0 ? (
                                <>
                                    <button
                                        className='shop__add-to-cart-button'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                    >
                                        <i class='bx bxs-cart-alt cart-icon animated-cart-icon' ></i>
                                    </button>
                                    <button
                                        className='shop__buy-now-button'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBuyNow(product, product.quantity);
                                        }}
                                    >
                                        Buy Now
                                    </button>
                                </>
                            ) : (
                                <p className='shop__out-of-stock'><i class='bx bxs-error'></i> Out of Stock</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className='shop__pagination'>
                {[...Array(Math.ceil(filteredProducts.length / productsPerPage)).keys()].map(number => (
                    <button key={number + 1} onClick={() => paginate(number + 1)} className={`shop__pagination-button ${number + 1 === currentPage ? 'shop__pagination-button--active' : ''}`}>
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
