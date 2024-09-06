import './App.css';

import React, { useEffect, useState } from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';


function App() {
  const [data, setData] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000')
      .then((response) => response.text())
      .then((text) => setData(text))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  return (
    <div className="App">
        <BrowserRouter>
            <Routes>
                <Route index element={<Home/>}/>
                <Route path='/' element={<Home/>}/>
                <Route path='/login' element={<Login/>}/>
                <Route path='/signup' element={<Signup/>}/>
                
                
            </Routes>
        </BrowserRouter>
      <p>{data}</p>
    </div>
  );
}

export default App;
