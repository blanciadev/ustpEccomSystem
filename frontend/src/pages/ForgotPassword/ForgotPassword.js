import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import ToastNotification from '../../components/ToastNotification';

const RequestResetPassword = () => {
  const [email, setEmail] = useState('');
  const [toastmessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // State to manage focus
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/request-reset-password', { email });
      localStorage.setItem('resetEmail', email);
      setToastMessage(response.data.message);

            setTimeout(() => {
              setToastMessage('');
                navigate('/verify');
            }, 3000);
    } catch (error) {
      console.error('Error sending reset token:', error);
      setToastMessage('Invalid Email');

            setTimeout(() => {
              setToastMessage('');
            }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fp-con'>
      <Navigation />
      <ToastNotification toastMessage={toastmessage}/>
      <div className='fp-form'>
        <h1>Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label
              className={`floating-label ${isFocused || email ? 'focused' : ''}`}
            >
              Enter your email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Token'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestResetPassword;
