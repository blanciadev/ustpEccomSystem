import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { cartEventEmitter } from './eventEmitter';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ToastNotification from './ToastNotification';

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
        <div className='nav-container'>

            <ToastNotification toastMessage={toastMessage} />
            <div className='logo'>
                <a href='/'>
                    <img src='https://scontent.fcgy2-2.fna.fbcdn.net/v/t39.30808-6/309663016_472407468238901_2439729538350357694_n.png?_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHkaWoh0NeJOgZZ6d3YXYb1oX31niLe-56hffWeIt77noexsEmKXN3bXRjYsP7inglwvA8imWTOstpqXY8AVb1V&_nc_ohc=f5YixnsisdIQ7kNvgGtmFvf&_nc_zt=23&_nc_ht=scontent.fcgy2-2.fna&_nc_gid=AEQqzBrO4GzSWrnFE7-E_kE&oh=00_AYAfTV-I96cqn2FCrQRTLel7NfNELFSAzsewGkSEwBSmSA&oe=671787EB' alt='Logo' />
                    {isMobile ? (
                        <p></p>
                    ) : (
                        <h1>N&B Beauty Vault</h1>
                    )}
                </a>
            </div>

            <div className='searchbar'>
                <form>
                    <input type='search' placeholder='Search...' />
                </form>
            </div>

            <button className="menu-toggle" onClick={toggleMenu}>
                {isMenuOpen ? (
                    <i className='bx bx-x'></i>
                ) : (
                    <i className='bx bx-menu'></i>
                )}
            </button>

            <div className='navlinks'>
                <ul className={`linklist ${isMenuOpen ? "active" : ""}`}>
                    {commonLinks.map((data) => (
                        <li key={data.id}>
                            <a href={data.link} onClick={data.id === 3 ? handleCartClick : undefined}>{data.page}</a>
                        </li>
                    ))}

                    {!isLoggedIn ? (
                        <>
                            <li><a href='/signup'>Sign Up</a></li>
                            <li><a href='/login'>Login</a></li>
                        </>
                    ) : (
                        <>
                            <li>
                                <span className='cartIcon' onClick={handleProfileClick}>
                                    {isMobile ? (
                                        <p style={{ fontWeight: '400' }}>Profile</p>
                                    ) : (
                                        <img
                                            src={profileImg || 'https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg'}
                                            alt="Profile Image"
                                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}  // Styling the image for a better UI
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
};

export default Navigation;
