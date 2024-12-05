import React, { useState } from 'react';
// import '../public.css';
// import '../../App.css'
import './Login.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
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
            const response = await axios.post('https://ustp-eccom-server.vercel.app/api/users-login', { email, password });

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
            const response = await axios.post('https://ustp-eccom-server.vercel.app/api/verify-token', { token });

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

        <div className="d-flex justify-content-center">
            <section className="login-con">
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-xxl-11 d-flex justify-content-center">
                            <div className="login-box card border-light-subtle shadow-sm">



                                <div className="row g-0">


                                    <div className="col-12 col-md-6">
                                        <a href="/">
                                            <img className="img-fluid rounded-start w-100 h-100 object-fit-cover" loading="lazy" src={login_signup} alt="login-image" />
                                        </a>
                                    </div>

                                    <div className="col-gradient col-12 col-md-6 d-flex justify-content-center">
                                        <div className="col-12 col-lg-11 col-xl-10">
                                            <div className="card-body p-0">
                                                <div className="row">
                                                    <div className="col-12 mt-4">
                                                        <div className="mb-4">

                                                            <h2 className=" text-center">Login</h2>
                                                            <ToastNotification toastMessage={toastMessage} />

                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="d-flex gap-3 flex-column">

                                                            <GoogleLogin
                                                                class="d-flex btn btn-outline-danger justify-content-center align-items-center"
                                                                onSuccess={handleGoogleLogin}
                                                                onError={(error) => console.error('Google login error:', error)} // Handle error response
                                                            />

                                                        </div>
                                                        <div className="row d-flex justify-content-center align-items-center">
                                                            <div className="col"><hr></hr></div>
                                                            <div className="col-6"><p className="text-center mt-2 mb-2 text-secondary">Or Login with N&B</p></div>
                                                            <div className="col"><hr></hr></div>
                                                        </div>

                                                    </div>
                                                </div>

                                                <form onSubmit={handleSubmit} className="d-flex justify-content-center">
                                                    <div className="row gy-3 overflow-hidden d-flex justify-content-center">

                                                        <div className="col-12">
                                                            <div className="form-floating">
                                                                <input type="email" className="form-control" name="email" id="email" placeholder="name@example.com"
                                                                    value={email}
                                                                    onChange={(e) => setEmail(e.target.value)} required
                                                                />
                                                                <label htmlFor="email" className="form-label">Email</label>
                                                            </div>
                                                        </div>

                                                        <div className="col-12">
                                                            <div className="form-floating">
                                                                <input type="password" className="form-control" name="password" id="password" placeholder="name@example.com"
                                                                    value={password}
                                                                    onChange={(e) => setPassword(e.target.value)} required
                                                                />
                                                                <label htmlFor="password" className="form-label">Password</label>
                                                            </div>
                                                        </div>


                                                        <div className="col-12">
                                                            <div className="form-check d-flex justify-content-end">
                                                                {/* <input class="form-check-input" type="checkbox" value="" name="iAgree" id="iAgree" required/> */}
                                                                <a href='/forgot-password'>Forgot Password?</a>
                                                            </div>
                                                        </div>
                                                        <div className="col-12">
                                                            <div className="d-grid">
                                                                <button className="btn bsb-btn-xl btn-dark fs-5" type='submit' disabled={loading}>
                                                                    {loading ? 'Logging in...' : 'Login'}
                                                                </button>
                                                                {error && <p className='error text-danger text-center mt-2'>{error}</p>}

                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>


                                                {loginStatus && <p className='status'>{loginStatus}</p>}
                                                <div className="row mb-4">
                                                    <div className="col-12">
                                                        <p className="mb-0 mt-4 text-secondary text-center">
                                                            Not Registered Yet?{" "}
                                                            <Link to="/signup" className="link-primary text-decoration-none">
                                                                Register
                                                            </Link>
                                                        </p>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </section >

        </div >

    );
};

export default Login;
