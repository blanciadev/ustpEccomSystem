import React, { useState } from 'react';
import axios from 'axios'; // Axios for HTTP requests
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Login = () => {
    const [username, setUsername] = useState(''); // Manage username state
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Manage loading state
    const [loginStatus, setLoginStatus] = useState(''); // Manage login status
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous errors and set loading state
        setError('');
        setLoading(true);

        try {
            // Make POST request to the /login endpoint
            const response = await axios.post('http://localhost:5000/login', { username, password });

            // Handle successful login
            if (response.status === 200) {
                setLoginStatus('Login successful');
                localStorage.setItem('token', response.data.token); // Store token
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
            setLoading(false); // Reset loading state
        }
    };

    return (
        <div className='login-page'>
            <div className='login-box'>
                <h1>Log In</h1>
                <form onSubmit={handleSubmit}>
                    <div className='input'>
                        <label>Username</label>
                        <input
                            type='text'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className='input'>
                        <label>Password</label>
                        <input
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
