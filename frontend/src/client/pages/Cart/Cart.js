import React, { useEffect, useState } from "react";
import "./Cart2.css";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import CartProduct from "../../components/CartProduct";
import cartEventEmitter from "../../components/cartEventEmitter";
import { useNavigate } from "react-router-dom";
import ToastNotification from "../../../public/components/ToastNotification";
import axios from "axios";

const CartContent = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        if (isLoggedIn) {
          const response = await fetch("https://ustp-eccom-server.vercel.app/api/cart", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          const data = await response.json();

          if (response.ok) {
            setCartItems(data.items);
          } else {
            setError(data.message || "Failed to fetch cart items");
          }
        } else {
          const localCart = JSON.parse(localStorage.getItem("cart")) || [];
          const productCodes = localCart.map((item) => item.product_code);

          // Query the backend with product codes
          const productDetailsResponse = await fetch(
            "https://ustp-eccom-server.vercel.app/api/products-img",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ product_codes: productCodes }),
            }
          );

          const productDetails = await productDetailsResponse.json();

          if (productDetailsResponse.ok) {
            // Merge product images with the localCart items
            const updatedCart = localCart.map((item) => {
              const productDetail = productDetails.find(
                (prod) => prod.product_code === item.product_code
              );
              return {
                ...item,
                product_image: productDetail ? productDetail.product_image : null,
              };
            });

            setCartItems(updatedCart);
          } else {
            setError("Failed to fetch product details");
          }
        }
      } catch (err) {
        setError("Error fetching cart items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [isLoggedIn]);

  useEffect(() => {
    setTotalPrice(computeTotalPrice());
  }, [selectedItems, cartItems]);



  const handleSelectAll = (selectAll) => {
    const newSelection = {};
    cartItems.forEach((item) => {
      newSelection[item.product_code] = selectAll;
    });
    setSelectedItems(newSelection);
  };

  useEffect(() => {
    const handleToggleSelectAll = (selectAll) => {
      handleSelectAll(selectAll);
    };

    cartEventEmitter.on("toggleSelectAll", handleToggleSelectAll);

    return () => {
      cartEventEmitter.off("toggleSelectAll", handleToggleSelectAll);
    };
  }, [cartItems]);

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");

    // Get selected products based on selection
    const selectedProducts = cartItems.filter(
      (item) => selectedItems[item.product_code]
    );

    if (selectedProducts.length === 0) {
      alert("Please select at least one product to proceed to checkout.");
      return;
    }

    try {
      // Update product details, including `sub_total`
      const updatedProducts = await Promise.all(
        selectedProducts.map(async (product) => {
          try {
            const response = await axios.get(
              `https://ustp-eccom-server.vercel.app/api/products-checkout/${product.product_code}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const productDetails = response.data;

            // Return updated product with `sub_total` included
            return {
              ...product,
              product_image: productDetails.product_image || product.product_image,
              quantity: product.quantity,
              price: product.price, // Ensure price is included
              sub_total: product.price * product.quantity, // Calculate `sub_total`
            };
          } catch (error) {
            console.error(
              `Error fetching product image for product code ${product.product_code}:`,
              error
            );
            return product;
          }
        })
      );

      localStorage.setItem("selectedProducts", JSON.stringify(updatedProducts));

      if (!token) {
        localStorage.setItem("redirectTo", "/checkout");
        navigate("/login");
      } else {
        navigate("/checkout", {
          state: { selectedProducts: updatedProducts, totalPrice },
        });
      }
    } catch (error) {
      alert("There was an error retrieving product details. Please try again.");
    }
  };


  const updateCartQuantity = (cartItemId, newQuantity) => {
    const updatedItems = cartItems.map(item => {
      if (item.cart_items_id === cartItemId) {
        const updatedItem = {
          ...item,
          quantity: newQuantity,
          sub_total: item.price * newQuantity,
        };
        return updatedItem;
      }
      return item;
    });

    setCartItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems));
  };

  const computeTotalPrice = () => {
    let total = 0;

    cartItems.forEach(item => {
      if (selectedItems[item.product_code]) {
        total += item.sub_total;
      }
    });

    return total;
  };

  const toggleItemSelection = (productCode) => {
    setSelectedItems((prevSelected) => ({
      ...prevSelected,
      [productCode]: !prevSelected[productCode],
    }));
  };



  const removeFromCart = async (cartItemId) => {
    try {
      if (isLoggedIn) {
        const response = await fetch(
          `https://ustp-eccom-server.vercel.app/api/cart-delete/${cartItemId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setToastMessage("Deleted!");

        setTimeout(() => {
          setToastMessage("");
        }, 3000);

        if (!response.ok) {
          throw new Error("Failed to remove item from cart");
        }
      }

      setCartItems(
        cartItems.filter((item) => item.cart_items_id !== cartItemId)
      );
      const updatedCart = cartItems.filter(
        (item) => item.cart_items_id !== cartItemId
      );
      setCartItems(updatedCart);

      if (!isLoggedIn) {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }
    } catch (err) {
      setError("Error removing item. Please try again later.");
    }
  };

  return (
    <div className="cart ">
      <Navigation />
      <ToastNotification toastMessage={toastMessage} />
      <div className="cart__box">
        <h1 className="cart__title mt-4">
          <i
            style={{ fontSize: "1.7rem", paddingLeft: "5px" }}
            class="bx bxs-cart-alt"
          ></i>
          Shopping Cart
        </h1>
        {loading ? (
          <p>Loading cart items...</p>
        ) : error ? (
          <p className="cart__error-message">{error}</p>
        ) : cartItems.length === 0 ? (
          <p className="cart__empty-message">Your cart is empty!</p>
        ) : (
          <div className="cart__table mx-4 ">
            <table className="table table-hover mb-4">
              <thead className="cart__table-header">
                <tr>
                  <th scope="col">
                    <input
                      type="checkbox"
                      checked={Object.keys(selectedItems).length === cartItems.length && cartItems.every(item => selectedItems[item.product_code])}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th scope="col">Image</th>
                  <th scope="col text-start">Product</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Price</th>
                  <th scope="col">Sub-total</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <CartProduct
                    key={item.product_code}
                    productName={item.product_name}
                    quantity={item.quantity}
                    price={item.price}
                    subTotal={item.sub_total}
                    productCode={item.product_code}
                    cartItemId={item.cart_items_id}
                    productImage={item.product_image}
                    isSelected={!!selectedItems[item.product_code]}
                    toggleItemSelection={toggleItemSelection}
                    updateQuantity={updateCartQuantity}
                    removeFromCart={removeFromCart}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4"></td>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>
                    Total
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "red",
                    }}
                  >
                    ₱
                    {totalPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            <div className="cart__checkout d-flex justify-content-end me-4 mt-4">
              <button
                className="cart__checkout-button  fw-bold px-5 py-3 shadow"
                style={{
                  backgroundColor: "#ff69b4",
                  color: "#fff",
                  borderRadius: "0",
                }}
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

// added support in cart calculations

export default CartContent;
