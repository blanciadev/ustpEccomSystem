import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import TopProduct from '../components/TopProduct';
import ProductStatistics from '../components/ProductStatistics';
import ProductTable from '../components/ProductTable';
import AddProductModal from '../components/AddProductModal';
import ProductModal from '../components/UpdateProductModal';
import RemoveDiscountProduct from '../components/DiscountProductModal';
import BundleProduct from '../components/BundleProductModal'; // Import the modal

const Products = () => {
  // States for product data
  const [bestSellingCount, setBestSellingCount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockQuantity, setLowStockQuantity] = useState(0);
  const [unpopularProducts, setUnpopularProducts] = useState([]);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [outOfStockQuantity, setOutOfStockQuantity] = useState(0);
  const [discontinuedCount, setDiscontinuedCount] = useState(0);
  const [discontinuedQuantity, setDiscontinuedQuantity] = useState(0);

  // States for products and modal visibility
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDiscountProductModalOpen, setIsDiscountProductModalOpen] = useState(false);
  const [isBundleProductModalOpen, setIsBundleProductModalOpen] = useState(false); // State for BundleProduct modal

  // Fetch data for product statistics and list
  const fetchProductData = async () => {
    try {
      const response = await axios.get('http://localhost:5001/admin-products-with-interaction');
      const {
        total, totalQuantity, lowStockCount, lowStockQuantity, unpopularProducts, outOfStockCount, outOfStockQuantity, discontinuedCount, discontinuedQuantity
      } = response.data;

      setBestSellingCount(total);
      setTotalQuantity(totalQuantity);
      setLowStockCount(lowStockCount);
      setLowStockQuantity(lowStockQuantity);
      setUnpopularProducts(unpopularProducts || []);
      setOutOfStockCount(outOfStockCount);
      setOutOfStockQuantity(outOfStockQuantity);
      setDiscontinuedCount(discontinuedCount);
      setDiscontinuedQuantity(discontinuedQuantity);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await axios.get('http://localhost:5001/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  useEffect(() => {
    fetchProductData();
    fetchProduct();
  }, []);

  // Add product handler
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
  const handleShowBundleProductModal = () => setIsBundleProductModalOpen(true); // Show modal
  const handleCloseBundleProductModal = () => setIsBundleProductModalOpen(false); // Close modal

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
            <div className='product-one'>
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
            </div>

            <div className='product-two'>
              <div className='cheader'>
                <div className='search'>
                  <form>
                    <input type='search' placeholder="Search products..." />
                  </form>
                </div>

                <div className='options'>
                  
                  <div className='product-buttons'>
                    <Button variant="primary" onClick={handleShowAddModal}>
                        <i class='bx bx-plus'></i>
                    </Button>
                    <BundleProduct
                        show={isBundleProductModalOpen}
                        handleClose={handleCloseBundleProductModal}
                        handleUpdate={fetchProduct}
                    />
                    <Button variant="primary" onClick={handleShowDiscountProductModal}>
                        Remove Discount/Bundle
                    </Button>
                  </div>
                  <div className='sort'>
                    <label htmlFor="sort">Sort By</label>
                    <select name="sort" id="sort">
                      <option value="date">Date</option>
                      <option value="status">Status</option>
                      <option value="id">ID</option>
                      <option value="customer-id">Customer</option>
                    </select>
                  </div>

                </div>
              </div>

              <ProductTable handleShowProductModal={handleShowProductModal} />
            </div>
          </div>
        </div>
      </div>

      <AddProductModal
        show={showAddModal}
        handleClose={handleCloseAddModal}
        handleAddProduct={handleAddProduct}
      />

      <RemoveDiscountProduct
        show={isDiscountProductModalOpen}
        handleClose={handleCloseDiscountProductModal}
        order={selectedProduct}
        handleUpdate={fetchProduct}
      />



      {selectedProduct && (
        <ProductModal
          show={isProductModalOpen}
          product={selectedProduct}
          handleClose={handleCloseProductModal}
          handleUpdateProduct={fetchProduct}
        />
      )}
    </div>
  );
};

export default Products;
