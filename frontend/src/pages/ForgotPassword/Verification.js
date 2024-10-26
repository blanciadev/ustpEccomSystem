import React, { useState, useRef } from 'react';
import './Forgot.css';
import axios from 'axios'; // To handle API requests
import { useNavigate } from 'react-router-dom'; // For navigation after successful submission
import Navigation from '../../components/Navigation';
import ToastNotification from '../../components/ToastNotification';

const Verification = () => {
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Handle input change
  const handleInputChange = (e, index) => {
    const value = e.target.value;

    // Allow only numbers
    if (/\D/.test(value)) {
      e.target.value = '';
      return;
    }

    // Update the code array
    const updatedCode = [...code];
    updatedCode[index] = value;
    setCode(updatedCode);

    // Move to the next input
    if (value !== '' && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle backspace to move to the previous input
  const handleKeyUp = (e, index) => {
    if (e.key === 'Backspace' && index > 0 && e.target.value === '') {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Retrieve the stored email
    const email = localStorage.getItem('resetEmail');
    if (!email) {
      setToastMessage('Email is missing. Please restart the reset process.');

            setTimeout(() => {
              setToastMessage('');
            }, 3000);
      setIsSubmitting(false);
      return;
    }

    // Combine the code into a single token
    const token = code.join('');
    if (token.length !== 6) {
      setToastMessage('Please enter a valid 6-digit token.');

            setTimeout(() => {
              setToastMessage('');
            }, 3000);
      setIsSubmitting(false);
      return;
    }

    try {
      // Send token to the backend for verification
      const response = await axios.post('http://localhost:5001/verify-reset-token', { email, token });

      // Handle success (redirect to reset password page or similar)
      if (response.data.success) {
        setToastMessage('Token verified successfully. Redirecting...');

            setTimeout(() => {
              setToastMessage('');
            }, 3000);
        setTimeout(() => {
          navigate('/change-password');
        }, 2000);
      } else {
        setToastMessage(response.data.message || 'Invalid token, please try again.');

            setTimeout(() => {
              setToastMessage('');
            }, 3000);
      }
    } catch (error) {
      console.error('Error during token verification:', error); // Log error for debugging
      setToastMessage('An error occurred while verifying the token. Please try again.');
      setTimeout(() => {
        setToastMessage('');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Handle resend token request
  const handleResendCode = async () => {
    try {
      const response = await axios.post('/api/resend-token');
      if (response.data.success) {
        setToastMessage('Verification code has been resent.');
        setTimeout(() => {
            setToastMessage('');
          }, 3000);
      } else {
        setToastMessage('Failed to resend code. Please try again.');
        setTimeout(() => {
            setToastMessage('');
          }, 3000);
      }
    } catch (error) {
      console.error('Error resending token:', error); // Log error for debugging
      setToastMessage('Failed to resend code. Please try again.');
      setTimeout(() => {
        setToastMessage('');
      }, 3000);
    }
  };

  return (
    <div className="ver-con">
        <Navigation/>
        <ToastNotification toastMessage={toastMessage}/>
        <div className="ver-form">
          <h1>Verification</h1>
          <div className="text-con">
            <p>We've sent a verification code to your email</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              {inputRefs.map((ref, index) => (
                <input
                  key={index}
                  ref={ref}
                  type="text"
                  maxLength={1}
                  value={code[index]}
                  onChange={(e) => handleInputChange(e, index)}
                  onKeyUp={(e) => handleKeyUp(e, index)}
                  disabled={isSubmitting} // Disable inputs while submitting
                  className={`code-input ${isSubmitting ? 'disabled' : ''}`} // Add a class for styling
                />
              ))}
            </div>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Continue'}
            </button>
          </form>
          <div className="resend-code">
            <a href="#!" onClick={handleResendCode}>
              Resend Code
            </a>
          </div>
        </div>
    </div>
  );
};

export default Verification;
