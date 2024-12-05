import React, { useState, useEffect } from "react";
import {
  Button,
  // Modal,
  Form,
  // Table,
  Pagination,
  //Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import ToastNotification from "../../public/components/ToastNotification";

const BundleProductModal = () => {
  const [show, setShow] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customPrice, setCustomPrice] = useState(0);
  const [discount, setDiscount] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleClose = () => {
    setShow(false);
    setSelectedCategory(null);
    setSelectedProducts([]);
  };

  const handleShow = () => {
    fetchProducts();
    setShow(true);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ustp-eccom-server.vercel.app/api/products-no-bundle"
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const total = selectedProducts.reduce((acc, product) => {
      const discountedPrice =
        product.originalPrice - (product.originalPrice * discount) / 100;
      return acc + discountedPrice;
    }, 0);

    setCustomPrice(
      total.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedProducts, discount]);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const handleBundleSubmit = async (e) => {
    e.preventDefault();

    const discountedProducts = selectedProducts.map((product) => {
      const discountedPrice = (
        product.originalPrice -
        (product.originalPrice * discount) / 100
      );

      return {
        ...product,
        discountedPrice: discountedPrice,
      };
    });

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


  const handleProductSelection = (product) => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.some((p) => p.product_id === product.product_id)) {
        return prevSelected.filter((p) => p.product_id !== product.product_id);
      } else {
        const updatedProduct = { ...product, originalPrice: product.price };
        return [...prevSelected, updatedProduct];
      }
    });
  };


  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category_name === selectedCategory)
    : products;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prevSelected) => {
      const updatedSelected = prevSelected.filter(
        (product) => product.product_id !== productId
      );
      if (updatedSelected.length === 0) {
        setSelectedCategory(null);
      }
      return updatedSelected;
    });
  };

  const getDiscountedPrice = (product) => {
    const discountedPrice =
      product.originalPrice - (product.originalPrice * discount) / 100;
    return discountedPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleShow}
        style={{ backgroundColor: '#fb3d69', borderColor: 'white', color: '#fff' }}
      >
        {isMobile ? <i className="bx bxs-discount"></i> : 'Bundle A Product'}
      </Button>


      <div
        className={`modal fade ${show ? "show" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ display: show ? "block" : "none" }}
      >
        <div className="d-flex justify-content-center">
          <div
            className="modal-dialog-centered "
            role="document"
            style={{ width: "70vw" }}
          >
            <div className="modal-content">
              <div className="modal-header order-head">
                <h5 className="modal-title">
                  <i className="bx bxs-package"></i> Add Product Discounts for
                  Bundling
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

                <div className="container mt-3">
                  <form className="" onSubmit={handleBundleSubmit}>
                    {loading && (
                      <Spinner animation="border" variant="primary" />
                    )}
                    <div className="container">
                      <div className="container " style={{ height: "400px" }}>
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
                            {currentProducts.map((product) => (
                              <tr key={product.product_id}>
                                <td>
                                  <Form.Check
                                    type="checkbox"
                                    checked={selectedProducts.some(
                                      (p) => p.product_id === product.product_id
                                    )}
                                    onChange={() =>
                                      handleProductSelection(product)
                                    }
                                  />
                                </td>
                                <td>{product.product_name}</td>
                                <td>
                                  {product.price.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </td>
                                <td>{product.category_name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Pagination>
                        {[...Array(totalPages).keys()].map((page) => (
                          <Pagination.Item
                            key={page + 1}
                            active={page + 1 === currentPage}
                            onClick={() => handlePageChange(page + 1)}
                          >
                            {page + 1}
                          </Pagination.Item>
                        ))}
                      </Pagination>
                    </div>

                    <div className="container">
                      <div className="">
                        <div className=" borer ">
                          <div className=" my-2">
                            <div className="row  align-items-center">
                              <div className="col-4">
                                <h5 className="d-flex align-items-center">
                                  List of Selected Products
                                </h5>
                              </div>
                              <div className="col-2"></div>
                              <div className="col-3">
                                <div className="d-flex justify-content-end align-items-center text-right">
                                  <h5 className="text-right">Discount (%) :</h5>
                                </div>
                              </div>
                              <div className="col-3">
                                <div className="d-flex justify-content-end align-items-center">
                                  <Form.Group>
                                    <Form.Select
                                      value={discount}
                                      onChange={(e) =>
                                        setDiscount(e.target.value)
                                      }
                                      style={{ width: "200px" }}
                                    >
                                      <option value="">
                                        Select a discount
                                      </option>
                                      <option value="5">5%</option>
                                      <option value="10">10%</option>
                                      <option value="15">15%</option>
                                      <option value="20">20%</option>
                                    </Form.Select>
                                  </Form.Group>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <table className="table table-striped table-bordered">
                        <thead className="thead-dark">
                          <tr>
                            <th>Product Name</th>
                            <th>Original Price</th>
                            <th>Discounted Price</th>
                            <th>Category</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProducts.map((product) => (
                            <tr key={product.product_id}>
                              <td>{product.product_name}</td>
                              <td>
                                {product.originalPrice.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td>{getDiscountedPrice(product)}</td>
                              <td>{product.category_name}</td>
                              <td>
                                <Button
                                  variant="danger"
                                  onClick={() =>
                                    handleRemoveProduct(product.product_id)
                                  }
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <h5>Total Price: ₱{customPrice}</h5>

                      {/* Submit Button */}
                      <div className="form-group ">
                        <div className="col-sm-9 offset-sm-3">
                          <div className="d-flex justify-content-start mt-2">
                            <button
                              type="submit"
                              className="btn-lg btn-primary"
                              style={{ width: "410px" }}
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BundleProductModal;
