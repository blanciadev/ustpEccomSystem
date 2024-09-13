import React from 'react'
import Navigation from '../../components/Navigation'
import './Transaction.css'
import Purchase from '../../components/Purchase'
import UserSideNav from '../../components/UserSideNav'

const OrderHistory = () => {
  return (
    <div className='order-con'>
        <Navigation/>
        <div className='order-box'>
            <div className='user'>
                <UserSideNav/>
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