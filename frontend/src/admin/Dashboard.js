import React from 'react'
import './admin.css'
import AdminNav from './components/AdminNav'

const Dashboard = () => {
  return (
    <div className='dash-con'>
        <AdminNav/>
        <div className='dash-board'>
            <div className='dash-header'>
                <div className='header-title'>
                    <h1>Dashboard</h1>
                </div>
                <div className='header-user'>
                    <div className='noti'>
                        <div className='bell-con'>

                        </div>
                    </div>
                    <div className='admin-profile'>
                        <img src='https://t3.ftcdn.net/jpg/06/17/13/26/360_F_617132669_YptvM7fIuczaUbYYpMe3VTLimwZwzlWf.jpg'/>
                        <p>Admin</p>

                    </div>
                </div>
            </div>
            <div className='dash-body'>
                <div className='col-one'>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <div className='col-two'>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Dashboard