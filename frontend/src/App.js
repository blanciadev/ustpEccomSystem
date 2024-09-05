import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from 'react';


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
      <h1>React + Express</h1>
      <p>{data}</p>
    </div>
  );
}

export default App;
