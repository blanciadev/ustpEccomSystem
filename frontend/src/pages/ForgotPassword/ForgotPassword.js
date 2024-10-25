import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For navigation after successful submission


const RequestResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await axios.post('http://localhost:5001/request-reset-password', { email });
      localStorage.setItem('resetEmail', email);
      setMessage(response.data.message);
      navigate('/verify');
    } catch (error) {
      console.error('Error sending reset token:', error);
      setMessage('Wrong Email');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Token'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RequestResetPassword;
