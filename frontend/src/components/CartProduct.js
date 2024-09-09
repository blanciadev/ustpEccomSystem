import React from 'react';

const CartProduct = ({
  productName,
  quantity,
  price,
  subTotal,
  productCode,
  description,
  brand,
  category,
  size,
  isSelected,
  toggleItemSelection
}) => {
  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleItemSelection(productCode)}
        />
      </td>
      <td>{productName}</td>
      <td>{quantity}</td>
      <td>${price.toFixed(2)}</td>
      <td>${subTotal.toFixed(2)}</td>
    </tr>
  );
};

export default CartProduct;
