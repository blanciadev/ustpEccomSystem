import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalStatistics from "./ModalStatistics"; // Import the Modal component

const ProductStatistics = ({
  bestSellingCount,
  unpopularProducts = [],
  totalItemsCount,
  totalQuantity,
  lowStockCount,
  outOfStockCount,
}) => {
  const [bestSellingProductsData, setBestSellingProductsData] = useState([]);
  const [nonSellingProductsData, setNonSellingProductsData] = useState([]);

  const [totalItemsCountData, setTotalItemsCountData] = useState([]);

  const [inStockCountData, setInStockCountData] = useState([]);
  const [lowStockCountData, setLowStockCountData] = useState([]);

  const [outOfStockCountData, setOutOfStockCountData] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(""); // State for modal description/content
  const [tableData, setTableData] = useState([]); // State for table data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the best-selling products data
  useEffect(() => {
    const fetchBestSellingProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_LINK}/api/sellable-items`
        );
        setBestSellingProductsData(response.data); // Update state with fetched data
      } catch (err) {
        setError("Failed to fetch best-selling products");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellingProducts();
  }, []);

  // Fetch the non-selling products data
  useEffect(() => {
    const fetchNonSellingProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_LINK}api/non-sellable-items`
        );
        setNonSellingProductsData(response.data); // Update state with fetched data
      } catch (err) {
        setError("Failed to fetch non-selling products");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNonSellingProducts();
  }, []);

  // Fetch the total products data
  useEffect(() => {
    const fetchTotalItemsCount = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_LINK}/api/total-items-count`
        );
        setTotalItemsCountData(response.data); // Update state with fetched data
      } catch (err) {
        setError("Failed to fetch total items count");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalItemsCount();
  }, []);


  // Fetch the in stock count data
  useEffect(() => {
    const fetchInStockCount = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_LINK}/api/in-stock-count`
        );
        setInStockCountData(response.data); // Update state with fetched data
      } catch (err) {
        setError("Failed to fetch in stock count");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInStockCount();
  }, []);



  // Fetch the low stock count data
  useEffect(() => {
    const fetchLowStockCount = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_LINK}/api/low-stock-count`
        );
        setLowStockCountData(response.data); // Update state with fetched data
      } catch (err) {
        setError("Failed to fetch low stock count");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockCount();
  }, []);



  // Fetch the out of stock count data
  useEffect(() => {
    const fetchOutOfStockCount = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_LINK}api/out-of-stock-count`
        );
        setOutOfStockCountData(response.data); // Update state with fetched data
      } catch (err) {
        setError("Failed to fetch out of stock count");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOutOfStockCount();
  }, []);


  const openModal = (title, content, data) => {
    setModalTitle(title); // Set the modal title
    setModalContent(content); // Set the modal description
    setTableData(data); // Set the table data
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setModalTitle(""); // Reset the title
    setModalContent(""); // Reset the content
    setTableData([]); // Reset the table data
  };
  const renderTable = (data) => (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}> {/* Scrollable container */}
      <table
        className="table table-striped table-bordered table-hover"
        style={{ fontSize: '14px', position: 'relative', borderCollapse: 'collapse' }}
      >
        <thead
          className="bg-pink text-white"
          style={{ position: 'sticky', top: 0, zIndex: 1 }}
        >
          <tr>
            <th>#</th> {/* Numbering column */}
            <th>Product Code</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td> {/* Render row number */}
              <td>{item['Product Code']}</td>
              <td>{item['Product Name']}</td>
              <td>{item.Quantity}</td>
              <td>{item.Price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );



  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="product-qty">
      {/* Best Selling Section */}
      <div
        className="best-selling"
        onClick={() => {
          openModal(
            "Best Selling Products",
            <h2 className='fw-bold mb-4' style={{ color: "green", fontSize: '16px' }}>These are the top-selling products in your inventory.</h2>,
            bestSellingProductsData
          );
        }}
        style={{ cursor: "pointer" }}
      >
        <div className="qty">
          <i className="bx bxs-spa"></i>
          <h6>{bestSellingCount}</h6>
        </div>
        <div>
          <h6>Best Selling</h6>
        </div>
      </div>

      {/* Modal */}
      <ModalStatistics
        show={isModalOpen}
        title={modalTitle}
        handleClose={closeModal}
      >
        <p className="text-start">{modalContent}</p>
        {/* Render table only when modal content has data */}
        {tableData.length > 0 && renderTable(tableData)}
      </ModalStatistics>

      {/* Other Sections */}
      <div
        className="unpopular"
        onClick={() =>
          openModal(
            "Unpopular Products",
            <h2 className='fw-bold mb-4' style={{ color: "green", fontSize: '16px' }}>Products with the least sales in your inventory.</h2>,
            nonSellingProductsData
          )
        }
        style={{ cursor: "pointer" }}
      >
        <div className="qty">
          <i className="bx bxs-spa"></i>
          <h6>{unpopularProducts ? unpopularProducts.length : 0}</h6>
        </div>
        <div>
          <h6>Unpopular</h6>
        </div>
      </div>

      <div
        className="totalItemsCount"
        onClick={() =>
          openModal(
            "Total Items",
            <h2 className='fw-bold mb-4' style={{ color: "green", fontSize: '16px' }}>Total number of haircare products that are available.</h2>,
            totalItemsCountData
          )
        }
        style={{ cursor: "pointer" }}
      >
        <div className="qty">
          <i className="bx bxs-spa"></i>
          <h6>{totalItemsCount}</h6>
        </div>
        <div>
          <h6>Total Products</h6>
        </div>
      </div>

      <div
        className="in-stock"
        onClick={() =>
          openModal(
            "In Stock",
            <h2 className='fw-bold mb-4' style={{ color: "green", fontSize: '16px' }}>These are the products currently in stock.</h2>,
            inStockCountData
          )
        }
        style={{ cursor: "pointer" }}
      >
        <div className="qty">
          <i className="bx bxs-spa"></i>
          <h6>{totalQuantity}</h6>
        </div>
        <div>
          <h6>In Stock</h6>
        </div>
      </div>

      <div
        className="low-stock"
        onClick={() =>
          openModal(
            "Low Stock",
            <h2 className='fw-bold mb-4' style={{ color: "green", fontSize: '16px' }}>Products that are running low in quantity.</h2>,
            lowStockCountData
          )
        }
        style={{ cursor: "pointer" }}
      >
        <div className="qty">
          <i className="bx bxs-spa"></i>
          <h6>{lowStockCount}</h6>
        </div>
        <div>
          <h6>Low Stock</h6>
        </div>
      </div>

      <div
        className="out-of-stock"
        onClick={() =>
          openModal(
            "Out of Stock",
            <h2 className='fw-bold mb-4' style={{ color: "green", fontSize: '16px' }}>These products are currently out of stock.</h2>,
            outOfStockCountData
          )
        }
        style={{ cursor: "pointer" }}
      >
        <div className="qty">
          <i className="bx bxs-spa"></i>
          <h6 className="text-dark">{outOfStockCount}</h6>
        </div>
        <div>
          <h6 className="text-dark">Out of Stock</h6>
        </div>
      </div>
    </div>
  );
};

export default ProductStatistics;
