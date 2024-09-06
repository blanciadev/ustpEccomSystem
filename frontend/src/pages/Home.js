import React from 'react'
import Navigation from '../components/Navigation';
import Slideshow from '../components/Slideshow';
import Products from '../components/Products';

const Home = () => {
  return (
    <div className='home-con'>
        <Navigation />
        <Slideshow/>
        <Products/>
    </div>
  )
}

export default Home