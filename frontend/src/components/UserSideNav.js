import React from 'react'
import '../pages/Transactions/Transaction.css'

const UserSideNav = () => {
  return (
    <div className='side-con'>
        <div className='side-user'>
            <img src='#'/>
            <h5>User Name</h5>
            <p>User Email</p>

        </div>
        <div className='side-navlinks'>
            <a href=''>Profile</a>
            <a href='/user/purchase'>Order History</a>
            <a href=''>Notifications</a>
            <a href=''>Discounts and Vouchers</a>

        </div>
        
    </div>
  )
}

export default UserSideNav