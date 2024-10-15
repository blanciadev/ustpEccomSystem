import React from 'react';
import '../admin.css';
import Dropdown from 'react-bootstrap/Dropdown';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
    // Retrieve user data from localStorage
    const username = localStorage.getItem('username') || 'User';
    const firstName = localStorage.getItem('first_name') || '';
    const navigate = useNavigate();

    // Handle logout function
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
                // Clear user data from localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('customer_id');
                localStorage.removeItem('username');
                localStorage.removeItem('first_name');
                localStorage.removeItem('role');

                // Redirect to login page
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
                        <Dropdown.Item href='#/profile'>Profile</Dropdown.Item>
                        <Dropdown.Item href='#/settings'>Settings</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
}

export default AdminHeader;
