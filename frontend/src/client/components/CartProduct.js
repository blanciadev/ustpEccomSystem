import React, { useState, useEffect } from 'react';

const CartProduct = ({
  productName,
  cartItemId, 
  quantity, 
  price,
  productCode,
  isSelected,
  toggleItemSelection,
  updateQuantity, 
  removeFromCart 
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
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleItemSelection(productCode)}
        />
      </td>
      <td>{cartItemId}</td>
      <td>{productName}</td>
      <td>
        <button className='qtyBtn' onClick={decrementQuantity}>-</button> {/* Decrement button */}
        <input
          className="qtyInput"
          type="number"
          value={localQuantity}
          min="1"
          onChange={handleQuantityChange} 
          style={{ width: "50px", textAlign: "center" }}
        />
        <button className='qtyBtn' onClick={incrementQuantity}>+</button> {/* Increment button */}
      </td>
      <td>₱{price.toFixed(2)}</td>
      <td>₱{(price * localQuantity).toFixed(2)}</td>
      <td>
        <button className='cart__delBtn' onClick={handleRemoveFromCart}><i class='bx bxs-trash-alt'></i></button> {/* Remove button */}
      </td>
    </tr>
  );
};

export default CartProduct;
