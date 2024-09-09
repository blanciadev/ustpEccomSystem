import React from 'react'
import './Transaction.css'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'

const Checkout = () => {
  return (
    <div className='checkout-con'>
        <Navigation/>
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
                                <input type='text'/>
                            </div>
                            <div>
                                <label>Phone Number</label>
                                <input type='text'/>
                            </div>
                            <div>
                                <label>Street Name, Building, House Number</label>
                                <input type='text'/>
                            </div>
                            <div>
                                <label>Region, Province, City, Barangay</label>
                                <input type='text'/>
                            </div>
                            <div>
                                <label>Postal Code</label>
                                <input type='text'/>
                            </div>

                            <button type='submit'>Continue</button>
                        </form>
                    </div>
                </div>
                <br/><hr/><br/>
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
                                <tr>
                                    <td>
                                        <img src='#'/>
                                        <div>
                                            <h5>Product1</h5>
                                            <p>variation</p>
                                        </div>
                                    </td>
                                    <td>1</td>
                                    <td>1000</td>
                                    <td>1000</td>
                                </tr>

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

                                <input id="COD" type='radio'/><label>Cash On Delivery</label>
                                <input id="GCASH" type='radio'/><label>Gcash</label>
                                <button>Place Order</button>
                            </form>
                        </div>
                        <div className='payment-total'>
                        <table>
                                    <tr><td>Total items : 1</td></tr>
                                    <tr><td>Order Total: 1000</td></tr>
                                    <tr><td>Standard Shipping: 125</td></tr>
                                    <tr><th>Grand Total:  1125</th></tr>
                            
                        </table>
                        </div>

                        
                    </div>
                </div>
                
            </div>
        </div>
        <Footer/>
    </div>
  )
}

export default Checkout