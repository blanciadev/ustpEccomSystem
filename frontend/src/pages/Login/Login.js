import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState(''); // Changed from username to email
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginStatus, setLoginStatus] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Make the login request
            const response = await axios.post('http://localhost:5000/customer-login', { email, password }); // Changed username to email

            if (response.status === 200) {
                // If login is successful, store token and user_id
                setLoginStatus('Login successful');
                localStorage.setItem('token', response.data.token); // Store token
                localStorage.setItem('user_id', response.data.user_id); // Store user_id
                navigate('/'); // Redirect to homepage
            }
        } catch (err) {
            // Handle errors
            if (err.response) {
                setError(err.response.data.message || 'An error occurred during login');
            } else if (err.request) {
                setError('No response received from the server');
            } else {
                setError('Error setting up the request: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login-page'>
            <div className='login-box'>
                <h1>Log In</h1>
                <form onSubmit={handleSubmit}>
                    <div className='input'>
                        <label>Email</label> {/* Changed from Username to Email */}
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
