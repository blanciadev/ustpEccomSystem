import './App.css';

import React, { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import Slideshow from './components/Slideshow';


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
      <Navigation />
      <Slideshow/>
      <p>{data}</p>
    </div>
  );
}

export default App;
