import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navigation = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [cartItemCount, setCartItemCount] = useState(0); // State to hold cart item count
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('http://localhost:5000/validate-token', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (response.status === 200) {
                        setIsLoggedIn(true);
                        setUsername(response.data.username); 
                        await fetchCartItemCount(); // Fetch cart item count when user is logged in
                    } else {
                        handleLogout(); 
                    }
                } catch (error) {
                    handleLogout(); 
                }
            } else {
                setIsLoggedIn(false);
            }
        };

        checkToken();
    }, []);

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        navigate('/login');
    };

    const commonLinks = [
        { id: 1, page: "Shop", link: "/" },
        { id: 2, page: "About Us", link: "/about-us" },
        { id: 3, page: `Cart (${cartItemCount})`, link: "/cart" } // Display cart item count
    ];

    const loggedInLinks = [
        { id: 4, page: username, link: "#" } 
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
                            <a href={data.link}>{data.page}</a>
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
                            {loggedInLinks.map((data) => (
                                <li key={data.id}>
                                    <span>{data.page}</span>
                                </li>
                            ))}
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
