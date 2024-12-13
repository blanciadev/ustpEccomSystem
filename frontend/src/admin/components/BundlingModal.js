import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ToastNotification from "../../public/components/ToastNotification";
import axios from "axios"; // Ensure axios is imported
import "./BundlingModal.css";

const BundlingModal = ({ show, handleClose, handleSubmit }) => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");  // Track selected category
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
  const [discount, setDiscount] = useState(""); // State for discount

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "https://ustp-eccom-server.vercel.app/api/product-category"
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

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://ustp-eccom-server.vercel.app/api/products-no-bundle"
        );
        const fetchedProducts = response.data;

        // Categorize products into bundleable and non-bundleable
        const bundleable = fetchedProducts.filter(product => product.bundle_status === 'Bundleable');
        const nonBundleable = fetchedProducts.filter(product => product.bundle_status === 'Non-Bundleable');

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
    fetchProducts();
  }, []);

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setCategory(selectedCategory);

    // Filter products based on the selected category
    if (selectedCategory) {
      const filteredProducts = products.filter(product =>
        product.category_id.toString() === selectedCategory.toString()
      );

      const bundleable = filteredProducts.filter(product => product.bundle_status === 'Bundleable');
      const nonBundleable = filteredProducts.filter(product => product.bundle_status === 'Non-Bundleable');

      setBundleableProducts(bundleable);
      setNonBundleableProducts(nonBundleable);
    } else {
      setBundleableProducts(products.filter(product => product.bundle_status === 'Bundleable'));
      setNonBundleableProducts(products.filter(product => product.bundle_status === 'Non-Bundleable'));
    }
  };

  const handleProductSelect = (product) => {
    // Add or remove product from the selected products list
    setSelectedProducts((prevSelected) => {
      if (prevSelected.some((p) => p.product_id === product.product_id)) {
        return prevSelected.filter((p) => p.product_id !== product.product_id);
      }
      return [...prevSelected, product];
    });
  };

  const getDiscountedPrice = (product) => {
    if (discount) {
      const discountedPrice = (
        product.price - (product.price * discount) / 100
      ).toFixed(2);
      return discountedPrice;
    }
    return product.price;
  };

  const handleBundleSubmit = async (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      setError("Please select at least one product to bundle.");
      return;
    }

    if (!discount) {
      setError("Please select a discount.");
      return;
    }

    const discountedProducts = selectedProducts.map((product) => ({
      ...product,
      discountedPrice: getDiscountedPrice(product), // Add discounted price to each product
    }));

    const bundleData = {
      selectedProducts: discountedProducts,
      discount,
    };

    setLoading(true);

    try {
      await axios.post("https://ustp-eccom-server.vercel.app/api/bundles", bundleData);
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
        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div className="modal-content border border-danger">
            <div className="modal-header order-head">
              <h5 className="modal-title">
                <i className="bx bxs-package"></i> Bundling Products Sellable and Non-sellable
              </h5>
              <button type="button" className="close" onClick={handleClose} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <ToastNotification toastMessage={toastMessage} />
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="container mt-4">
                <div>
                  <select
                    className="form-select form-select-sm"
                    value={category}
                    onChange={handleCategoryChange}
                  >
                    <option value="">Select category to bundle</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  <div className="col-auto border">
                    <h6>Sellable Items</h6>
                    <table className="table table-striped table-bordered">
                      <thead className="thead-dark">
                        <tr>
                          <th style={{ width: "15%" }}></th>
                          <th style={{ width: "50%" }}>Product Name</th>
                          <th style={{ width: "15%" }}>Price</th>
                          <th style={{ width: "20%" }}>Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bundleableProducts.length === 0 ? (
                          <tr><td colSpan="4">No sellable products available.</td></tr>
                        ) : (
                          bundleableProducts.map((product) => (
                            <tr key={product.product_id}>
                              <td>
                                <input
                                  type="checkbox"
                                  onChange={() => handleProductSelect(product)}
                                />
                              </td>
                              <td>{product.product_name}</td>
                              <td>{product.price}</td>
                              <td>{product.category_name}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="col-auto border">
                    <h6>Non-Sellable Items</h6>
                    <table className="table table-striped table-bordered">
                      <thead className="thead-dark">
                        <tr>
                          <th style={{ width: "15%" }}></th>
                          <th style={{ width: "50%" }}>Product Name</th>
                          <th style={{ width: "15%" }}>Price</th>
                          <th style={{ width: "20%" }}>Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nonBundleableProducts.length === 0 ? (
                          <tr><td colSpan="4">No non-sellable products available.</td></tr>
                        ) : (
                          nonBundleableProducts.map((product) => (
                            <tr key={product.product_id}>
                              <td>
                                <input
                                  type="checkbox"
                                  onChange={() => handleProductSelect(product)}
                                />
                              </td>
                              <td>{product.product_name}</td>
                              <td>{product.price}</td>
                              <td>{product.category_name}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="d-flex justify-content-end align-items-center">
                  <Form.Group>
                    <Form.Select value={discount} onChange={(e) => setDiscount(e.target.value)}>
                      <option value="">Select a discount</option>
                      <option value="5">5%</option>
                      <option value="10">10%</option>
                      <option value="15">15%</option>
                      <option value="20">20%</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              <div className="d-flex justify-content-start mt-2">
                <button
                  type="submit"
                  className="btn-lg btn-primary"
                  style={{ width: "410px" }}
                  onClick={handleBundleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};






export default BundlingModal;
