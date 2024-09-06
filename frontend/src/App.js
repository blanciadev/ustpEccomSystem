import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';

function App() {
  const [loginStatus, setLoginStatus] = useState('');  // Store login status
  const [error, setError] = useState('');  // Store error message (if any)

  // Handle login submission
  const handleLogin = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),  // Send username and password
      });

      if (!response.ok) {
        const errorText = await response.text();  // Read error message
        throw new Error(errorText);  // Throw error
      }

      const result = await response.json();  // Parse response data

      // Handle successful login
      if (response.ok) {
        setLoginStatus('Login successful');
        console.log('Token:', result.token);  // Log received token
      } else {
        setLoginStatus(result.message);  // Set error message if not successful
      }
    } catch (error) {
      console.error('Error during login:', error);  // Log error
      setLoginStatus('Error during login');  // Display error message
    }
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login handleLogin={handleLogin} />} />  {/* Pass login handler */}
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>

      {/* Display login status message */}
      {loginStatus && <p>{loginStatus}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default App;
