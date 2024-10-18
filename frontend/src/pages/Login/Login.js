import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../../components/ToastNotification';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginStatus, setLoginStatus] = useState('');
    const navigate = useNavigate();
    const [toastMessage, setToastMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5001/users-login', { email, password });

            if (response.status === 200) {
                setLoginStatus('Login successful');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('customer_id', response.data.user_id);
                localStorage.setItem('username', response.data.username);
                localStorage.setItem('first_name', response.data.first_name);
                localStorage.setItem('role', response.data.role_type);
                localStorage.setItem('profile_img', response.data.profile_img);

                // Check if there's a redirect page stored
                const redirectTo = localStorage.getItem('redirectTo');
                if (redirectTo) {
                    localStorage.removeItem('redirectTo');
                    navigate(redirectTo);
                } else {
                    // Check the role_type and redirect accordingly
                    const roleType = response.data.role_type;
                    if (roleType === 'Admin') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/');
                    }
                }
            }
        } catch (err) {
            if (err.response) {
                setToastMessage(err.response.data.message || 'An error occurred during login');

                // Clear toast message after 3 seconds
                setTimeout(() => {
                    setToastMessage('');
                }, 3000);
                setError(err.response.data.message || 'An error occurred during login');
            } else if (err.request) {
                setToastMessage('No response received from the server');

                // Clear toast message after 3 seconds
                setTimeout(() => {
                    setToastMessage('');
                }, 3000);
                setError('No response received from the server');
            } else {
                setToastMessage('Error setting up the request: ' + err.message);

                // Clear toast message after 3 seconds
                setTimeout(() => {
                    setToastMessage('');
                }, 3000);
                setError('Error setting up the request: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        const token = credentialResponse.credential;

        try {
            const response = await axios.post('http://localhost:5001/verify-token', { token });

            if (response.status === 200) {
                const userData = response.data.payload;
                const userStatus = response.data.status;

                console.log('User Info:', userData);

                // If the user is registered, store the required information in localStorage
                if (userStatus === 'registered') {
                    setLoginStatus('Login successful');
                    localStorage.setItem('token', token);
                    localStorage.setItem('customer_id', response.data.user_id);
                    localStorage.setItem('username', response.data.username);
                    localStorage.setItem('first_name', response.data.first_name);
                    localStorage.setItem('role', response.data.role_type);
                    localStorage.setItem('profile_img', response.data.profile_img);

                    // Redirect to the homepage if the user is registered
                    navigate('/');
                    console.log(token);
                } else {
                    // Redirect to signup page if the user is not registered
                    navigate('/signup');
                }
            }
        } catch (err) {
            console.error('Error during Google login:', err);
            setToastMessage('Failed to login with Google. Please try again.');

            // Clear toast message after 3 seconds
            setTimeout(() => {
                setToastMessage('');
            }, 3000);
        }
    };



    return (
        <div className='login-con'>
            <div className='login-box'>
                <div className='login-image'>
                    <img src='https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1723441265778-917980.jpeg' />
                </div>
                <div className='login-form'>
                    <h1>Log In</h1>

                    <ToastNotification toastMessage={toastMessage} />
                    <div className='login-google'>
                        <GoogleLogin
                            onSuccess={handleGoogleLogin} // Handle success response
                            onError={(error) => console.error('Google login error:', error)} // Handle error response
                        />
                        <div><p>Or Login with N&B</p></div>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className='input'>
                            <label>Email</label>
                            <input
                                type='email'
                                placeholder='Enter your email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className='input'>
                            <label>Password</label>
                            <input
                                type='password'
                                placeholder='Enter your password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <a href='/forgot-password'>Forgot Password?</a>
                        <button type='submit' disabled={loading}>
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    {loginStatus && <p className='status'>{loginStatus}</p>}
                    <p>Don't have an account? <a href='/signup'>Sign Up</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
