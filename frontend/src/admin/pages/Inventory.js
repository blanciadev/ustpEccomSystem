import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../admin.css";
import AdminNav from "../components/AdminNav";
import AdminHeader from "../components/AdminHeader";
import axios from "axios";
import ProductStatistics from "../components/ProductStatistics";

const ITEMS_PER_PAGE = 10;

const Inventory = () => {
  const [bestSellingCount, setBestSellingCount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockQuantity, setLowStockQuantity] = useState(0);
  const [unpopularProducts, setUnpopularProducts] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [outOfStockQuantity, setOutOfStockQuantity] = useState(0);
  const [discontinuedCount, setDiscontinuedCount] = useState(0);
  const [discontinuedQuantity, setDiscontinuedQuantity] = useState(0);
  const [productNames, setProductNames] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [stockStatusFilter, setStockStatusFilter] = useState(""); // New state for filter

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const fetchProductStatistics = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/admin-products-with-interaction"
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

  const fetchProductNames = async () => {
    try {
      const response = await axios.get("http://localhost:5001/admin-products-inventory");
      setProductNames(response.data);
      console.log("Product Names:", response.data);
    } catch (error) {
      console.error("Error fetching product names:", error);
    }
  };

  // const fetchInventoryItems = async () => {
  //   try {
  //     const response = await axios.get("http://localhost:5001/admin-inventory");
  //     setInventoryItems(response.data);
  //     console.log("Inventory Items:", response.data);
  //   } catch (error) {
  //     console.error("Error fetching inventory items:", error);
  //   }
  // };

  useEffect(() => {
    fetchProductStatistics();
    fetchProductNames();
    // fetchInventoryItems();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };


  const ExportButton = () => {
    const handleExport = () => {
      const url = 'http://localhost:5001/admin-products-inventory?export=excel';

      const link = document.createElement('a');
      link.href = url;
      link.download = 'products.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <button onClick={handleExport} className="btn btn-success">
        Export to Excel
      </button>
    );
  };

  const filteredProducts = productNames.filter((product) => {
    // Filter based on stock status
    let stockStatus = "Low on Stock";
    let isLowStock = false;

    if (product.quantity > 100) {
      stockStatus = "Good Stocks";
    } else if (product.quantity > 20) {
      stockStatus = "Moderately Low";
    } else {
      isLowStock = true;
    }

    // Apply filters
    return (
      (product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.price.toString().includes(searchTerm) ||
        product.quantity.toString().includes(searchTerm)) &&
      (stockStatusFilter === "" || stockStatus === stockStatusFilter)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="dash-con">
      <AdminNav />
      <div className="dash-board">
        <div className="dash-header">
          <div className="header-title">
            <i className="bx bxs-clipboard"></i>
            <h1>Inventory</h1>
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
                      <div class="col-4">
                        <div class="search d-flex  ">
                          {" "}
                          <form onSubmit={handleSearch}>
                            <input
                              type="search"
                              placeholder="Search products..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="form-control"
                            />
                          </form>
                        </div>
                      </div>


                      <div class="col-3 ">
                        <div class="d-flex justify-content-center ">
                          <ExportButton />
                        </div>
                      </div>

                      <div class="col-2">
                        <div class=" d-flex ">
                          {/* empty div */}
                        </div>
                      </div>

                      <div class="col-3">
                        <div class="d-flex ">
                          <label htmlFor="status" className="me-2">
                            Filter By Status:
                          </label>

                          <select
                            name="status"
                            id=""
                            value={stockStatusFilter}
                            onChange={(e) =>
                              setStockStatusFilter(e.target.value)
                            }
                            className=""
                          >
                            <option value="">All Status</option>
                            <option value="Good Stocks">Good Stocks</option>
                            <option value="Low on Stock">Low on Stock</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

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
                              <th style={{ width: "10%" }}>Product ID</th>
                              <th style={{ width: "10%" }}>Code</th>
                              <th style={{ width: "25%" }}>Name</th>
                              <th style={{ width: "15%" }}>Price</th>
                              <th style={{ width: "10%" }}>Quantity</th>
                              <th style={{ width: "15%" }}>Category</th>
                              <th style={{ width: "10%" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentProducts.map((product) => {
                              let stockStatus = "Low on Stock";
                              let isLowStock = false;

                              if (product.quantity > 100) {
                                stockStatus = "Good Stocks";
                              } else if (product.quantity > 20) {
                                stockStatus = "Moderately Low";
                              } else {
                                isLowStock = true;
                              }

                              return (
                                <tr key={product.product_id}>
                                  {/* <td>
                                    <input type="checkbox" />
                                  </td> */}
                                  <td>{product.product_id}</td>
                                  <td>{product.product_code}</td>
                                  <td class="text-left">
                                    {product.product_name}
                                  </td>
                                  <td>
                                    ₱
                                    {product.price.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className={isLowStock ? "blinking" : ""}>
                                    {product.quantity}
                                  </td>
                                  <td>{product.category_name}</td>
                                  <td>{stockStatus}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="d-flex justify-content-center align-items-center">
                      <div className="d-flex justify-content-center align-items-center">
                        <button
                          className="me-2"
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          Previous
                        </button>
                        <span className="px-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          className="me-2"
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
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
    </div>
  );
};

export default Inventory;
