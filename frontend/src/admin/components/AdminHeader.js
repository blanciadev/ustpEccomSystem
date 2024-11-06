import React, { useState } from 'react';
import '../admin.css';
import Dropdown from 'react-bootstrap/Dropdown';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {

    const username = localStorage.getItem('username') || 'User';
    const firstName = localStorage.getItem('first_name') || '';
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();


    const handleLogout = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No token found for logout.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5001/logout', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                localStorage.removeItem('token');
                localStorage.removeItem('customer_id');
                localStorage.removeItem('username');
                localStorage.removeItem('first_name');
                localStorage.removeItem('role');


                navigate('/login');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className='header-user'>

            <div className='admin-profile'>
                <img
                    src='https://t3.ftcdn.net/jpg/06/17/13/26/360_F_617132669_YptvM7fIuczaUbYYpMe3VTLimwZwzlWf.jpg'
                    alt='Profile'
                />

                <Dropdown>
                    <Dropdown.Toggle as="p" variant='link' className='admin-text'>
                        {firstName ? firstName : username}
                    </Dropdown.Toggle>

                    <Dropdown.Menu style={{ marginTop: '35px', width: '200px' }}>
                        <Dropdown.Item href='/admin/profile'>Profile</Dropdown.Item>
                        <Dropdown.Item onClick={() => setShowLogoutModal(true)}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div
                className={`modal fade ${showLogoutModal ? 'show' : ''}`}
                id="logoutModal"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="logoutModalLabel"
                aria-hidden="true"
                style={{ display: showLogoutModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}  // Ensure background dimming
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="logoutModalLabel">Confirm Logout</h5>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to log out?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminHeader;
