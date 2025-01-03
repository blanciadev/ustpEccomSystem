import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./modal.css";
import ToastNotification from "../../public/components/ToastNotification";

import { useLocation, useNavigate } from "react-router-dom";

import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";

const ProductModal = ({ isOpen, product, onAddToCart, onClose }) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [bundleProducts, setBundleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBundleProducts, setSelectedBundleProducts] = useState({});
  const [toastMessage, setToastMessage] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(3);

  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      setLoading(true);
      setError(null);

      const fetchRecommendations = fetch(
        `${process.env.REACT_APP_SERVER_LINK}/api/products-recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product_code: product.product_code }),
        }
      );

      const fetchBundles = fetch(
        `${process.env.REACT_APP_SERVER_LINK}/api/product-bundles`,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product_code: product.product_code }),
        }
      );

      Promise.allSettled([fetchRecommendations, fetchBundles])
        .then(async ([recommendationRes, bundleRes]) => {
          if (
            recommendationRes.status === "fulfilled" &&
            recommendationRes.value.ok
          ) {
            const recommendationData = await recommendationRes.value.json();
            setRecommendedProducts(recommendationData);
          } else {
            console.error(
              "Error fetching recommendations:",
              recommendationRes.reason
            );
            setError("Failed to load recommendations.");
          }

          if (bundleRes.status === "fulfilled" && bundleRes.value.ok) {
            const bundleData = await bundleRes.value.json();
            setBundleProducts(bundleData);

            const initialSelection = {};
            bundleData.forEach((bProduct) => {
              initialSelection[bProduct.product_code] = true;
            });
            setSelectedBundleProducts(initialSelection);
          } else {
            console.error("Error fetching bundles:", bundleRes.reason);
          }

          setLoading(false);
        })
        .catch((error) => {
          console.error("Unexpected error:", error);
          setError("Failed to load data.");
          setLoading(false);
        });
    }
  }, [product]);
  console.log("Recommended products:", recommendedProducts);
  const calculateDiscountedPrice = (price, discount) => {
    if (discount && discount > 0) {
      return price - (price * discount) / 100;
    }
    return price;
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const handleBuyNowBundle = () => {
    const token = localStorage.getItem("token");
    const selectedProducts = Object.entries(selectedBundleProducts)
      .filter(([_, value]) => value)
      .map(([key]) => {
        const bProduct = bundleProducts.find(
          (product) => product.product_code === key
        );

        if (!bProduct) {
          //console.log(`Product with code ${key} is not part of the bundle.`);
          return null;
        }

        return {
          ...bProduct,
          quantity: 1,
          discount: bProduct.discount || 0,
          original_price: bProduct.price,
          discounted_price: calculateDiscountedPrice(
            bProduct.price,
            bProduct.discount
          ),
        };
      })
      .filter(Boolean);

    const discounts = [
      ...new Set(
        selectedProducts.map((product) => product.discount).filter(Boolean)
      ),
    ];

    let applicableDiscount = product.product_discount || 0;

    if (discounts.length === 1) {
      applicableDiscount = discounts[0];
    }

    const originalProduct = {
      ...product,
      quantity: 1,
      discount: applicableDiscount,
      original_price: product.price,
      discounted_price: calculateDiscountedPrice(
        product.price,
        applicableDiscount
      ),
    };

    if (selectedProducts.length === 0 && originalProduct.discount <= 0) {
      alert("Please select at least one product from the bundle.");
      return;
    }

    if (
      !selectedProducts.some(
        (item) => item.product_code === originalProduct.product_code
      )
    ) {
      selectedProducts.push(originalProduct);
    }

    const unbundledProducts =
      JSON.parse(localStorage.getItem("unbundledProducts")) || [];
    unbundledProducts.forEach((product) => {
      const unbundledDiscount = product.product_discount || 0;
      const discountedPrice = calculateDiscountedPrice(
        product.price,
        unbundledDiscount
      );

      selectedProducts.push({
        ...product,
        quantity: 1,
        original_price: product.price,
        discount: unbundledDiscount,
        discounted_price: discountedPrice,
      });

      //console.log(`Unbundled Product: ${product.product_name}`);
      //console.log(`  Original Price: $${product.price}`);
      //console.log(`  Discount: ${unbundledDiscount}%`);
      //console.log(`  Discounted Price: $${discountedPrice}`);
    });

    const existingProducts =
      JSON.parse(localStorage.getItem("selectedProducts")) || [];
    existingProducts.push(...selectedProducts);

    localStorage.setItem("selectedProducts", JSON.stringify(existingProducts));

    if (token) {
      showToast("Redirecting to Checkout Page...");
      window.location.href = "/checkout";
    } else {
      localStorage.setItem("redirectTo", "/checkout");
      showToast("Redirecting to Login Page...");
      navigate("/login");
    }
  };

  const handleBuyNow = (product) => {
    const token = localStorage.getItem("token");
    const productData = {
      ...product,
      quantity,
    };

    if (!token) {
      const existingProducts =
        JSON.parse(localStorage.getItem("selectedProducts")) || [];
      existingProducts.push(productData);
      localStorage.setItem(
        "selectedProducts",
        JSON.stringify(existingProducts)
      );

      // Set the redirect to checkout after login
      localStorage.setItem("redirectTo", "/checkout");

      // Redirect to login page
      navigate("/login");
    } else {
      // User is logged in, proceed to save the selected product for checkout
      const existingProducts =
        JSON.parse(localStorage.getItem("selectedProducts")) || [];
      existingProducts.push(productData);
      localStorage.setItem(
        "selectedProducts",
        JSON.stringify(existingProducts)
      );

      showToast("Redirecting to Checkout Page...");
      window.location.href = "/checkout";
    }
  };

  // const indexOfLastProduct = currentPage * productsPerPage;
  // const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  // const currentRecommendedProducts = recommendedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleBundleProductSelect = (productCode) => {
    setSelectedBundleProducts((prevState) => ({
      ...prevState,
      [productCode]: !prevState[productCode],
    }));
  };

  const incrementQuantity = () => {
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity + 1;
      localStorage.setItem("quantity", newQuantity);
      return newQuantity;
    });
  };

  const decrementQuantity = () => {
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity > 1 ? prevQuantity - 1 : 1;
      localStorage.setItem("quantity", newQuantity);
      return newQuantity;
    });
  };

  const [isAddToCartHovered, setIsAddToCartHovered] = useState(false);
  const [isBuyNowHovered, setIsBuyNowHovered] = useState(false);

  if (!isOpen || !product) return null;

  return (
    <div className="promodal-overlay " onClick={onClose}>
      <div className="promodal-content" onClick={(e) => e.stopPropagation()}>
        <div className="promodal-body mt-4">
          <ToastNotification toastMessage={toastMessage} />

          <div className="container mt-2">
            <div
              className="row mt-4"
              style={{ border: "3px solid rgb(255, 114, 138)" }}
            >
              <div className="col-md-5 col-12 p-3">
                <div class="product-image">
                  <img
                    src={product.product_image}
                    alt=""
                    height="400"
                    width="300"
                  />
                  <div class="price-stock">
                    <p>
                      <strong>Price</strong>
                    </p>

                    <h3 className="" style={{ fontSize: "1.2rem" }}>
                      ₱{" "}
                      {calculateDiscountedPrice(
                        product.price,
                        product.product_discount
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h3>

                    <p>
                      <strong>Stocks</strong>
                    </p>
                    <p>{product.quantity}</p>
                  </div>
                </div>
              </div>

              <div className="col-md-7 col-12 p-3">
                <div class="product-info px-4 mb-4">
                  <p>HAIRCARE • {product.size}</p>
                  <br></br>
                  <h3>{product.product_name}</h3>
                  <p>
                    <strong>Description: </strong>
                    {product.description || "No description available."}
                  </p>

                  <br></br>
                  <div className="quantity">
                    <p>
                      <strong>Quantity</strong>
                    </p>
                    <div className="quantity-buttons">
                      <button onClick={decrementQuantity}>
                        <FaMinus class="text-dark" />
                      </button>
                      <input
                        type="text"
                        value={quantity}
                        class="text-center "
                        readOnly
                        style={{
                          width: "70px",
                          border: "1px solid gray",
                          outline: "none",
                          borderRadius: "0",
                        }}
                      />
                      <button onClick={incrementQuantity}>
                        <FaPlus class="text-dark" />
                      </button>
                    </div>
                  </div>
                  <div class="buttons">
                    {product.quantity > 0 ? (
                      <>
                        <button
                          className="add-to-cart-button px-10"
                          style={{
                            backgroundColor: isAddToCartHovered
                              ? "rgb(223, 95, 116)"
                              : "#d81c4b",
                            color: "white",
                          }}
                          onMouseEnter={() => setIsAddToCartHovered(true)}
                          onMouseLeave={() => setIsAddToCartHovered(false)}
                          onClick={() => onAddToCart(product)}
                        >
                          Add to cart
                        </button>

                        <button
                          className="buy-now-button px-10"
                          style={{
                            backgroundColor: isBuyNowHovered
                              ? "rgb(223, 95, 116)"
                              : "#d81c4b",
                            color: "white",
                          }}
                          onMouseEnter={() => setIsBuyNowHovered(true)}
                          onMouseLeave={() => setIsBuyNowHovered(false)}
                          onClick={() => handleBuyNow(product)}
                        >
                          Buy Now
                        </button>
                      </>
                    ) : (
                      <p
                        style={{
                          color: "red",
                          padding: "8px 15px",
                          border: "2px solid red",
                          borderRadius: "5px",
                          fontWeight: 600,
                        }}
                      >
                        SOLD OUT
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="promodal-close-btn">
            Close
          </button>

          {/* Bundle Section */}
          {bundleProducts.length > 0 && (
            <div
              className="justify-content-center"
              style={{ borderBottom: "3px solid pink" }}
            >
              <div className="">
                <h4 className="text-center">Available Bundle</h4>
                <p className="text-center">
                  Save money, avail discounted items!
                </p>
                <p className="text-center text-danger">
                  Select the items you want to buy.
                </p>

                <div className="container mt-4 ">
                  <div className="row justify-content-center gap-4">
                    {bundleProducts.map((bProduct) => (
                      <div
                        key={bProduct.product_code}
                        className={`bundle-card col-md-2 col-sm-6 mb-3 ${selectedBundleProducts[bProduct.product_code]
                          ? "selected"
                          : ""
                          }`}
                        style={{ minHeight: "290px" }}
                        onClick={() =>
                          handleBundleProductSelect(bProduct.product_code)
                        }
                      >
                        {/* Discount Badge */}
                        <div className="discount-badge">
                          <p style={{ fontSize: "1.2rem" }}>
                            {bProduct.discount}%
                          </p>
                          <p style={{ lineHeight: "0.5" }}>OFF</p>
                        </div>

                        <div className="d-flex justify-content-center mt-4">
                          <img
                            src={bProduct.product_image}
                            alt={bProduct.product_name}
                            className="modalproduct-image-bundle "
                          />
                        </div>

                        <div>
                          <div
                            className="container"
                            style={{ flex: 1, textAlign: "center" }}
                          >
                            <div
                              className="d-flex flex-column justify-content-between "
                              style={{ height: "240px" }}
                            >
                              {/* Div aligned to the start */}
                              <div className="align-items-start">
                                <label
                                  className="product-name"
                                  style={{ fontSize: "14px" }}
                                >
                                  {bProduct.product_name}
                                </label>
                              </div>

                              {/* Div aligned to the end */}
                              <div className="align-items-end mb-2">
                                <p className="product-price">
                                  ₱
                                  {calculateDiscountedPrice(
                                    bProduct.price,
                                    bProduct.discount
                                  ).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                                <p className="product-original-price">
                                  ₱
                                  {bProduct.price.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={
                            selectedBundleProducts[bProduct.product_code] ||
                            false
                          }
                          onChange={() =>
                            handleBundleProductSelect(bProduct.product_code)
                          }
                          style={{ display: "none" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-center mb-4">
                  <button onClick={handleBuyNowBundle} className="buy-now-btn">
                    Buy Selected Products Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          <div className="recommendations">
            <h4>Recommended Products</h4>
            {loading ? (
              <p>Loading recommendations...</p>
            ) : error ? (
              <p>{error}</p>
            ) : recommendedProducts.length > 0 ? (
              <div className="recommended-modalproducts-grid">
                {recommendedProducts
                  .filter((recProduct) => recProduct.quantity > 0)
                  .map((recProduct) => (
                    <div
                      key={recProduct.product_id}
                      className="modalproduct-card"

                      style={{ minHeight: "400px", border: "3px solid rgb(255, 114, 138)" }}
                    >
                      <img
                        src={recProduct.product_image}
                        alt={recProduct.product_name}
                        className="modalproduct-image"
                      />
                      <div className="modalproduct-details">
                        <div
                          className="d-flex flex-column justify-content-between"
                          style={{ height: "150px" }}
                        >
                          {/* Div aligned to the start */}
                          <div className="align-items-start">
                            <span className="modalproduct-name">
                              {recProduct.product_name}
                            </span>
                          </div>

                          <div className="align-items-end">
                            <h3
                              className="modalproduct-price "
                              style={{ fontSize: "1.2rem" }}
                            >
                              ₱{" "}
                              {calculateDiscountedPrice(
                                recProduct.price,
                                recProduct.product_discount
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </h3>

                            {recProduct.product_status === "Discounted" && (
                              <span className="modalproduct-discount">
                                Discounted by: {recProduct.product_discount}%
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          className="add-to-cart-button px-10"
                          style={{
                            backgroundColor: recProduct.isAddToCartHovered
                              ? "rgb(223, 95, 116)"
                              : "#d81c4b",
                            color: "white",
                          }}
                          onMouseEnter={() =>
                            setRecommendedProducts((prev) =>
                              prev.map((item) =>
                                item.product_id === recProduct.product_id
                                  ? { ...item, isAddToCartHovered: true }
                                  : item
                              )
                            )
                          }
                          onMouseLeave={() =>
                            setRecommendedProducts((prev) =>
                              prev.map((item) =>
                                item.product_id === recProduct.product_id
                                  ? { ...item, isAddToCartHovered: false }
                                  : item
                              )
                            )
                          }
                          onClick={() => {
                            const quantity = 1;
                            localStorage.setItem("quantity", quantity);
                            onAddToCart(recProduct);
                          }}
                        >
                          Add to cart
                        </button>

                        <button
                          className="buy-now-button px-10"
                          style={{
                            backgroundColor: recProduct.isBuyNowHovered
                              ? "rgb(223, 95, 116)"
                              : "#d81c4b",
                            color: "white",
                          }}
                          onMouseEnter={() =>
                            setRecommendedProducts((prev) =>
                              prev.map((item) =>
                                item.product_id === recProduct.product_id
                                  ? { ...item, isBuyNowHovered: true }
                                  : item
                              )
                            )
                          }
                          onMouseLeave={() =>
                            setRecommendedProducts((prev) =>
                              prev.map((item) =>
                                item.product_id === recProduct.product_id
                                  ? { ...item, isBuyNowHovered: false }
                                  : item
                              )
                            )
                          }
                          onClick={() => handleBuyNow(recProduct)}
                        >
                          Buy Now
                        </button>

                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p>No recommendations available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  product: PropTypes.object,
  onAddToCart: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProductModal;
