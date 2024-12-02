import React, { useState, useEffect } from "react";

const CartProduct = ({
  productName,
  cartItemId,
  productImage,
  quantity,
  price,
  productCode,
  isSelected,
  toggleItemSelection,
  updateQuantity,
  removeFromCart,
}) => {
  const [localQuantity, setLocalQuantity] = useState(quantity);

  // Sync localQuantity with the props.quantity if it changes
  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  // Function to handle quantity change from input or buttons
  const handleQuantityChange = (event) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (newQuantity >= 1) {
      setLocalQuantity(newQuantity);
      updateQuantity(cartItemId, newQuantity);
    }
  };

  // Function to increase quantity
  const incrementQuantity = () => {
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    updateQuantity(cartItemId, newQuantity);
  };

  // Function to decrease quantity (ensure it's at least 1)
  const decrementQuantity = () => {
    const newQuantity = localQuantity > 1 ? localQuantity - 1 : 1;
    setLocalQuantity(newQuantity);
    updateQuantity(cartItemId, newQuantity);
  };

  // Function to remove item from cart
  const handleRemoveFromCart = () => {
    removeFromCart(cartItemId);
  };

  return (
    <tr>
      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleItemSelection(productCode)}
        />
      </td>
      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
        <img
          src={
            productImage ||
            "https://th.bing.com/th/id/OIP.vg49Rg4lf-bVtcQjHxlJkgHaHa?rs=1&pid=ImgDetMain"
          }
          alt={productName}
          className="img-fluid"
          style={{
            height: "40px",
            width: "40px",
            objectFit: "fit",
            borderBottom: "2px solid #ff728a",
          }}
        />
      </td>
      <td style={{ textAlign: "start", verticalAlign: "middle" }}>
        {productName}
      </td>
      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
        <button className="qtyBtn" onClick={decrementQuantity}>
          -
        </button>{" "}
        {/* Decrement button */}
        <input
          className="qtyInput text-center"
          type="number"
          value={localQuantity}
          min="1"
          onChange={handleQuantityChange}
          style={{ width: "50px", textAlign: "center" }}
        />
        <button className="qtyBtn" onClick={incrementQuantity}>
          +
        </button>{" "}
        {/* Increment button */}
      </td>
      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
        ₱
        {price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </td>
      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
        ₱
        {(price * localQuantity).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </td>
      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
        <button className="cart__delBtn" onClick={handleRemoveFromCart}>
          <i className="bx bxs-trash-alt"></i>
        </button>
        {/* Remove button */}
      </td>
    </tr>
  );
};

export default CartProduct;
