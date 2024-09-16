import React from 'react'
import '../pages/Transactions/Transaction.css'

const Purchase = () => {
  return (
    <div className='pur-con'>
        <div className='pur-box'>
          <h4>Order No. XXXXXX</h4>
          <button>Cancel Order</button>
          <div className='pur-items'>
            <table>
              <thead>
                <tr>
                  <th>Products</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Sub-Total</th>
                </tr>
              </thead>
              <tbody>
               <tr>
                  <td>
                    <img src='#' alt='product-image'/>
                    <h5>Product</h5>
                  </td>
                  <td>Quantity</td>
                  <td>Price</td>
                  <td>Sub-Total</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td></td>
                  <td>Total</td>
                  <td>Total Amount</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td>Standard Shipping</td>
                  <td>Shipping Amount</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td>Grand Total</td>
                  <td>GrandTotal Amount</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
    </div>
  )
}

export default Purchase