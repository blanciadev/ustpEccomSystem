import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Forgot.css';

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    // Retrieve email from local storage
    const email = localStorage.getItem('resetEmail');
    if (!email) {
      setMessage('Email is missing. Please restart the reset process.');
      return;
    }

    try {
      // Send email and new password to the backend
      const response = await axios.post('http://localhost:5001/password-reset', { email, password });

      // Handle success or error response
      if (response.data.message === 'Password updated successfully') {
        setMessage('Password successfully changed!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(response.data.message || 'Failed to update password.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="cp-con">
      <div className="cp-box">
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
            {message && <p>{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
