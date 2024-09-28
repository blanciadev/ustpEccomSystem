import React from 'react'
import '../admin.css'

const UserCountComponent = () => {
  return (
    <div className='user-counts' >
        <div className='new-users'>
            <div className='qty'>
                <i class='bx bxs-user-plus' ></i>
               <h6>14</h6> {/* Displaying the count */}
            </div>
            <div>
                <h6>New Users</h6>
                {/* <p>Have recently registered or made their first purchase</p> */}
            </div>
        </div>

        <div className='employees'>
            <div className='qty'>
                <i class='bx bxs-user-badge' ></i>
               <h6>14</h6> {/* Displaying the count */}
            </div>
            <div>
                <h6>Total Employees</h6>
                {/* <p>Managing the website and its services</p> */}
            </div>
        </div>

        <div className='active-users'>
            <div className='qty'>
                <i class='bx bxs-user' ></i>
               <h6>14</h6> {/* Displaying the count */}
            </div>
            <div>
                <h6>Active Customers</h6>
                {/* <p>Engaging with the system regularly</p> */}
            </div>
        </div>

        <div className='inactive-users'>
            <div className='qty'>
                <i class='bx bxs-user-x' ></i>
               <h6>14</h6> {/* Displaying the count */}
            </div>
            <div>
                <h6>Inactive Customers</h6>
                {/* <p>Have not shown any recent activity or engagement with the system</p> */}
            </div>
        </div>

    </div>
  )
}

export default UserCountComponent