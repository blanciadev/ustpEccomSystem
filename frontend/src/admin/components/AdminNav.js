import React from 'react'
import '../admin.css'

const AdminNav = () => {
  return (
    <div className='nav-con'>
      <div className='nav-img'> 
        <img src='https://i.pinimg.com/736x/91/a3/05/91a30517c00978fd864dedea942f6048.jpg'/>
      </div>
      <div className='nav-links'>
        <a href='/admin/dashboard' className='active'>Dashboard</a>
        <a>Orders</a>
        <a>Payments</a>
        <a>Shipments</a>
        <a>Products</a>
        <a>Inventory</a>
        <a>Reports</a>

      </div>
        
        
    </div>
  )
}

export default AdminNav