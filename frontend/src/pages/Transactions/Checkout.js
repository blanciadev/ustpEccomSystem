import React from 'react';
import './Transaction.css';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useLocation } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const { selectedProducts = [], totalPrice = 0 } = location.state || {}; // Retrieve the passed state or default to empty values

  return (
    <div className='checkout-con'>
      <Navigation />
      <div className='checkout-wrap'>
        <h1>Checkout</h1>
        <div className='checkout-box'>
          <div className='checkout-set'>
            <div>
              <h3>Delivery Address</h3>
              <button>Change</button>
            </div>
            <div className='checkout-form'>
              <form>
                <div>
                  <label>Full Name</label>
                  <input type='text' />
                </div>
                <div>
                  <label>Phone Number</label>
                  <input type='text' />
                </div>
                <div>
                  <label>Street Name, Building, House Number</label>
                  <input type='text' />
                </div>
                <div>
                  <label>Region, Province, City, Barangay</label>
                  <input type='text' />
                </div>
                <div>
                  <label>Postal Code</label>
                  <input type='text' />
                </div>
                <button type='submit'>Continue</button>
              </form>
            </div>
          </div>
          <br />
          <hr />
          <br />
          <div className='checkout-products'>
            <h3>Products Ordered</h3>
            <div className='products-ordered'>
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
                  {selectedProducts.map(product => (
                    <tr key={product.product_code}>
                      <td>
                        <img src='#' alt={product.product_name} />
                        <div>
                          <h5>{product.product_name}</h5>
                          <p>{product.description}</p>
                        </div>
                      </td>
                      <td>{product.quantity}</td>
                      <td>{product.price}</td>
                      <td>{product.sub_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className='checkout-payment'>
            <h3>Payment Method</h3>
            <div className='payment-con'>
              <div className='payment-method'>
                <h5>Select Mode of Payment</h5>
                <form>
                  <input id="COD" type='radio' name='payment' />
                  <label htmlFor='COD'>Cash On Delivery</label>
                  <input id="GCASH" type='radio' name='payment' />
                  <label htmlFor='GCASH'>Gcash</label>
                  <button>Place Order</button>
                </form>
              </div>
              <div className='payment-total'>
                <table>
                  <tbody>
                    <tr>
                      <td>Total items: {selectedProducts.length}</td>
                    </tr>
                    <tr>
                      <td>Order Total: ${totalPrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Standard Shipping: 125</td>
                    </tr>
                    <tr>
                      <th>Grand Total: ${(totalPrice + 125).toFixed(2)}</th>
                    </tr>
                  </tbody>
                </table>
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
