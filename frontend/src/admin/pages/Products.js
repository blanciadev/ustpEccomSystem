import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../admin.css";
import AdminNav from "../components/AdminNav";
import AdminHeader from "../components/AdminHeader";
import TopProduct from "../components/TopProduct";
import ProductStatistics from "../components/ProductStatistics";
import AddProductModal from "../components/AddProductModal";
import UpdateProductModal from "../components/UpdateProductModal";
import RemoveDiscountProduct from "../components/DiscountProductModal";
import BundleProduct from "../components/BundleProductModal";

import { VscCombine } from "react-icons/vsc";

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
  const [isDiscountProductModalOpen, setIsDiscountProductModalOpen] =
    useState(false);
  const [isBundleProductModalOpen, setIsBundleProductModalOpen] =
    useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProduct = async () => {
    try {
      const response = await axios.get("https://ustp-eccom-server.vercel.app/api/admin-products");
      setProducts(response.data);
      setFilteredProducts(response.data);
      //console.log("Product Data", response.data);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 425);
  };

  const fetchProductStatistics = async () => {
    try {
      const response = await axios.get(
        "https://ustp-eccom-server.vercel.app/api/admin-products-with-interaction"
      );
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
      console.error("Error fetching product statistics:", error);
    }
  };

  useEffect(() => {
    const results = products.filter((product) => {
      const matchesSearch =
        (product.product_name &&
          product.product_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (product.product_code &&
          product.product_code
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) || // Search by product code
        (product.description &&
          product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) || // Search by description
        (product.category_name &&
          product.category_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())); // Search by category name

      return matchesSearch;
    });
    fetchProductStatistics();
    setFilteredProducts(results);
    setCurrentPage(1);
  }, [searchQuery, products]);

  const handleAddProduct = async (newProduct) => {
    try {
      await axios.post("https://ustp-eccom-server.vercel.app/api/admin-products", newProduct);
      handleCloseAddModal();
      fetchProduct();
    } catch (error) {
      console.error("Error adding product:", error);
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
  const handleShowDiscountProductModal = () =>
    setIsDiscountProductModalOpen(true);
  const handleCloseDiscountProductModal = () =>
    setIsDiscountProductModalOpen(false);

  // Handlers for Bundle Product Modal
  const handleShowBundleProductModal = () => setIsBundleProductModalOpen(true);
  const handleCloseBundleProductModal = () =>
    setIsBundleProductModalOpen(false);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dash-con">
      <AdminNav />
      <div className="dash-board">
        <div className="dash-header">
          <div className="header-title">
            <i className="bx bxs-spa"></i>
            <h1>Products</h1>
          </div>
          <AdminHeader />
        </div>

        <div className="body">
          <div className="inventory-con">
            <div className="w-100">
              <div class=" mb-3">
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
              </div>
              <div>
                <div className="product-two">
                  <div class="container align-items-center mb-2">
                    <div class="row align-items-center m-0 p-0">
                      <div class="col-6">
                        <div class="search d-flex  ">
                          {" "}
                          <form>
                            <input
                              type="search"
                              placeholder="Search products..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="form-control"
                            />
                          </form>
                        </div>
                      </div>

                      {/* <div class="col-3 ">
                        <div class="d-flex justify-content-center ">
                          <button
                            onClick={handlePrintOrders}
                            className="btn btn-primary"
                          >
                            {isMobile ? (
                              <i className="bx bx-printer"></i>
                            ) : (
                              "Export Order Record"
                            )}
                          </button>
                        </div>
                      </div> */}

                      <div class="col-2 ">
                        <div class="d-flex justify-content-center align-items-center">
                          <Button
                            variant="primary"
                            onClick={handleShowAddModal}
                          >
                            <i className="bx bx-plus">Add Product</i>
                          </Button>
                        </div>
                      </div>

                      <div class="col-2 ">
                        <div class=" d-flex justify-content-end">
                          {/* <VscCombine /> */}
                          <BundleProduct

                            show={isBundleProductModalOpen}
                            handleClose={handleCloseBundleProductModal}
                            handleUpdate={fetchProduct}
                          />
                        </div>
                      </div>

                      <div class="col-2 ">
                        <div class="d-flex justify-content-end">
                          <Button
                            variant="danger"
                            onClick={handleShowDiscountProductModal}
                          >
                            {isMobile ? (
                              <i class="bx bxs-trash"></i>
                            ) : (
                              "Remove Bundle"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/*   
  
  
                  <div className="cheader">
                    <div className="search">
                      <form>
                        <input
                          type="search"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </form>
                    </div>

                    <div className="options">
                      <div className="product-buttons">
                        <Button variant="primary" onClick={handleShowAddModal}>
                          <i className="bx bx-plus"></i>
                        </Button>
                        <BundleProduct
                          show={isBundleProductModalOpen}
                          handleClose={handleCloseBundleProductModal}
                          handleUpdate={fetchProduct}
                        />
                        <Button
                          variant="primary"
                          onClick={handleShowDiscountProductModal}
                        >
                          {isMobile ? (
                            <i class="bx bxs-trash"></i>
                          ) : (
                            "Remove Bundle"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div> */}

                  {/* Product Table */}

                  <div className="">
                    <div
                      className="mx-4 border"
                      style={{ height: "330px", overflowY: "auto" }}
                    >
                      <div className="">
                        <table className="table table-hover">
                          <thead
                            className="bg-light sticky-top my-4"
                            style={{ position: "sticky", top: 0, zIndex: 1 }}
                          >
                            <tr className="">
                              {/* <th style={{ width: "5%" }}>
                                <input type="checkbox" />
                              </th> */}
                              <th style={{ width: "10%" }}>Product Code</th>
                              <th style={{ width: "30%" }}>Product Name</th>
                              <th style={{ width: "15%" }}>Price</th>
                              <th style={{ width: "15%" }}>Category</th>
                              <th style={{ width: "15%" }}>Quantity</th>
                              <th style={{ width: "10%" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedProducts.map((product) => (
                              <tr key={product.product_id}>
                                {/* <td>
                                  <input type="checkbox" />
                                </td> */}
                                <td>{product.product_code}</td>
                                <td>{product.product_name}</td>
                                <td>
                                  ₱
                                  {product.price.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </td>
                                <td>{product.category_name}</td>
                                <td>{product.quantity}</td>
                                {/* <td>{product.description}</td> */}
                                <td>
                                  <button
                                    onClick={() =>
                                      handleShowProductModal(product)
                                    }
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="d-flex justify-content-center align-items-center">
                      <div className="d-flex justify-content-center align-items-center">
                        <button
                          className="me-2"
                          disabled={currentPage === 1}
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                        >
                          Previous
                        </button>
                        <span className="px-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          className="me-2"
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>






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