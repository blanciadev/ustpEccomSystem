import React from 'react'
import '../admin.css'
import { Dropdown } from 'react-bootstrap';

const AdminHeader = () => {
  return (
    <div className='header-user'>
                    <div className='noti'>
                        <div className='bell-con'>
                            <i class='bx bxs-bell-ring'></i>
                        </div>
                    </div>
                    <div className='admin-profile'>
                        <img src='https://t3.ftcdn.net/jpg/06/17/13/26/360_F_617132669_YptvM7fIuczaUbYYpMe3VTLimwZwzlWf.jpg'/>
                        
                        <Dropdown>
                        <Dropdown.Toggle as="p" variant='link' className='admin-text'>
                                Ma. Leonille  D. Silfavan {/* Admin Name */}
                        </Dropdown.Toggle>

                        <Dropdown.Menu style={{marginTop: '22px'}}>
                        <Dropdown.Item href='#/profile'>Profile</Dropdown.Item>
                        <Dropdown.Item href='#/settings'>Settings</Dropdown.Item>
                        <Dropdown.Item href='#/logout'>Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                        
                    </div>
                </div>
  )
}

export default AdminHeader