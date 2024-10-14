import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { cartEventEmitter } from './eventEmitter';
import '../App.css';

const Navigation = () => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [profileImg, setProfileImg] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        const storedFirstName = localStorage.getItem('first_name');
        const customerId = localStorage.getItem('customer_id'); // Assuming customer_id is stored in localStorage

        window.addEventListener('resize', handleResize);

        if (token) {
            setIsLoggedIn(true);
            setUsername(storedUsername || '');
            setFirstName(storedFirstName || '');
            fetchUserDetails(customerId); // Fetch user details from the backend
        }

        fetchCartItemCount();
        cartEventEmitter.on('cartUpdated', fetchCartItemCount);

        return () => {
            cartEventEmitter.off('cartUpdated', fetchCartItemCount);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const fetchUserDetails = async (customerId) => {
        if (!customerId) return; // Do nothing if customerId is not provided
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post('http://localhost:5001/users-details', { customer_id: customerId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userData = response.data; // Access the response data

            // Check if profile image exists and handle appropriately
            if (userData && userData.profile_img) {
                if (typeof userData.profile_img === 'string') {
                    // If profile_img is a base64 string, display it directly
                    setProfileImg(`data:image/jpeg;base64,${userData.profile_img}`);
                } else if (userData.profile_img.data) {
                    // If profile_img is binary (Buffer), convert it to base64
                    const base64String = btoa(
                        new Uint8Array(userData.profile_img.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
                    );
                    setProfileImg(`data:image/jpeg;base64,${base64String}`);
                } else {
                    // Handle unexpected profile_img format
                    console.error('Unexpected profile image format:', userData.profile_img);
                    setProfileImg(''); // Fallback to empty if there's an issue
                }
            } else {
                // No profile image found, using a default image
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
            // Fetch cart from localStorage if user is not logged in
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            setCartItemCount(cart.reduce((total, item) => total + item.quantity, 0));
            return;
        }

        // Fetch cart from the server if the user is logged in
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
        setIsMobile(window.innerWidth <= 768);  // Update state based on screen width
    };

    return (
        <div className='nav-container'>
            <div className='logo'>
                <a href='/'>
                    <img src='https://us.123rf.com/450wm/dmrgraphic/dmrgraphic2105/dmrgraphic210500421/169019761-hair-woman-and-face-logo-and-symbols.jpg?ver=6' alt='Logo' />
                    {isMobile ? (
                        <p></p> // Text for mobile view
                    ) : (
                        <h1>N&B Beauty Vault</h1> // Icon for larger screen 
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
                                            alt="Profile Image"  // Added alt text for accessibility
                                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}  // Styling the image for a better UI
                                        />
                                    )}
                                </span>
                            </li>
                            <li><button onClick={handleLogout}>Logout</button></li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Navigation;
