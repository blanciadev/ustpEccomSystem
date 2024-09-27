import React from 'react'

const SalesSummaryComponent = () => {
  return (
    <div className='todays-sales'>
    <div className='header'>
        <div className='title'>
            <h5>Today's Sales</h5>
            <p>Sales Summary</p>
        </div>
    </div>

    <div className='summ'>
        <div className='red'>
            <div>
                <i class='bx bxs-bar-chart-square'></i>
            </div>
            <h6>PHP 12300</h6> {/* total sales */}
            <p><strong>Total Sales</strong></p>
        </div>

        <div className='yellow'>
            <div>
            <i class='bx bx-clipboard'></i>
            </div>
            <h6>100</h6> {/* number of orders */}
            <p><strong>Total Orders</strong></p>
        </div>

        <div className='green'>
            <div>
            <i class='bx bxs-purchase-tag-alt bx-rotate-90' ></i>
            </div>
            <h6>2</h6> {/* number of product sold */}
            <p><strong>Product Sold</strong></p>
        </div>

        <div className='lilac'>
            <div>
            <i class='bx bxs-user-plus' ></i>
            </div>
            <h6>3</h6> {/* number of new customers */}
            <p><strong>New Customers</strong></p>
        </div>
    </div>
</div>
  )
}

export default SalesSummaryComponent