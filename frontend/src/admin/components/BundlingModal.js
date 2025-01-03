import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ToastNotification from "../../public/components/ToastNotification";
import axios from "axios"; // Ensure axios is imported
import "./BundlingModal.css";

const BundlingModal = ({ isOpen, onClose, show, handleClose }) => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(""); // Track selected category
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [size, setSize] = useState("500");
  const [customSize, setCustomSize] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [bundleableProducts, setBundleableProducts] = useState([]);
  const [nonBundleableProducts, setNonBundleableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]); // State for selected products for bundling
  const [bundledProducts, setBundledProducts] = useState([]);
  const [discount, setDiscount] = useState(""); // State for discount

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_LINK}/api/product-category`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories.");
      }
    };

    const fetchSellableAndUnpopular = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_LINK}api/bundle-sellable-and-unpopular`
        );
        const fetchedProducts = response.data;

        // Categorize products into bundleable and non-bundleable
        const bundleable = fetchedProducts.filter(
          (product) => product.Label === "Sellable"
        );
        const nonBundleable = fetchedProducts.filter(
          (product) => product.Label === "Unpopular"
        );

        setBundleableProducts(bundleable);
        setNonBundleableProducts(nonBundleable);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchSellableAndUnpopular();
  }, []);

  //   const fetchProducts = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await axios.get(
  //         "https://ustp-eccom-server.vercel.app/api/products-no-bundle"
  //       );
  //       const fetchedProducts = response.data;

  //       // Categorize products into bundleable and non-bundleable
  //       const bundleable = fetchedProducts.filter(
  //         (product) => product.bundle_status === "Bundleable"
  //       );
  //       const nonBundleable = fetchedProducts.filter(
  //         (product) => product.bundle_status === "Non-Bundleable"
  //       );

  //       setBundleableProducts(bundleable);
  //       setNonBundleableProducts(nonBundleable);
  //       setProducts(fetchedProducts);
  //     } catch (error) {
  //       console.error("Error fetching products:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCategories();
  //   fetchProducts();
  // }, []);

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setCategory(selectedCategory);

    // Filter products based on the selected category
    if (selectedCategory) {
      const filteredProducts = products.filter(
        (product) =>
          product.category_id.toString() === selectedCategory.toString()
      );

      const bundleable = filteredProducts.filter(
        (product) => product.Label === "Sellable"
      );
      const nonBundleable = filteredProducts.filter(
        (product) => product.Label === "Unpopular"
      );

      setBundleableProducts(bundleable);
      setNonBundleableProducts(nonBundleable);
    } else {
      setBundleableProducts(
        products.filter((product) => product.Label === "Sellable")
      );
      setNonBundleableProducts(
        products.filter((product) => product.Label === "Unpopular")
      );
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProducts(
      (prev) =>
        prev.some((item) => item.product_id === product.product_id)
          ? prev.filter((item) => item.product_id !== product.product_id) // Uncheck
          : [...prev, product] // Add to selected
    );
  };

  const handleBundleSelectedItems = () => {
    setBundledProducts((prev) => [...prev, ...selectedProducts]);
    setSelectedProducts([]); // Clear the selected products after bundling
  };

  const getDiscountedPrice = (product) => {
    if (discount) {
      const discountedPrice = (
        product.price -
        (product.price * discount) / 100
      ).toFixed(2);
      return discountedPrice;
    }
    return product.price;
  };

  const handleBundleSubmit = async (e) => {
    e.preventDefault();

    if (bundledProducts.length === 0) {
      setError("Please select at least one product to bundle.");
      return;
    }

    if (!discount) {
      setError("Please select a discount.");
      return;
    }

    const discountedProducts = bundledProducts.map((product) => ({
      ...product,
      discountedPrice: getDiscountedPrice(product), // Add discounted price to each product
    }));

    const bundleData = {
      bundledProducts: discountedProducts,
      discount,
    };

    setLoading(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_LINK}api/bundles`,
        bundleData
      );
      setToastMessage("Bundle Created!");
      setTimeout(() => {
        setToastMessage("");
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error creating bundle:", error);
      setToastMessage("Error Occurred!");
      setTimeout(() => {
        setToastMessage("");
        handleClose();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`modal fade ${show ? "show" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ display: show ? "block" : "none" }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
          style={{ maxWidth: "1400px" }} // Added this line to set the width
        >
          <div className="modal-content border border-danger">
            <div className="modal-header order-head">
              <h5 className="modal-title">
                <i className="bx bxs-package"></i> Bundling Sellable and
                Non-sellable Products
              </h5>
              <button
                type="button"
                className="close"
                onClick={handleClose}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <ToastNotification toastMessage={toastMessage} />
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="container mt-4 ">
                <div
                  className=""
                  style={{ width: "100%", border: "3px solid pink" }}
                >
                  <div className="d-flex justify-content-between align-items-center mt-4 mx-4">
                    <h6 className="fw-bold me-4" style={{ fontSize: "16px" }}>
                      Select Category
                    </h6>
                    <select
                      className="form-select form-select-md"
                      value={category}
                      onChange={handleCategoryChange}
                    >
                      <option value="">Select category to bundle</option>
                      {categories.map((category) => (
                        <option
                          key={category.category_id}
                          value={category.category_id}
                        >
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div class="container text-center mt-4 py-4">
                    <div class="row align-items-start gap-2 mb-4">
                      <div className="col">
                        <h6 className="fw-bold" style={{ fontSize: "16px" }}>
                          Sellable Items
                        </h6>
                        <h6
                          className="text-danger"
                          style={{ fontSize: "14px" }}
                        >
                          *These are frequently bought haircare products.
                        </h6>
                        <div
                          style={{
                            height: "200px",
                            overflowY: "auto",
                            position: "relative",
                            border: "1px solid black",
                          }}
                        >
                          <table
                            className="table table-striped table-bordered"
                            style={{ position: "relative", fontSize: "12px" }}
                          >
                            <thead
                              className="thead-dark"
                              style={{
                                position: "sticky",
                                top: "0",
                                zIndex: "1",
                              }}
                            >
                              <tr>
                                <th style={{ width: "5%" }}></th>
                                <th style={{ width: "10%" }}>Code</th>
                                <th style={{ width: "40%" }}>Product Name</th>
                                <th style={{ width: "15%" }}>Current Qty</th>
                                <th style={{ width: "15%" }}>Qty Sold</th>
                                <th style={{ width: "15%" }}>Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {category === "" ? (
                                <tr>
                                  <td
                                    className="text-danger text-center"
                                    colSpan="6"
                                  >
                                    Please select a category.
                                  </td>
                                </tr>
                              ) : bundleableProducts.length === 0 ? (
                                <tr>
                                  <td className="text-danger" colSpan="6">
                                    No sellable products available.
                                  </td>
                                </tr>
                              ) : (
                                bundleableProducts.map((product) => (
                                  <tr
                                    key={product.product_id}
                                    className={
                                      product.product_status === "Discounted"
                                        ? "highlight-row"
                                        : ""
                                    }
                                  >
                                    <td>
                                      <input
                                        type="checkbox"
                                        checked={selectedProducts.some(
                                          (item) =>
                                            item.product_id ===
                                            product.product_id
                                        )}
                                        onChange={() =>
                                          handleProductSelect(product)
                                        }
                                      />
                                    </td>
                                    <td>{product.product_code}</td>
                                    <td>
                                      {product.product_name}
                                      {product.product_status === "Bundled" && (
                                        <span
                                          style={{
                                            marginLeft: "8px",
                                            padding: "2px 8px",
                                            backgroundColor: "#ffeb3b",
                                            color: "#000",
                                            borderRadius: "4px",
                                            fontSize: "10px",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          Bundled!
                                        </span>
                                      )}
                                    </td>
                                    <td>{product.quantity}</td>
                                    <td>{product.quantity_sold}</td>
                                    <td>{product.price}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>

                          <div
                            style={{
                              position: "absolute",
                              right: "0",
                              top: "0",
                              width: "8px",
                              height: "100%",
                              background: "rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                background: "rgba(0, 0, 0, 0.4)",
                                height: "200px",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col">
                        <h6 className="fw-bold" style={{ fontSize: "16px" }}>
                          Non-Sellable Items
                        </h6>
                        <h6
                          className="text-danger"
                          style={{ fontSize: "14px" }}
                        >
                          *These are not frequently bought haircare products.
                        </h6>
                        <div
                          style={{
                            height: "200px",
                            overflowY: "auto",
                            position: "relative",
                            border: "1px solid black",
                          }}
                        >
                          <table
                            className="table table-striped table-bordered"
                            style={{ position: "relative", fontSize: "12px" }}
                          >
                            <thead
                              className="thead-dark"
                              style={{
                                position: "sticky",
                                top: "0",
                                zIndex: "1",
                              }}
                            >
                              <tr>
                                <th style={{ width: "5%" }}></th>
                                <th style={{ width: "10%" }}>Code</th>
                                <th style={{ width: "40%" }}>Product Name</th>
                                <th style={{ width: "15%" }}>Current Qty</th>
                                <th style={{ width: "15%" }}>Qty Sold</th>
                                <th style={{ width: "15%" }}>Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {category === "" ? (
                                <tr>
                                  <td
                                    className="text-danger text-center"
                                    colSpan="6"
                                  >
                                    Please select a category.
                                  </td>
                                </tr>
                              ) : nonBundleableProducts.length === 0 ? (
                                <tr>
                                  <td className="text-danger" colSpan="6">
                                    No non-sellable products available.
                                  </td>
                                </tr>
                              ) : (
                                nonBundleableProducts.map((product) => (
                                  <tr key={product.product_id}>
                                    <td>
                                      <input
                                        type="checkbox"
                                        checked={selectedProducts.some(
                                          (item) =>
                                            item.product_id ===
                                            product.product_id
                                        )}
                                        onChange={() =>
                                          handleProductSelect(product)
                                        }
                                      />
                                    </td>
                                    <td>{product.product_code}</td>
                                    <td>
                                      {product.product_name}
                                      {product.product_status === "Bundled" && (
                                        <span
                                          style={{
                                            marginLeft: "8px",
                                            padding: "2px 8px",
                                            backgroundColor: "#ffeb3b",
                                            color: "#000",
                                            borderRadius: "4px",
                                            fontSize: "10px",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          Bundled!
                                        </span>
                                      )}
                                    </td>
                                    <td>{product.quantity}</td>
                                    <td>{product.quantity_sold}</td>
                                    <td>{product.price}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                          <div
                            style={{
                              position: "absolute",
                              right: "0",
                              top: "0",
                              width: "8px",
                              height: "100%",
                              background: "rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                background: "rgba(0, 0, 0, 0.4)",
                                height: "200px",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={handleBundleSelectedItems}
                      style={{ width: "410px" }}
                      disabled={selectedProducts.length === 0}
                    >
                      Bundle Selected Items
                    </button>
                  </div>
                </div>

                <div className="container border mt-4 ">
                  <div className="d-flex justify-content-start align-items-center mt-4 mx-4">
                    <h6 className="fw-bold me-4" style={{ fontSize: "16px" }}>
                      Select Discount
                    </h6>
                    <Form.Group>
                      <Form.Select
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                      >
                        <option value="">
                          Select a discount for the bundle
                        </option>
                        <option value="5">5%</option>
                        <option value="10">10%</option>
                        <option value="15">15%</option>
                        <option value="20">20%</option>
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="container mt-4">
                    <div>
                      <table
                        className="table table-striped table-bordered"
                        style={{ fontSize: "12px" }}
                      >
                        <thead
                          className="thead-dark"
                          style={{ position: "sticky", top: "0", zIndex: "1" }}
                        >
                          <tr>
                            <th style={{ width: "10%" }}>Code</th>
                            <th style={{ width: "40%" }}>Product Name</th>
                            <th style={{ width: "15%" }}>Current Qty</th>
                            <th style={{ width: "15%" }}>Qty Sold</th>
                            <th style={{ width: "15%" }}>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bundledProducts.map((product) => (
                            <tr key={product.product_id}>
                              <td>{product.product_code}</td>
                              <td>{product.product_name}</td>
                              <td>{product.quantity}</td>
                              <td>{product.quantity_sold}</td>
                              <td>{product.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="d-flex justify-content-center mt-2">
                        {/* Submit Button */}
                        <button
                          className="btn btn-success"
                          type="submit"
                          style={{ width: "410px" }}
                          onClick={handleBundleSubmit}
                          disabled={loading || bundledProducts.length === 0}
                        >
                          {loading ? "Submitting..." : "Submit"}
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
    </>
  );
};

export default BundlingModal;
