import React, { useState, useEffect } from "react";
import "./Transaction.css";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ToastNotification from "../../../public/components/ToastNotification";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const customerId = localStorage.getItem("customer_id");
  const authToken = localStorage.getItem("token");

  const globalDiscounts =
    JSON.parse(localStorage.getItem("globalDiscounts")) || [];

  const [discounts, setDiscounts] = useState([]);
  const savedProducts =
    JSON.parse(localStorage.getItem("selectedProducts")) || [];
  const [quantities, setQuantities] = useState(
    savedProducts.map((product) => product.quantity || 1)
  );
  const [originalQuantities, setOriginalQuantities] = useState([]);

  let effectiveGlobalDiscount = 0;

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    streetname: "",
    address: "",
    region: "",
    postalCode: "",
    paymentMethod: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchOriginalQuantities = async () => {
      try {
        const productData = await Promise.all(
          savedProducts.map((product) =>
            axios
              .get(
                `https://ustp-eccom-server.vercel.app/api//products-checkout/${product.product_code}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then((response) => response.data)
          )
        );

        console.log("CHECKOUT API TRIGGERED");

        const productQuantities = productData.map((item) => item.quantity);
        setOriginalQuantities(productQuantities);

        const productDiscounts = savedProducts.map(
          (product) => product.discount || 0
        );
        setDiscounts(productDiscounts);

        setHasFetched(true);
      } catch (error) {
        console.error("Error fetching quantities and discounts:", error);
      }
    };

    if (savedProducts.length > 0 && !hasFetched) {
      fetchOriginalQuantities();
    }

    const handleBeforeUnload = () => {
      localStorage.removeItem("selectedProducts");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [savedProducts, hasFetched]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePaymentChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      paymentMethod: e.target.value,
    }));
  };

  const handleQuantityChange = (index, e) => {
    const newQuantity = Math.max(1, Number(e.target.value));

    if (newQuantity > originalQuantities[index]) {
      setError(
        `Quantity exceeds available stock for ${savedProducts[index].product_name}. Available: ${originalQuantities[index]}`
      );
      return;
    }

    const newQuantities = [...quantities];
    newQuantities[index] = newQuantity;
    setQuantities(newQuantities);
    setError("");
  };

  const validateForm = () => {
    const { fullName, phoneNumber, streetname, address, region, postalCode } =
      formData;
    return (
      fullName && phoneNumber && streetname && address && region && postalCode
    );
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...savedProducts];
    const updatedQuantities = [...quantities];

    updatedProducts.splice(index, 1);
    updatedQuantities.splice(index, 1);

    setQuantities(updatedQuantities);
    localStorage.setItem("selectedProducts", JSON.stringify(updatedProducts));

    if (updatedProducts.length === 0) {
      localStorage.removeItem("selectedProducts");
      setToastMessage("Redirecting to Cart");
      setTimeout(() => {
        setToastMessage("");

        navigate("/cart");
      }, 3000);
    }

    setOriginalQuantities(updatedQuantities);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const customerId = localStorage.getItem("customer_id");
    const token = localStorage.getItem("token");

    // Redirect to login if token is missing
    if (!token) {
      localStorage.setItem("redirectTo", "/checkout");
      navigate("/login");
      return;
    }

    // Validate the form before proceeding
    if (!validateForm()) {
      setLoading(false);
      setError("All fields are required.");
      return;
    }

    // Check for customerId and selected products
    if (!customerId || savedProducts.length === 0) {
      setLoading(false);
      setError("Missing customer ID or no products selected.");
      return;
    }

    const totalOrderPrice = calculateTotalPrice().toFixed(2);

    const orderData = {
      customer_id: customerId,
      fullName: formData.fullName,
      order_details: savedProducts.map((product, index) => {
        const discountedPrice = product.price * (1 - discounts[index] / 100);
        const productTotal = discountedPrice * quantities[index];
        return {
          cart_items: product.cart_items_id,
          product_id: product.product_code,
          quantity: quantities[index],
          totalprice: productTotal.toFixed(2),
          payment_method: "COD",
          payment_status: "Pending",
        };
      }),
      total_price: totalOrderPrice,
      order_date: new Date().toISOString(),
      shipment_date: new Date().toISOString(),
      address: formData.address,
      streetname: formData.streetname,
      region: formData.region,
      shipment_status: "Pending",
      paymentMethod: formData.paymentMethod,
      phoneNumber: formData.phoneNumber,
      postalCode: formData.postalCode,
    };

    // Define the interaction payload
    const payload = {
      product_code: orderData.order_details.map((detail) => detail.product_id),
      customerId: customerId,
      interaction_type: "order",
    };

    console.log("Payload Entry:", payload);

    try {
      // Send order data to the server
      const response = await axios.post(
        "https://ustp-eccom-server.vercel.app/api//insert-order",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("checkoutOrderData", JSON.stringify(orderData));

      if (response.status === 201) {
        setSuccess("Order placed successfully!");
        localStorage.removeItem("selectedProducts");

        setToastMessage("Order Successful!");
        setTimeout(() => {
          setToastMessage("");
          navigate("/user/purchase");
        }, 3000);

        console.log("Toast should display T-T");

        await recordProductInteraction(payload);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const recordProductInteraction = async (payload) => {
    try {
      console.log("Recording product interaction:", payload);
      await axios.get("https://ustp-eccom-server.vercel.app/api//products-interaction", {
        params: payload,
      });
      console.log("Product interaction recorded successfully.");
    } catch (error) {
      console.error("Error recording product interaction:", error);
    }
  };

  const calculateTotalPrice = () => {
    const allValuesEqual = (array) =>
      array.length === 0 || array.every((value) => value === array[0]);

    const getEffectivePrice = (basePrice, discount) => {
      const discountMultiplier = 1 - (discount / 100 || 0);
      return basePrice * discountMultiplier;
    };

    if (savedProducts.length === 0) return 0;

    // console.log("----- Receipt -----");

    let totalCost = 0;
    const generalDiscount = allValuesEqual(globalDiscounts)
      ? globalDiscounts[0]
      : 0;
    const hasGeneralDiscount = generalDiscount > 0;
    // console.log("----- GENERAL DISCOUNT  -----");
    // console.log(effectiveGlobalDiscount);

    savedProducts.forEach((product, index) => {
      const quantity = quantities[index] || 0;
      let effectivePrice = 0;
      let discountApplied = 0;

      // console.log(hasGeneralDiscount);

      if (product.discounted_price) {
        discountApplied = allValuesEqual(globalDiscounts)
          ? globalDiscounts[0]
          : 0;
        effectivePrice = getEffectivePrice(
          product.discounted_price,
          discountApplied
        );

        // console.log(`Product: ${product.product_name} (Discounted)`);
      } else {
        discountApplied = hasGeneralDiscount ? generalDiscount : 0;
        effectivePrice = getEffectivePrice(product.price, discountApplied);

        // console.log(`Product: ${product.product_name} (Non-Bundled)`);
      }

      // console.log(`  Discount: ${discountApplied}%`);
      // console.log(`  Price per unit: $${effectivePrice.toFixed(2)}`);
      // console.log(`  Quantity: ${quantity}`);

      const totalForProduct = effectivePrice * quantity;
      totalCost += totalForProduct;

      // console.log(`  Total for ${product.product_name}: $${totalForProduct.toFixed(2)}`);

      // console.log("------------------------------");
    });

    const shippingCost = 150;
    const transactionTotal = totalCost + shippingCost;

    console.log(`Subtotal: $${totalCost.toFixed(2)}`);
    console.log(`Shipping: $${shippingCost.toFixed(2)}`);
    console.log(`Transaction Total: $${transactionTotal.toFixed(2)}`);
    console.log("----- End of Receipt -----");

    return transactionTotal;
  };

  const getDiscountedPrice = (price, discount) => {
    return price * (1 - discount / 100);
  };

  const formatPhoneNumber = (input) => {
    const formattedInput = input.replace(/\D/g, "");
    const phonePrefix = "+639";
    const mainNumber = formattedInput.slice(3);

    return mainNumber.length > 0
      ? `${phonePrefix} ${mainNumber.slice(0, 3)} ${mainNumber.slice(
        3,
        6
      )} ${mainNumber.slice(6, 9)}`
      : phonePrefix;
  };

  const handlePhoneNumberChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");

    if (!input.startsWith("09")) {
      input = "09" + input;
    }

    setFormData({ ...formData, phoneNumber: `${input}` });
  };

  const formatPhoneNumberOnBlur = () => {
    const formattedPhone = formatPhoneNumber(formData.phoneNumber);
    setFormData({ ...formData, phoneNumber: formattedPhone });
  };

  const handlePostalCodeChange = (e) => {
    const value = e.target.value;
    if (value.length <= 4) {
      setFormData({ ...formData, postalCode: value });
    }
  };

  return (
    <div className="checkout-container">
      <ToastNotification toastMessage={toastMessage} />
      <Navigation />
      <div className="checkout-wrapper">
        <h1>
          <i class="bx bxs-shopping-bag"></i>Checkout
        </h1>

        <div class="container">
          <div class="row">
            <div class="col-12 col-md-6 ">
              <div
                class="p-3 text-black text-start"
                style={{ border: "5px solid #f0cac8" }}
              >
                <div class="container">
                  <h2 class="mb-4">Delivery Information Form</h2>
                  <form onSubmit={handleSubmit}>
                    <div class="mb-2">
                      <label for="fullName" class="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="fullName"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        pattern="[A-Za-z\s]+"
                        title="Only letters and spaces are allowed (no special characters or numbers)"
                        aria-describedby="fullNameHelp"
                      />

                    </div>

                    <div className="mb-2">
                      <label htmlFor="phoneNumber" className="form-label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="Enter your phone number"
                        value={formData.phoneNumber}
                        onChange={handlePhoneNumberChange}
                        onBlur={formatPhoneNumberOnBlur}
                        maxLength="12"
                        required
                      />
                    </div>

                    <div class="mb-2">
                      <label for="streetname" class="form-label">
                        Street Name
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="streetname"
                        name="streetname"
                        placeholder="Enter your street name"
                        value={formData.streetname}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div class="mb-2">
                      <label for="address" class="form-label">
                        Address
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="address"
                        placeholder="Enter your address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div class="mb-2">
                      <label for="region" class="form-label">
                        Region
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="region"
                        placeholder="Enter your region"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label htmlFor="postalCode" className="form-label">
                        Postal Code
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="postalCode"
                        placeholder="Enter your postal code"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handlePostalCodeChange}
                        pattern="\d{4}"  // Restrict to exactly 4 digits
                        maxLength="4"    // Enforce 4 characters max
                        required
                        title="Postal code must be exactly 4 digits"
                      />

                    </div>

                    <div class="mb-2">
                      <h5>Payment Method</h5>
                      <label class="form-label" htmlFor="paymentMethod">
                        <input
                          type="radio"
                          name="paymentMethod"
                          //   checked={formData.paymentMethod === 'COD'}
                          onChange={handlePaymentChange}
                          checked
                          value="COD"
                        />
                        Cash on Delivery
                      </label>
                    </div>

                    <div class="d-grid">
                      <button
                        type="submit"
                        class="place-order-btn"
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Place Order"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div
                class="p-3 text-white text-center"
                style={{ backgroundColor: "#f0cac8" }}
              >
                <h3 class="fw-bold text-dark">Order Summary</h3>

                {savedProducts.map((product, index) => {
                  const effectiveDiscount = product.discount || 0;
                  const discountedPrice = getDiscountedPrice(
                    product.price,
                    effectiveDiscount
                  );
                  const total = discountedPrice * quantities[index];
                  effectiveGlobalDiscount = effectiveDiscount;
                  console.log(
                    "GLOBAL EFFECTIVE DISCOUNT : " + effectiveGlobalDiscount
                  );
                  console.log("Saved Products data", savedProducts);

                  return (
                    <div class="container my-1" key={index}>
                      <div
                        class="card p-3"
                        style={{ backgroundColor: "white" }}
                      >
                        <div class="row align-items-start">
                          <div className="col-md-3 text-start align-items-center">
                            <img
                              src={
                                product.product_image ||
                                "https://via.placeholder.com/150"
                              }
                              alt={product.product_name || "Product Image"}
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.target.onerror = null; // Prevents infinite loop
                                e.target.src =
                                  "https://via.placeholder.com/150";
                              }}
                            />
                          </div>

                          <div class="col-md-9">
                            <p class="text-start mb-1">
                              {product.product_name}
                            </p>

                            <div class="d-flex justify-content-between align-content-center">
                              <div className="row">
                                <div className="col border">
                                  <p
                                    className={`mb-1 ${effectiveDiscount > 0
                                      ? "text-decoration-line-through text-muted"
                                      : ""
                                      }`}
                                  >
                                    Original Price: ₱
                                    {product.price.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                                <div className="col border">
                                  <span class="text-danger">
                                    ₱
                                    {total.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>

                                {/* Discounted Price column */}
                                {effectiveDiscount > 0 && (
                                  <div className="col-12 border">
                                    <p className="mb-2 text-success fw-bold">
                                      Discounted Price: ₱
                                      {discountedPrice.toFixed(2)} at{" "}
                                      {effectiveDiscount}% Off
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div class="d-flex align-items-center">
                              <input
                                type="number"
                                class="text-center"
                                min="1"
                                value={quantities[index]}
                                onChange={(e) => handleQuantityChange(index, e)}
                                style={{ maxWidth: "100px", maxHeight: "30px" }}
                              />
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRemoveProduct(index)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div
                  className="total-price mx-4"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
                    marginBottom: "0",
                    fontSize: "1.2em",
                    fontWeight: "bold",
                  }}
                >
                  <span class="text-dark">Shipping Fee:</span>
                  <span class="text-danger">₱150.00</span>
                </div>

                <hr class="text-danger"></hr>

                <div
                  className="total-price mx-4"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
                    fontSize: "1.2em",
                    fontWeight: "bold",
                  }}
                >
                  <span class="text-dark">Total Price:</span>
                  <span class="text-danger">
                    ₱
                    {calculateTotalPrice().toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
