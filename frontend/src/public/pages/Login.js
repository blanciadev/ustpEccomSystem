import React, { useState } from 'react';
import '../public.css';
import '../../App.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';
import { GoogleLogin } from '@react-oauth/google';
import start from '../../assets/start.png'

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

                const redirectTo = localStorage.getItem('redirectTo');
                if (redirectTo) {
                    localStorage.removeItem('redirectTo');
                    navigate(redirectTo);
                } else {
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

                setTimeout(() => {
                    setToastMessage('');
                }, 3000);
                setError(err.response.data.message || 'An error occurred during login');
            } else if (err.request) {
                setToastMessage('No response received from the server');

                setTimeout(() => {
                    setToastMessage('');
                }, 3000);
                setError('No response received from the server');
            } else {
                setToastMessage('Error setting up the request: ' + err.message);

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

                if (userStatus === 'registered') {
                    setLoginStatus('Login successful');
                    localStorage.setItem('token', token);
                    localStorage.setItem('customer_id', response.data.user_id);
                    localStorage.setItem('username', response.data.username);
                    localStorage.setItem('first_name', response.data.first_name);
                    localStorage.setItem('role', response.data.role_type);
                    localStorage.setItem('profile_img', response.data.profile_img);

                    navigate('/');
                    console.log(token);
                } else {
                    navigate('/signup');
                }
            }
        } catch (err) {
            console.error('Error during Google login:', err);
            setToastMessage('Failed to login with Google. Please try again.');

            setTimeout(() => {
                setToastMessage('');
            }, 3000);
        }
    };



    return (
        <div className='login-con'>
            <div className='login-box'>
                <div className='login-image'>
                    <img src={start} />
                </div>
                <div className='login-form'>
                    <h1><i class='bx bxs-spa'></i>Log In</h1>

                    <ToastNotification toastMessage={toastMessage} />
                    <div className='login-google'>
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={(error) => console.error('Google login error:', error)} // Handle error response
                        />
                        <div><p>Or Login with N&B</p></div>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className='input'>
                            <label>Email</label>
                            <input
                                className='inputOne'
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
                                className='inputOne'
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
