import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Forgot.css';
import ToastNotification from '../../components/ToastNotification';
import Navigation from '../../../client/components/Navigation';

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setToastMessage('Passwords do not match');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    // Retrieve email from local storage
    const email = localStorage.getItem('resetEmail');
    if (!email) {
      setToastMessage('Email is missing. Please restart the reset process.');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    try {
      // Send email and new password to the backend
      const response = await axios.post('https://ustp-eccom-server.vercel.app/api/password-reset', { email, password });

      // Handle success or error response
      if (response.data.message === 'Password updated successfully') {
        setToastMessage('Password successfully changed!');
        setTimeout(() => {
          setToastMessage('');
          navigate('/login');
        }, 3000);
      } else {
        setToastMessage(response.data.message || 'Failed to update password.');
        setTimeout(() => setToastMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setToastMessage('An error occurred. Please try again.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className="cp-con">
      <Navigation />
      <ToastNotification toastMessage={toastMessage} />
      <div className="cp-form">
        <h1>Change Password</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <label>New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i
              className={`bx ${showPassword ? 'bx-show' : 'bx-hide'}`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>

          <div className="input-container">
            <label>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <i
              className={`bx ${showPassword ? 'bx-show' : 'bx-hide'}`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
