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
               // const response = await axios.get('http://localhost:5001/products');
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
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('customer_id');

                if (token && userId) {
                    const response = await axios.get(`http://localhost:5001/recommend-products`);
                    setRecommendedProducts(response.data);
                }
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
        // Create an object that includes the product details and quantity
        const productData = {
            ...product,
            quantity: product.quantity = 1,
        };

        // Retrieve existing selected products or create a new array
        const existingProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];

        // Add the new product to the array
        existingProducts.push(productData);

        // Store the updated array in localStorage
        localStorage.setItem('selectedProducts', JSON.stringify(existingProducts));

        // Redirect to the checkout page
        window.location.href = '/checkout';
        console.log(productData);
    };



    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('customer_id');

        if (!token || !userId) {
            console.log('User not logged in or user ID missing');
            return;
        }

        try {
            await axios.post(
                'http://localhost:5001/add-to-cart',
                { product_code: product.product_code, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Product added to cart');
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
                                <p className='product-brand'>Brand: {product.brand}</p>
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
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommended Products Section */}
            {recommendedProducts.length > 0 && (
                <div className='recommendations-section'>
                    <h2>Recommended for You</h2>
                    <div className='product-list'>
                        {recommendedProducts.map((product) => (
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
                                    <p className='product-brand'>Brand: {product.brand}</p>
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
                            <p className='product-price'>Price: ${product.price}</p>
                            <p className='product-brand'>Brand: {product.brand}</p>
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
