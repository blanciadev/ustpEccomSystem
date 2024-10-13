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
        if (!customerId) return; // Do nothing if customer_id is not available
        const token = localStorage.getItem('token');
    
        try {
            const response = await axios.post('http://localhost:5001/users-details', { customer_id: customerId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (response.status === 200) {
                const userData = response.data;
    
                // Debugging statement to log the entire userData response
                console.log('User Data Response:', userData);
    
                // Check if profile_img exists and log its value
                if (userData.profile_img) {
                    console.log('Profile Image (before conversion):', userData.profile_img); // Log the raw profile image data
                    
                    // Create a base64 string from the binary data using FileReader
                    const base64String = await convertToBase64(userData.profile_img);
                    setProfileImg(`data:image/png;base64,${base64String}`); // Set the profile image as a base64 string
                    
                    // Debugging statement to log the base64 string
                    console.log('Profile Image (base64):', `data:image/png;base64,${base64String}`);
                } else {
                    console.log('No profile image found for the user.'); // Log if no profile image is available
                }
            }
        } catch (error) {
            console.error('Error fetching user details:', error.response ? error.response.data : error.message);
        }
    };
    
    // Helper function to convert binary data to base64
    const convertToBase64 = (binaryData) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const blob = new Blob([binaryData]); // Convert binary data to a Blob
    
            reader.onloadend = () => {
                const base64data = reader.result.split(',')[1]; // Get the base64 part
                resolve(base64data); // Resolve the promise with the base64 data
            };
            reader.onerror = (error) => {
                reject(error); // Reject the promise if there's an error
            };
    
            reader.readAsDataURL(blob); // Start reading the Blob as a data URL
        });
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
                                        <p style={{ fontWeight: '500' }}></p> // Text for mobile view
                                    ) : (
                                        // Use img to display user's profile image for larger screen
                                        <img 
                                            src={profileImg} 
                                            alt="Profile" 
                                            style={{ 
                                                width: '30px', 
                                                height: '30px', 
                                                borderRadius: '50%', 
                                                cursor: 'pointer' 
                                            }} 
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
