import React from 'react'
import '../pages/Transactions/Transaction.css'

const UserSideNav = () => {
  return (
    <div className='side-con'>
        <div className='side-user'>
            <img src='https://steamuserimages-a.akamaihd.net/ugc/2040726635496857485/B1EBAA2FC123ABD19B0A467C4A7EB0D0184DDA40/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false'/>{/* users profile*/}
            <h5>User Name</h5>{/* users name*/}
            <p>User Email</p>{/* users email*/}
        </div>
        <div className='side-navlinks'>
            <a href='/user'>Profile</a>
            <a href='/user/purchase'>Order History</a>
            <a href='/user/notifications'>Notifications</a>
            <a href='/user/discounts+vouchers'>Discounts and Vouchers</a>

        </div>
        
    </div>
  )
}

export default UserSideNav