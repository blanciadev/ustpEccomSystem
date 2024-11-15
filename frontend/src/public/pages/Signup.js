import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../public.css';
import '../../App.css'
import start from '../../assets/start.png'

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !address || !phoneNumber || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/customer-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, address, phoneNumber, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Signup failed');
      } else {
        setSuccess(result.message);
        setFirstName('');
        setLastName('');
        setEmail('');
        setAddress('');
        setPhoneNumber('');
        setPassword('');
        setConfirmPassword('');

        navigate('/login');
      }
    } catch (error) {
      setError('Error during signup');
      console.error('Error during signup:', error);
    }
  };

  return (
    <div className='signup-con'>
      <div className='signup-box'>
        <div className='signup-image'>
          <img src={start} />

        </div>
        <div className='signup-form'>
          <h1><i class='bx bxs-spa'></i>Sign Up</h1>
          {error && <p className='error'>{error}</p>}
          {success && <p className='success'>{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className='two-column'>
              <div className='input'>
                <label>First Name</label>
                <input
                  className='inputTwo'
                  type='text'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className='input'>
                <label>Last Name</label>
                <input
                  className='inputTwo'
                  type='text'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='input'>
              <label>Email</label>
              <input
                className='inputOne'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className='input'>
              <label>Address</label>
              <input
                className='inputOne'
                type='text'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className='input'>
              <label>Phone Number</label>
              <input
                className='inputOne'
                type='text'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div className='two-column'>
              <div className='input'>
                <label>Password</label>
                <input
                  className='inputTwo'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className='input'>
                <label>Confirm Password</label>
                <input
                  className='inputTwo'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type='submit'>Sign Up</button>
          </form>

          <p>Have an account? <a href='/login'>Log In</a></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;