import React from 'react'
import AdminNav from '../components/AdminNav'
import AdminHeader from '../components/AdminHeader'

const Settings = () => {
  return (
            <div className='dash-con'>
                <AdminNav />
                <div className='dash-board'>
                    <div className='dash-header'>
                        <div className='header-title'>
                            <i className='bx bxs-user'></i>
                            <h1>Profile</h1>
                        </div>
                        <AdminHeader />
                    </div>
                    <div className='body'>
                        <div className='admin-settings'>
                            <div className='admin-image'>
                                <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzk92qOx7c5k5fybjVbUkwg6BGW_ptjgID9A&s'/>
                            </div>
                            <div className='admin-information'>
                                <p>Info</p>
                            </div>
                            <div className='admin-password'>
                                <p>Change Password</p>
                            </div>

                        </div>
                        
                    </div>
                </div>
            </div>
)
}

export default Settings