import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginStatus, setLoginStatus] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log('Form submission started');

        try {
            console.log('Sending login request with:', { email, password });

            // Make the login request
            const response = await axios.post('http://localhost:5000/customer-login', { email, password });

            console.log('Login response:', response);

            if (response.status === 200) {
                // If login is successful, store token, user_id, username, and first_name
                setLoginStatus('Login successful');
                localStorage.setItem('token', response.data.token); // Store token
                localStorage.setItem('customer_id', response.data.user_id); // Store user_id
                localStorage.setItem('username', response.data.username); // Store username

                // Store first_name and log it
                localStorage.setItem('first_name', response.data.first_name); // Store first_name

                console.log('Stored first_name:', response.data.first_name); // Log the stored first_name
                console.log('Stored ID:', response.data.user_id); // Log the stored first_name

                // Redirect to homepage
                navigate('/');
            }
        } catch (err) {
            // Handle errors
            console.error('Error during login:', err);

            if (err.response) {
                setError(err.response.data.message || 'An error occurred during login');
            } else if (err.request) {
                setError('No response received from the server');
            } else {
                setError('Error setting up the request: ' + err.message);
            }
        } finally {
            setLoading(false);
            console.log('Form submission ended, loading state:', loading);
        }
    };

    return (
        <div className='login-page'>
            <div className='login-box'>
                <h1>Log In</h1>
                <form onSubmit={handleSubmit}>
                    <div className='input'>
                        <label>Email</label>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className='input'>
                        <label>Password</label>
                        <input
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type='submit' disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                {error && <p className='error'>{error}</p>}
                {loginStatus && <p className='status'>{loginStatus}</p>}
                <p>Don't have an account? <a href='/signup'>Sign Up</a></p>
            </div>
        </div>
    );
};

export default Login;
