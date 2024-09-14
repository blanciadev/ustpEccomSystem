import React from 'react'
import Navigation from '../../components/Navigation'
import './Transaction.css'
import Purchase from '../../components/Purchase'

const OrderHistory = () => {
  return (
    <div className='order-con'>
        <Navigation/>
        <div className='order-box'>
            <div className='user'>


            </div>
            <div className='purchase'>
                <div className='purchase-box'>
                    <div className='purchase-header'>
                        <h3>OrderHistory</h3>
                    </div>
                    <div className='purchase-body'>
                        <div className='purchase-btncon'>
                            <button>All</button>
                            <button>To Ship</button>
                            <button>To Receive</button>
                            <button>Completed</button>
                            <button>Cancelled</button>
                            <button>Return/Refund</button>
                        </div>
                        <div className='order'>
                            <Purchase/>
                            <Purchase/>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </div>
  )
}

export default OrderHistory