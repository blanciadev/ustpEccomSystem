import React from 'react'
import '../admin.css'

const OrderSummary = () => {
  return (
    <div className='todays-order'>
        <div className='header'>
            <div className='title'>
                <h5>Today's Orders</h5>
                <p>Order Summary</p>
            </div> 
            <div className='see-all'>
                <button>See all</button>
            </div>
        </div>

        <div className='summ'>

            <div className='delivered'>
                <div>
                    <i class='bx bxs-package' ></i>
                </div>
                <h6>321</h6>{/* number of DELIVERED orders */}
                <p><strong>Delivered</strong></p>
                <p>+8% from yesterday</p>{/* % comparison from yesterday */}
            </div>

            <div className='intransit'>
                <div>
                    <i class='bx bxs-truck' ></i>
                </div>
                <h6>321</h6>{/* number of INTRANSIT orders */}
                <p><strong>In Transit</strong></p>
                <p>+8% from yesterday</p>{/* % comparison from yesterday */}
            </div>

            <div className='cancelled'>
                <div>
                    <i class='bx bxs-x-circle'></i>
                </div>
                <h6>321</h6>{/* number of CANCELLED orders */}
                <p><strong>Cancelled</strong></p>
                <p>+8% from yesterday</p>{/* % comparison from yesterday */}
             </div>

            <div className='returned'>
                <div>
                    <i class='bx bx-reset'></i>
                </div>
                <h6>321</h6>{/* number of RETURNED orders */}
                <p><strong>Returned</strong></p>
                <p>+8% from yesterday</p>{/* % comparison from yesterday */}
            </div>
        </div>
    </div>

  )
}

export default OrderSummary