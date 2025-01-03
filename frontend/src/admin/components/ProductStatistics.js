import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalStatistics from "./ModalStatistics"; // Import the Modal component

const ProductStatistics = () => {
  const [bestSellingProductsData, setBestSellingProductsData] = useState([]);
  const [nonSellingProductsData, setNonSellingProductsData] = useState([]);
  const [totalItemsCountData, setTotalItemsCountData] = useState([]);
  const [inStockProducts, setInStockProducts] = useState([]); // Store in-stock products
  const [inStockTotal, setInStockTotal] = useState(0); // Store total quantity for in-stock products
  const [lowStockCountData, setLowStockCountData] = useState([]);
  const [outOfStockCountData, setOutOfStockCountData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalproductqty, setTotalProductQty] = useState(0);
  //let totalproductqty = 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          bestSellingRes,
          nonSellingRes,
          totalItemsRes,
          inStockRes,
          lowStockRes,
          outOfStockRes,
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_SERVER_LINK}/api/sellable-items`),
          axios.get(`${process.env.REACT_APP_SERVER_LINK}/api/non-sellable-items`),
          axios.get(`${process.env.REACT_APP_SERVER_LINK}/api/total-items-count`),
          axios.get(`${process.env.REACT_APP_SERVER_LINK}/api/in-stock-count`),
          axios.get(`${process.env.REACT_APP_SERVER_LINK}/api/low-stock-count`),
          axios.get(`${process.env.REACT_APP_SERVER_LINK}/api/out-of-stock-count`),
        ]);

        setBestSellingProductsData(bestSellingRes.data || []);
        setNonSellingProductsData(nonSellingRes.data || []);
        setTotalItemsCountData(totalItemsRes.data.products || []);
        setInStockProducts(inStockRes.data.products || []);
        setInStockTotal(inStockRes.data.totalQuantity || 0);

        // Properly update the total product quantity state
        setTotalProductQty(inStockRes.data.totalQuantity || 0);  // Correctly store totalQuantity

        setLowStockCountData(lowStockRes.data || []);
        setOutOfStockCountData(outOfStockRes.data || []);
      } catch (err) {
        setError("Failed to fetch product statistics.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const openModal = (title, content, data) => {
    setModalTitle(title);
    setModalContent(content);
    setTableData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalTitle("");
    setModalContent("");
    setTableData([]);
  };

  useEffect(() => {
    console.log("Total Product Quantity:", totalproductqty);
  }, [totalproductqty]);



  const renderTable = (data) => (
    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
      <table
        className="table table-striped table-bordered table-hover"
        style={{
          fontSize: "14px",
          position: "relative",
          borderCollapse: "collapse",
        }}
      >
        <thead
          className="bg-pink text-white"
          style={{ position: "sticky", top: 0, zIndex: 1 }}
        >
          <tr>
            <th>#</th>
            <th>Product Code</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item["Product Code"]}</td>
              <td>{item["Product Name"]}</td>
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
      {[
        {
          label: "Best Selling",
          count: bestSellingProductsData.length,
          data: bestSellingProductsData,
          description: (
            <h2 className="fw-bold mb-4" style={{ color: "green", fontSize: "16px" }}>
              These are the top-selling products in your inventory.
            </h2>
          ),
        },
        {
          label: "Unpopular",
          count: nonSellingProductsData.length,
          data: nonSellingProductsData,
          description: (
            <h2 className="fw-bold mb-4" style={{ color: "green", fontSize: "16px" }}>
              Products with the least sales in your inventory.
            </h2>
          ),
        },
        {
          label: "Total Products",
          count: totalproductqty,
          data: totalItemsCountData,
          description: (
            <h2 className="fw-bold mb-4" style={{ color: "green", fontSize: "16px" }}>
              Total number of products in your inventory.
            </h2>
          ),
        },
        {
          label: "In Stock",
          count: inStockProducts.length,
          data: inStockProducts,
          description: (
            <h2 className="fw-bold mb-4" style={{ color: "green", fontSize: "16px" }}>
              These are the products currently in stock.
              <br />
              <strong>Total Quantity:</strong> {parseInt(inStockTotal, 10).toLocaleString()}
            </h2>
          ),
        },

        {
          label: "Low Stock",
          count: lowStockCountData.length,
          data: lowStockCountData,
          description: (
            <h2 className="fw-bold mb-4" style={{ color: "green", fontSize: "16px" }}>
              Products that are running low in quantity.
            </h2>
          ),
        },
        {
          label: "Out of Stock",
          count: outOfStockCountData.length,
          data: outOfStockCountData,
          description: (
            <h2 className="fw-bold mb-4" style={{ color: "green", fontSize: "16px" }}>
              These products are currently out of stock.
            </h2>
          ),
        },
      ].map(({ label, count, data, description }, index) => (
        <div
          key={index}
          className={label.toLowerCase().replace(" ", "-")}
          onClick={() => openModal(label, description, data)}
          style={{ cursor: "pointer" }}
        >
          <div className="qty">
            <i className="bx bxs-spa"></i>
            <h6>{count}</h6>
          </div>
          <div>
            <h6>{label}</h6>
          </div>
        </div>
      ))}

      {/* Modal */}
      <ModalStatistics
        show={isModalOpen}
        title={modalTitle}
        handleClose={closeModal}
      >
        <p className="text-start">{modalContent}</p>
        {tableData.length > 0 && renderTable(tableData)}
      </ModalStatistics>
    </div>
  );
};

export default ProductStatistics;
