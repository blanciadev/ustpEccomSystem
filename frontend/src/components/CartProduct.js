import React from 'react'

const CartProduct = () => {
  return (
         <tr>
            <td><form><input type='checkbox'/></form></td>
            <td className='product'>
              <img src='#'/>
                <h3>Brand</h3>
                <p>Product Description</p>
            </td>
            <td>1</td>
            <td>1000</td>
            <td>1000</td>

        </tr>
  )
}

export default CartProduct