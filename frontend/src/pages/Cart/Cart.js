import React from 'react'
import './Cart.css'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import CartProduct from '../../components/CartProduct'

const Cart = () => {
  return (
    <div className='cart-con'>
        <Navigation/>
        <div className='cart-box'>
            <h1>Shopping Cart</h1>
            <div className='cart-table'>
                <table>
                    <thead>
                        <tr>
                            <th><form><input type='checkbox'/></form></th> {/* IF CLICKED, ALL PRODUCT WILL BE SELECTED*/}
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Sub-total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <CartProduct/>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Total</td>
                            <td>1000</td>

                        </tr>
                    </tfoot>
                    
                </table>
                <div className='checkout-btncon'>
                    <button className='checkout-btn'>Checkout</button>
                
                </div>
                
            </div>
        </div>
        <Footer/>

    </div>
  )
}

export default Cart