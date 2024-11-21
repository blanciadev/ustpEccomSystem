import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { cartEventEmitter } from './eventEmitter';
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ToastNotification from '../../public/components/ToastNotification';

import { BsCart } from "react-icons/bs";
import { IoIosSearch } from "react-icons/io";

import logo from '../../assets/img/logo.png'

const Navigation = () => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [profileImg, setProfileImg] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        const storedFirstName = localStorage.getItem('first_name');
        const customerId = localStorage.getItem('customer_id');

        window.addEventListener('resize', handleResize);

        if (token) {
            setIsLoggedIn(true);
            setUsername(storedUsername || '');
            setFirstName(storedFirstName || '');
            fetchUserDetails(customerId);
        }

        fetchCartItemCount();
        cartEventEmitter.on('cartUpdated', fetchCartItemCount);

        return () => {
            cartEventEmitter.off('cartUpdated', fetchCartItemCount);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const fetchUserDetails = async (customerId) => {
        if (!customerId) return;
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post('http://localhost:5001/users-details', { customer_id: customerId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userData = response.data;


            if (userData && userData.profile_img) {
                if (typeof userData.profile_img === 'string') {
                    setProfileImg(`data:image/jpeg;base64,${userData.profile_img}`);
                } else if (userData.profile_img.data) {
                    const base64String = btoa(
                        new Uint8Array(userData.profile_img.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
                    );
                    setProfileImg(`data:image/jpeg;base64,${base64String}`);
                } else {
                    console.error('Unexpected profile image format:', userData.profile_img);
                    setProfileImg('');
                }
            } else {
                console.log('No profile image found, using default image.');
                setProfileImg('https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg');
            }
        } catch (error) {
            console.error('Error fetching user details:', error.response ? error.response.data : error.message);
        }
    };





    const fetchCartItemCount = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            setCartItemCount(cart.reduce((total, item) => total + item.quantity, 0));
            return;
        }

        try {
            const response = await axios.get('http://localhost:5001/cart-item-count', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200) {
                setCartItemCount(response.data.itemCount);
            }
        } catch (error) {
            console.error('Error fetching cart item count:', error.response ? error.response.data : error.message);
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await axios.post('http://localhost:5001/logout', {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                localStorage.removeItem('token');
            } catch (error) {
                console.error('Error logging out:', error.response ? error.response.data : error.message);
            }
        }

        localStorage.clear();
        setUsername('');
        setFirstName('');
        setToastMessage('Logged Out!');

        setTimeout(() => {
            setToastMessage('');
        }, 3000);
        setIsLoggedIn(false);
        navigate('/login');
    };

    const handleCartClick = () => {
        navigate('/cart');
    };

    const handleProfileClick = () => {
        navigate('/user');
    };

    const commonLinks = [
        { id: 1, page: "Shop", link: "/shop" },
        { id: 3, page: `Cart (${cartItemCount})`, link: "#" }
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    return (
        <div className="nav-container d-flex justify-content-between align-items-center p-3 ">
            <ToastNotification toastMessage={toastMessage} />


            <div className="logo d-flex align-items-center">
                <a href="/" className="d-flex align-items-center">
                    <img src={logo} alt="Logo" className="me-2" style={{ height: "50px", width: "50px" }} />
                    {isMobile ? (
                        <p></p>
                    ) : (
                        <h1 className="m-0">N&B Beauty Vault</h1>
                    )}
                </a>
            </div>




            {/* <div className="d-flex align-items-center p-0 m-0">
                <div className="searchbar d-flex justify-content-center mb-3">
                    <form className="d-flex align-items-start p-0 m-0">
                        <div className="input-group custom-border">
                            <span className="input-group-text custom-icon">
                                <IoIosSearch style={{ height: "20px", width: "20px" }} />
                            </span>
                            <input
                                type="search"
                                placeholder="Look for your perfect haircare products..."
                                className="p-0 m-0"
                                style={{ width: "350px", height: "40px" }}
                            />
                        </div>
                    </form>
                </div>
            </div> */}






            <button className="menu-toggle" onClick={toggleMenu}>
                {isMenuOpen ? (
                    <i className="bx bx-x"></i>
                ) : (
                    <i className="bx bx-menu"></i>
                )}
            </button>


            <div className="navlinks">
                <ul className={`linklist ${isMenuOpen ? "active" : ""}`}>
                    {commonLinks.map((data) => (
                        <li key={data.id}>
                            <a href={data.link} onClick={data.id === 3 ? handleCartClick : undefined}>
                                {data.id === 3 ? (
                                    <>
                                        <BsCart style={{ height: "20px", width: "20px" }} /> {data.page}
                                    </>
                                ) : (
                                    data.page
                                )}
                            </a>
                        </li>
                    ))}
                    {!isLoggedIn ? (
                        <>
                            <li><a href='/signup'>Sign Up</a></li>
                            <li><a href='/login' class="login">Login</a></li>
                        </>
                    ) : (
                        <>
                            <li>
                                <span className="cartIcon" onClick={handleProfileClick}>
                                    {isMobile ? (
                                        <p style={{ fontWeight: '400' }}>Profile</p>
                                    ) : (
                                        <img
                                            src={profileImg || 'https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg'}
                                            alt="Profile Image"
                                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                        />
                                    )}
                                </span>
                            </li>
                            <li><button onClick={() => setShowLogoutModal(true)}>Logout</button></li>
                        </>
                    )}
                </ul>
            </div>


            <div
                className={`modal fade ${showLogoutModal ? 'show' : ''}`}
                id="logoutModal"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="logoutModalLabel"
                aria-hidden="true"
                style={{ display: showLogoutModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
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
};

export default Navigation;
