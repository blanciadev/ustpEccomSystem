import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { cartEventEmitter } from './eventEmitter';

const Navigation = () => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        const storedFirstName = localStorage.getItem('first_name');

        if (token) {
            setIsLoggedIn(true);
            setUsername(storedUsername || '');
            setFirstName(storedFirstName || '');
        }

        fetchCartItemCount();
        cartEventEmitter.on('cartUpdated', fetchCartItemCount);
        return () => {
            cartEventEmitter.off('cartUpdated', fetchCartItemCount);
        };
    }, []);

    const fetchCartItemCount = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            // Fetch cart from localStorage if user is not logged in
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            setCartItemCount(cart.reduce((total, item) => total + item.quantity, 0)); // Count total quantity in cart
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
        navigate('/user/purchase');
    };

    const commonLinks = [
        { id: 1, page: "Shop", link: "/shop" },
        { id: 2, page: "About Us", link: "/about-us" },
        { id: 3, page: `Cart (${cartItemCount})`, link: "#" }
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
                            <li><a href='/signup'>Sign Up</a></li>
                            <li><a href='/login'>Login</a></li>
                        </>
                    ) : (
                        <>
                            <li><span onClick={handleProfileClick}>Hi! {firstName}</span></li>
                            <li><button onClick={handleLogout}>Logout</button></li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Navigation;
