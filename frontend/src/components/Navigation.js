import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { cartEventEmitter } from './eventEmitter'; // Import the event emitter

const Navigation = () => {
    const [username, setUsername] = useState('');
    const [cartItemCount, setCartItemCount] = useState(0); // State to hold cart item count
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track if user is logged in
    const navigate = useNavigate();

    // Function to fetch the cart item count from the server
    const fetchCartItemCount = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:5000/cart-item-count', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200) {
                setCartItemCount(response.data.itemCount); // Set the cart item count
            }
        } catch (error) {
            console.error('Error fetching cart item count:', error.response ? error.response.data : error.message);
        }
    };

    useEffect(() => {
        const checkAuthStatus = () => {
            const token = localStorage.getItem('token');
            if (token) {
                setIsLoggedIn(true);
                const storedUsername = localStorage.getItem('username');
                setUsername(storedUsername || '');
                fetchCartItemCount();
            } else {
                setIsLoggedIn(false);
            }
        };

        // Check authentication status on mount
        checkAuthStatus();

        // Listen to the "cartUpdated" event from the EventEmitter
        cartEventEmitter.on('cartUpdated', fetchCartItemCount);

        // Cleanup listener on unmount
        return () => {
            cartEventEmitter.off('cartUpdated', fetchCartItemCount);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUsername(''); // Clear username
        setIsLoggedIn(false); // Set logged in status to false
        navigate('/login');
    };

    const handleCartClick = () => {
        if (isLoggedIn) {
            navigate('/cart');
        } else {
            navigate('/login');
        }
    };

    const commonLinks = [
        { id: 1, page: "Shop", link: "/" },
        { id: 2, page: "About Us", link: "/about-us" },
        { id: 3, page: `Cart (${cartItemCount})`, link: "#" } // Use "#" to trigger handleCartClick
    ];

    return (
        <div className='nav-container'>
            <div className='logo'>
                <a href='/'>
                    <img src='https://us.123rf.com/450wm/dmrgraphic/dmrgraphic2105/dmrgraphic210500421/169019761-hair-woman-and-face-logo-and-symbols.jpg?ver=6' alt='Logo' />
                    <h1>N&B Beauty Vault</h1>
                </a>
            </div>

            <div className='searchbar'>
                <form>
                    <input type='search' placeholder='Search Product' />
                    <button type='submit'>
                        <i className='bx bx-search' style={{ color: '#ffffff' }}></i>
                    </button>
                </form>
            </div>

            <div className='navlinks'>
                <ul>
                    {commonLinks.map((data) => (
                        <li key={data.id}>
                            <a href={data.link} onClick={data.id === 3 ? handleCartClick : undefined}>{data.page}</a>
                        </li>
                    ))}
                    {!isLoggedIn ? (
                        <>
                            <li>
                                <a href='/signup'>Sign Up</a>
                            </li>
                            <li>
                                <a href='/login'>Login</a>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <span>Welcome, {username}</span> {/* Show username */}
                            </li>
                            <li>
                                <button onClick={handleLogout}>Logout</button>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Navigation;
