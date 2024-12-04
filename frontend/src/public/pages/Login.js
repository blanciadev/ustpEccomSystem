import React, { useState } from 'react';
// import '../public.css';
// import '../../App.css'
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';
import { GoogleLogin } from '@react-oauth/google';
import start from '../../assets/start.png'
import login_signup from '../../assets/img/login-signup.png'

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
                    if (roleType === 'Admin' || roleType === 'Warehouse Manager') {
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

        <div class="d-flex justify-content-center">
            <section class="login-con">
                <div class="container">
                    <div class="row">
                        <div class="col-12 col-xxl-11 d-flex justify-content-center">
                            <div class="login-box card border-light-subtle shadow-sm">



                                <div class="row g-0">


                                    <div class="col-12 col-md-6">
                                        <a href="/">
                                            <img class="img-fluid rounded-start w-100 h-100 object-fit-cover" loading="lazy" src={login_signup} alt="login-image" />
                                        </a>
                                    </div>

                                    <div class="col-gradient col-12 col-md-6 d-flex justify-content-center">
                                        <div class="col-12 col-lg-11 col-xl-10">
                                            <div class="card-body p-0">
                                                <div class="row">
                                                    <div class="col-12 mt-4">
                                                        <div class="mb-4">

                                                            <h2 class=" text-center">Login</h2>
                                                            <ToastNotification toastMessage={toastMessage} />

                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-12">
                                                        <div class="d-flex gap-3 flex-column">

                                                            <GoogleLogin
                                                                class="d-flex btn btn-outline-danger justify-content-center align-items-center"
                                                                onSuccess={handleGoogleLogin}
                                                                onError={(error) => console.error('Google login error:', error)} // Handle error response
                                                            />

                                                        </div>
                                                        <div class="row d-flex justify-content-center align-items-center">
                                                            <div class="col"><hr></hr></div>
                                                            <div class="col-6"><p class="text-center mt-2 mb-2 text-secondary">Or Login with N&B</p></div>
                                                            <div class="col"><hr></hr></div>
                                                        </div>

                                                    </div>
                                                </div>

                                                <form onSubmit={handleSubmit} class="d-flex justify-content-center">
                                                    <div class="row gy-3 overflow-hidden d-flex justify-content-center">

                                                        <div class="col-12">
                                                            <div class="form-floating">
                                                                <input type="email" class="form-control" name="email" id="email" placeholder="name@example.com"
                                                                    value={email}
                                                                    onChange={(e) => setEmail(e.target.value)} required
                                                                />
                                                                <label for="email" class="form-label">Email</label>
                                                            </div>
                                                        </div>

                                                        <div class="col-12">
                                                            <div class="form-floating">
                                                                <input type="password" class="form-control" name="password" id="password" placeholder="name@example.com"
                                                                    value={password}
                                                                    onChange={(e) => setPassword(e.target.value)} required
                                                                />
                                                                <label for="password" class="form-label">Password</label>
                                                            </div>
                                                        </div>


                                                        <div class="col-12">
                                                            <div class="form-check d-flex justify-content-end">
                                                                {/* <input class="form-check-input" type="checkbox" value="" name="iAgree" id="iAgree" required/> */}
                                                                <a href='/forgot-password'>Forgot Password?</a>
                                                            </div>
                                                        </div>
                                                        <div class="col-12">
                                                            <div class="d-grid">
                                                                <button class="btn bsb-btn-xl btn-dark fs-5" type='submit' disabled={loading}>
                                                                    {loading ? 'Logging in...' : 'Login'}
                                                                </button>
                                                                {error && <p class='error text-danger text-center mt-2'>{error}</p>}

                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>


                                                {loginStatus && <p className='status'>{loginStatus}</p>}
                                                <div class="row mb-4">
                                                    <div class="col-12">
                                                        <p class="mb-0 mt-4 text-secondary text-center">Not Registered Yet? <a href="/signup" class="link-primary text-decoration-none">Register</a></p>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>

    );
};

export default Login;
