import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import TopProduct from '../components/TopProduct';
import ProductStatistics from '../components/ProductStatistics';
import AddProductModal from '../components/AddProductModal';
import UpdateProductModal from '../components/UpdateProductModal';
import RemoveDiscountProduct from '../components/DiscountProductModal';
import BundleProduct from '../components/BundleProductModal';

const Products = () => {
  const [bestSellingCount, setBestSellingCount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockQuantity, setLowStockQuantity] = useState(0);
  const [unpopularProducts, setUnpopularProducts] = useState([]);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [outOfStockQuantity, setOutOfStockQuantity] = useState(0);
  const [discontinuedCount, setDiscontinuedCount] = useState(0);
  const [discontinuedQuantity, setDiscontinuedQuantity] = useState(0);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDiscountProductModalOpen, setIsDiscountProductModalOpen] = useState(false);
  const [isBundleProductModalOpen, setIsBundleProductModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProduct = async () => {
    try {
      const response = await axios.get('http://localhost:5001/admin-products');
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 425);
  };

  const fetchProductStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:5001/admin-products-with-interaction');
      const {
        total,
        totalQuantity,
        lowStockCount,
        lowStockQuantity,
        unpopularProducts,
        outOfStockCount,
        outOfStockQuantity,
        discontinuedCount,
        discontinuedQuantity,
      } = response.data;

      setBestSellingCount(total);
      setTotalQuantity(totalQuantity);
      setLowStockCount(lowStockCount);
      setLowStockQuantity(lowStockQuantity);
      setUnpopularProducts(unpopularProducts || 0);
      setOutOfStockCount(outOfStockCount);
      setOutOfStockQuantity(outOfStockQuantity);
      setDiscontinuedCount(discontinuedCount);
      setDiscontinuedQuantity(discontinuedQuantity);
    } catch (error) {
      console.error('Error fetching product statistics:', error);
    }
  };


  useEffect(() => {
    const results = products.filter(product => {
      const matchesSearch =
        (product.product_name && product.product_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.product_code && product.product_code.toLowerCase().includes(searchQuery.toLowerCase())) || // Search by product code
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) || // Search by description
        (product.category_name && product.category_name.toLowerCase().includes(searchQuery.toLowerCase())); // Search by category name

      return matchesSearch;
    });

    setFilteredProducts(results);
    setCurrentPage(1);
  }, [searchQuery, products]);


  const handleAddProduct = async (newProduct) => {
    try {
      await axios.post('http://localhost:5001/admin-products', newProduct);
      handleCloseAddModal();
      fetchProduct();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  // Handlers for Add Product Modal
  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  // Handlers for Update Product Modal
  const handleShowProductModal = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(false);
  };

  // Handlers for Discount Product Modal
  const handleShowDiscountProductModal = () => setIsDiscountProductModalOpen(true);
  const handleCloseDiscountProductModal = () => setIsDiscountProductModalOpen(false);

  // Handlers for Bundle Product Modal
  const handleShowBundleProductModal = () => setIsBundleProductModalOpen(true);
  const handleCloseBundleProductModal = () => setIsBundleProductModalOpen(false);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className='dash-con'>
      <AdminNav />
      <div className='dash-board'>
        <div className='dash-header'>
          <div className='header-title'>
            <i className='bx bxs-spa'></i>
            <h1>Products</h1>
          </div>
          <AdminHeader />
        </div>

        <div className='body'>
          <div className='product-con'>
            <ProductStatistics
              bestSellingCount={bestSellingCount}
              totalQuantity={totalQuantity}
              lowStockCount={lowStockCount}
              lowStockQuantity={lowStockQuantity}
              unpopularProducts={unpopularProducts}
              outOfStockCount={outOfStockCount}
              outOfStockQuantity={outOfStockQuantity}
              discontinuedCount={discontinuedCount}
              discontinuedQuantity={discontinuedQuantity}
            />
            <TopProduct />

            <div className='product-two'>
              <div className='cheader'>
                <div className='search'>
                  <form>
                    <input
                      type='search'
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                </div>

                <div className='options'>
                  <div className='product-buttons'>
                    <Button variant="primary" onClick={handleShowAddModal}>
                      <i className='bx bx-plus'></i>
                    </Button>
                    <BundleProduct
                      show={isBundleProductModalOpen}
                      handleClose={handleCloseBundleProductModal}
                      handleUpdate={fetchProduct}
                    />
                    <Button variant="primary" onClick={handleShowDiscountProductModal}>
                      {isMobile ? (<i class='bx bxs-trash'></i>) : ('Remove Bundle')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product Table */}
              <div className='prod-table table-responsive'>
                <table className="table table-hover">
                  <thead className='bg-light sticky-top'>
                    <tr>
                      <th><input type='checkbox' /></th>
                      <th>Product Code</th>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Description</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedProducts.map((product) => (
                      <tr key={product.product_id}>
                        <td><input type='checkbox' /></td>
                        <td>{product.product_code}</td>
                        <td>{product.product_name}</td>
                        <td>P{product.price}</td>
                        <td>{product.category_name}</td>
                        <td>{product.quantity}</td>
                        <td>{product.description}</td>
                        <td>
                          <Button variant="secondary" onClick={() => handleShowProductModal(product)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        show={showAddModal}
        handleClose={handleCloseAddModal}
        handleSave={handleAddProduct}
      />
      {selectedProduct && (
        <UpdateProductModal
          show={isProductModalOpen}
          handleClose={handleCloseProductModal}
          product={selectedProduct}
          handleUpdate={fetchProduct}
        />
      )}
      <RemoveDiscountProduct
        show={isDiscountProductModalOpen}
        handleClose={handleCloseDiscountProductModal}
        handleUpdate={fetchProduct}
      />
    </div>
  );
};

export default Products;
